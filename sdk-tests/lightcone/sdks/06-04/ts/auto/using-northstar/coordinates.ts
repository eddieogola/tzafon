import OpenAI from "openai";
import type Lightcone from "@tzafon/lightcone";
import { Colors } from "@/utils/term";

function scaleCoordinates(
  modelX: number,
  modelY: number,
  viewportWidth: number,
  viewportHeight: number,
): [number, number] {
  const x = Math.floor((modelX * (viewportWidth - 1)) / 999);
  const y = Math.floor((modelY * (viewportHeight - 1)) / 999);
  return [x, y];
}

async function coordinateScalingExample(): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Coordinates: Scaling Example ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/coordinates/#how-scaling-works${Colors.RESET}\n`,
  );

  try {
    const modelX = 500;
    const modelY = 500;
    const [x, y] = scaleCoordinates(modelX, modelY, 1280, 720);
    console.log(`Model (${modelX}, ${modelY}) -> Pixel (${x}, ${y})`);
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in coordinate scaling example: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function responsesApiScaledCoordinates(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Coordinates: Responses API Auto-scaling ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/coordinates/#which-api-scales-coordinates${Colors.RESET}\n`,
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
            { type: "input_text", text: "Click the search button" },
            {
              type: "input_image",
              image_url: screenshotUrl,
              detail: "auto",
            } as any,
          ],
        },
      ],
      tools: [
        {
          type: "computer_use",
          display_width: 1280,
          display_height: 720,
          environment: "desktop",
        },
      ],
    });

    for (const item of response.output ?? []) {
      if (item.type === "computer_call") {
        await client.computers.click(id, {
          x: item.action?.x,
          y: item.action?.y,
        });
        console.log(
          `Clicked scaled pixel coordinates: (${item.action?.x}, ${item.action?.y})`,
        );
        break;
      }
    }
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in responses scaling example: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function chatCompletionsFullExample(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Coordinates: Chat Completions Full Example ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/coordinates/#full-example${Colors.RESET}\n`,
  );

  const VIEWPORT_WIDTH = 1280;
  const VIEWPORT_HEIGHT = 720;

  const SYSTEM_PROMPT = `You are controlling a computer through screenshots and actions.

Screen information:
- Viewport size: ${VIEWPORT_WIDTH}x${VIEWPORT_HEIGHT} pixels.
- Coordinates range from (0,0) at the top-left to (999,999) at the bottom-right.
- All coordinate values must be integers between 0 and 999 inclusive.

When clicking or interacting with elements:
- Look at the screenshot to find the element's position.
- Return coordinates in the 0-999 range. Your code will convert them to pixel coordinates.
- Click elements in their CENTER, not on edges.`;

  const computer = await client.computers.create({ kind: "desktop" });
  const id = computer.id!;

  try {
    const oai = new OpenAI({
      baseURL: "https://api.tzafon.ai/v1",
      apiKey: process.env.TZAFON_API_KEY,
    });

    const screenshot = await client.computers.screenshot(id);
    const screenshotUrl = screenshot.result?.screenshot_url as string;

    const result = await oai.chat.completions.create({
      model: "tzafon.northstar-cua-fast",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Click the search button" },
            { type: "image_url", image_url: { url: screenshotUrl } },
          ],
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "click",
            description: "Click at screen coordinates (0-999 range).",
            parameters: {
              type: "object",
              properties: {
                x: {
                  type: "integer",
                  description: "X position (0=left edge, 999=right edge)",
                },
                y: {
                  type: "integer",
                  description: "Y position (0=top edge, 999=bottom edge)",
                },
              },
              required: ["x", "y"],
            },
          },
        },
      ],
    });

    for (const choice of result.choices) {
      for (const toolCall of choice.message.tool_calls ?? []) {
        const args = JSON.parse((toolCall as any).function.arguments);
        const x = parseInt(String(args.x), 10);
        const y = parseInt(String(args.y), 10);
        const pixelX = Math.floor((x / 1000) * VIEWPORT_WIDTH);
        const pixelY = Math.floor((y / 1000) * VIEWPORT_HEIGHT);
        console.log(`Model coords: (${x}, ${y})`);
        console.log(`Pixel coords:  (${pixelX}, ${pixelY})`);
      }
    }
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in chat completions full example: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

export default async function coordinatesGuide(
  client: Lightcone,
): Promise<void> {
  console.log(
    `${Colors.YELLOW}*** Using Northstar: Coordinates ***${Colors.RESET}\n`,
  );
  await coordinateScalingExample();
  await responsesApiScaledCoordinates(client);
  await chatCompletionsFullExample(client);
}

export { chatCompletionsFullExample };
