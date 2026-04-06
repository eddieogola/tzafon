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
        console.log(`Coordinates: (${item.action?.x}, ${item.action?.y})`);
        console.log(`Text: ${item.action?.text}`);
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
            { type: "input_image", image_url: screenshotUrl },
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

export default async function responsesApiGuide(
  client: Lightcone,
): Promise<void> {
  console.log(
    `${Colors.YELLOW}*** Using Northstar: Responses API ***${Colors.RESET}\n`,
  );
  await createAndProcessResponse(client);
  await multiTurnWithPreviousResponseId(client);
}
