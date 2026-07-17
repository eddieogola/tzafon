import type Lightcone from "@tzafon/lightcone/index.js";
import { example } from "@/utils/example";
import { Colors } from "@/utils/term";

const PAGE = "guides/responses-api";

const TOOL = {
  type: "computer_use" as const,
  display_width: 1280,
  display_height: 720,
  environment: "desktop" as const,
};

const createAndProcessResponse = example(
  {
    page: PAGE,
    anchor: "create-a-response",
    title: "Responses API: Create + Process Output",
  },
  async (client: Lightcone): Promise<void> => {
    const response: any = await client.responses.create({
      model: "tzafon.northstar-cua-fast-1.6",
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
  },
);

const extractingInformation = example(
  {
    page: PAGE,
    anchor: "extracting-information",
    title: "Responses API: Extracting Information",
  },
  async (client: Lightcone): Promise<void> => {
    const tool = {
      type: "computer_use" as const,
      display_width: 1280,
      display_height: 720,
      environment: "browser" as const,
    };

    const computer = await client.computers.create({ kind: "browser" });
    const id = computer.id!;

    try {
      await client.computers.navigate(id, {
        url: "https://example.com/pricing",
      });
      await new Promise((r) => setTimeout(r, 3000));

      // --- Phase 1: Explore WITH tools (agent scrolls, dismisses popups, etc.) ---
      let screenshot = await client.computers.screenshot(id);
      let screenshotUrl = screenshot.result?.screenshot_url as string;

      let response: any = await client.responses.create({
        model: "tzafon.northstar-cua-fast-1.6",
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
          model: "tzafon.northstar-cua-fast-1.6",
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
        model: "tzafon.northstar-cua-fast-1.6",
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
    } finally {
      await client.computers.delete(id);
    }
  },
);

const multiTurnWithPreviousResponseId = example(
  {
    page: PAGE,
    anchor: "multi-turn-chaining",
    title: "Responses API: Multi-turn Chaining",
  },
  async (client: Lightcone): Promise<void> => {
    const computer = await client.computers.create({ kind: "desktop" });
    const id = computer.id!;

    try {
      const screenshot = await client.computers.screenshot(id);
      const screenshotUrl = screenshot.result?.screenshot_url as string;
      const response: any = await client.responses.create({
        model: "tzafon.northstar-cua-fast-1.6",
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
        model: "tzafon.northstar-cua-fast-1.6",
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
    } finally {
      await client.computers.delete(id);
    }
  },
);

const systemInstructions = example(
  {
    page: PAGE,
    anchor: "system-instructions",
    title: "Responses API: System Instructions",
  },
  async (client: Lightcone): Promise<void> => {
    const response: any = await client.responses.create({
      model: "tzafon.northstar-cua-fast-1.6",
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
  },
);

const manageResponses = example(
  {
    page: PAGE,
    anchor: "manage-responses",
    title: "Responses API: Manage Responses",
  },
  async (client: Lightcone): Promise<void> => {
    // Create a response to work with
    const response: any = await client.responses.create({
      model: "tzafon.northstar-cua-fast-1.6",
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
    await client.responses.cancel(response.id);
    console.log(
      `Cancelled response: ${Colors.YELLOW}${response.id}${Colors.RESET}`,
    );
  },
);

export default async function responsesApiGuide(
  client: Lightcone,
): Promise<void> {
  console.log(
    `${Colors.YELLOW}*** Using Northstar: Responses API ***${Colors.RESET}\n`,
  );
  await createAndProcessResponse(client);
  await extractingInformation(client);
  await multiTurnWithPreviousResponseId(client);
  await systemInstructions(client);
  await manageResponses(client);
}
