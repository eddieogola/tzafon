import OpenAI from "openai/index.js";
import type Lightcone from "@tzafon/lightcone/index.js";
import { example } from "@/utils/example";
import {
  DISPLAY_HEIGHT,
  DISPLAY_WIDTH,
  scaleCoordinates,
  toPx,
} from "@/utils/coords";
import { Colors } from "@/utils/term";

const PAGE = "guides/coordinates";

const coordinateScalingExample = example(
  {
    page: PAGE,
    anchor: "converting-to-pixel-coordinates",
    title: "Coordinates: Scaling Example",
  },
  async (): Promise<void> => {
    const modelX = 500;
    const modelY = 500;
    const [x, y] = scaleCoordinates(modelX, modelY, DISPLAY_WIDTH, DISPLAY_HEIGHT);
    console.log(`Model (${modelX}, ${modelY}) -> Pixel (${x}, ${y})`);
  },
);

/** Coordinates always come back in 0-999 model space — denormalize before clicking. */
const responsesApiRawCoordinates = example(
  {
    page: PAGE,
    anchor: "responses-api",
    title: "Coordinates: Responses API Raw Coordinates",
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
            display_width: DISPLAY_WIDTH,
            display_height: DISPLAY_HEIGHT,
            environment: "desktop",
          },
        ],
      });

      for (const item of response.output ?? []) {
        if (item.type === "computer_call") {
          // Denormalize from 0-999 model space to pixel coordinates
          const x = toPx(item.action?.x, DISPLAY_WIDTH);
          const y = toPx(item.action?.y, DISPLAY_HEIGHT);
          await client.computers.click(id, { x, y });
          console.log(`Model coords: (${item.action?.x}, ${item.action?.y})`);
          console.log(`Clicked pixel coordinates: (${x}, ${y})`);
          break;
        }
      }
    } finally {
      await client.computers.delete(id);
    }
  },
);

const chatCompletionsFullExample = example(
  {
    page: PAGE,
    anchor: "full-example",
    title: "Coordinates: Chat Completions Full Example",
  },
  async (client: Lightcone): Promise<void> => {
    const SYSTEM_PROMPT = `You are controlling a computer through screenshots and actions.

Screen information:
- Viewport size: ${DISPLAY_WIDTH}x${DISPLAY_HEIGHT} pixels.
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
        model: "tzafon.northstar-cua-fast-1.6",
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
          const pixelX = toPx(x, DISPLAY_WIDTH);
          const pixelY = toPx(y, DISPLAY_HEIGHT);
          console.log(`Model coords: (${x}, ${y})`);
          console.log(`Pixel coords:  (${pixelX}, ${pixelY})`);
        }
      }
    } finally {
      await client.computers.delete(id);
    }
  },
);

export default async function coordinatesGuide(
  client: Lightcone,
): Promise<void> {
  console.log(
    `${Colors.YELLOW}*** Using Northstar: Coordinates ***${Colors.RESET}\n`,
  );
  await coordinateScalingExample();
  await responsesApiRawCoordinates(client);
  await chatCompletionsFullExample(client);
}

export { chatCompletionsFullExample };
