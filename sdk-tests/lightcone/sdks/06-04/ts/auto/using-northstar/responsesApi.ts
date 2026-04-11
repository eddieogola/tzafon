import type Lightcone from "@tzafon/lightcone";
import { Colors } from "@/utils/term";

const TOOL = {
  type: "computer_use" as const,
  display_width: 1280,
  display_height: 720,
  environment: "desktop" as const,
};

async function createAndProcessResponse(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Responses API: Create + Process Output ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/responses-api/#create-a-response${Colors.RESET}\n`,
  );

  try {
    const response: any = await client.responses.create({
      model: "tzafon.northstar-cua-fast",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Open the terminal and check disk usage",
            },
          ],
        },
      ],
      tools: [TOOL],
    });

    for (const item of response.output ?? []) {
      if (item.type === "computer_call") {
        console.log(`Action: ${item.action?.type}`);
        console.log(`Keys: ${item.action?.keys?.join(", ")}`);
      } else if (item.type === "message") {
        for (const block of item.content ?? []) {
          if (block?.text) {
            console.log(block.text);
          }
        }
      }
    }
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error creating response: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function extractingInformation(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Responses API: Extracting Information ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/responses-api/#extracting-information${Colors.RESET}\n`,
  );

  const tool = {
    type: "computer_use" as const,
    display_width: 1280,
    display_height: 720,
    environment: "browser" as const,
  };

  const computer = await client.computers.create({ kind: "browser" });
  const id = computer.id!;

  try {
    await client.computers.navigate(id, { url: "https://example.com/pricing" });
    await new Promise((r) => setTimeout(r, 3000));

    // --- Phase 1: Explore WITH tools (agent scrolls, dismisses popups, etc.) ---
    let screenshot = await client.computers.screenshot(id);
    let screenshotUrl = screenshot.result?.screenshot_url as string;

    let response: any = await client.responses.create({
      model: "tzafon.northstar-cua-fast",
      tools: [tool],
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Scroll down slowly. Dismiss any popups. Stop when you can see pricing details.",
            } as any,
            {
              type: "input_image",
              image_url: screenshotUrl,
              detail: "auto",
            } as any,
          ],
        },
      ] as any,
    });

    for (let step = 0; step < 10; step++) {
      const computerCall = (response.output ?? []).find(
        (item: any) => item.type === "computer_call",
      );
      if (!computerCall) break;

      const action = computerCall.action!;
      if (["terminate", "done", "answer"].includes(action.type!)) break;

      // Execute the action — see the CUA protocol guide for the full action switch
      await new Promise((r) => setTimeout(r, 1000));
      screenshot = await client.computers.screenshot(id);
      screenshotUrl = screenshot.result?.screenshot_url as string;

      response = await client.responses.create({
        model: "tzafon.northstar-cua-fast",
        previous_response_id: response.id,
        tools: [tool],
        input: [
          {
            type: "computer_call_output",
            call_id: computerCall.call_id!,
            output: {
              type: "input_image",
              image_url: screenshotUrl,
              detail: "auto",
            } as any,
          },
        ] as any,
      });
    }

    // --- Phase 2: Extract WITHOUT tools (forces a text response) ---
    screenshot = await client.computers.screenshot(id);
    screenshotUrl = screenshot.result?.screenshot_url as string;

    const extraction: any = await client.responses.create({
      model: "tzafon.northstar-cua-fast",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "What is the price shown on this page? Reply with just the dollar amount.",
            } as any,
            {
              type: "input_image",
              image_url: screenshotUrl,
              detail: "auto",
            } as any,
          ],
        },
      ] as any,
      // No tools — the model MUST respond with text, not actions
    });

    for (const item of extraction.output ?? []) {
      if (item.type === "message") {
        for (const block of item.content ?? []) {
          if (block?.text) console.log(block.text); // e.g., "$29.99"
        }
      }
    }
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in extractingInformation: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function multiTurnWithPreviousResponseId(
  client: Lightcone,
): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Responses API: Multi-turn Chaining ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/responses-api/#multi-turn-chaining${Colors.RESET}\n`,
  );

  const computer = await client.computers.create({ kind: "desktop" });
  const id = computer.id!;

  try {
    const screenshot = await client.computers.screenshot(id);
    const screenshotUrl = screenshot.result?.screenshot_url as string;
    const response: any = await client.responses.create({
      model: "tzafon.northstar-cua-fast",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: "Open the file manager" },
            { type: "input_image", image_url: screenshotUrl, detail: "auto" },
          ],
        },
      ],
      tools: [TOOL],
    });

    console.log(`Initial response status: ${response}`);

    const computerCall = (response.output ?? []).find(
      (item: any) => item.type === "computer_call",
    );

    if (!computerCall) {
      console.log("No computer_call received; stopping chain example.");
      return;
    }

    const nextScreenshot = await client.computers.screenshot(id);
    const nextUrl = nextScreenshot.result?.screenshot_url as string;
    const followup = await client.responses.create({
      model: "tzafon.northstar-cua-fast",
      previous_response_id: response.id,
      input: [
        {
          type: "computer_call_output",
          call_id: computerCall.call_id,
          output: { type: "input_image", image_url: nextUrl },
        },
      ],
      tools: [TOOL],
    });

    console.log(`Follow-up response status: ${followup.status}`);
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in multi-turn chain: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function systemInstructions(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Responses API: System Instructions ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/responses-api/#system-instructions${Colors.RESET}\n`,
  );

  try {
    const response: any = await client.responses.create({
      model: "tzafon.northstar-cua-fast",
      instructions:
        "You are operating a desktop computer. Be careful and verify each action before proceeding.",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Find the system settings and check the display resolution",
            } as any,
          ],
        },
      ] as any,
      tools: [
        {
          type: "computer_use" as const,
          display_width: 1280,
          display_height: 720,
          environment: "desktop" as const,
        },
      ],
    });

    for (const item of response.output ?? []) {
      if (item.type === "computer_call") {
        console.log(`Action: ${item.action?.type}`);
      } else if (item.type === "message") {
        for (const block of item.content ?? []) {
          if (block?.text) console.log(block.text);
        }
      }
    }
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in systemInstructions: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function manageResponses(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Responses API: Manage Responses ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/responses-api/#manage-responses${Colors.RESET}\n`,
  );

  try {
    // Create a response to work with
    const response: any = await client.responses.create({
      model: "tzafon.northstar-cua-fast",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Open the terminal and check disk usage",
            } as any,
          ],
        },
      ] as any,
      tools: [TOOL],
    });
    console.log(
      `Created response: ${Colors.YELLOW}${response.id}${Colors.RESET}`,
    );

    // Retrieve a response
    const retrieved = await client.responses.retrieve(response.id);
    console.log(`Status: ${Colors.GREEN}${retrieved.status}${Colors.RESET}`);

    // Cancel an in-progress response (may already be completed here)
    // await client.responses.cancel(response.id);

    // Delete a response
    await client.responses.delete(response.id);
    console.log(
      `Deleted response: ${Colors.YELLOW}${response.id}${Colors.RESET}`,
    );
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in manageResponses: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

export default async function responsesApiGuide(
  client: Lightcone,
): Promise<void> {
  console.log(
    `${Colors.YELLOW}*** Using Northstar: Responses API ***${Colors.RESET}\n`,
  );
  // await createAndProcessResponse(client);
  // await extractingInformation(client);
  await multiTurnWithPreviousResponseId(client);
  // await systemInstructions(client);
  // await manageResponses(client);
}
