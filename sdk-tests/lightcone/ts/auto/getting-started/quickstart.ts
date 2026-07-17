import OpenAI from "openai/index.js";
import type Lightcone from "@tzafon/lightcone/index.js";
import { example } from "@/utils/example";

const PAGE = "guides/quickstart";

/** Section 3 — Give Northstar a task via the Tasks API. */
const quickstart = example(
  { page: PAGE, anchor: "3-give-northstar-a-task", title: "Quickstart: Give Northstar a Task" },
  async (client: Lightcone): Promise<void> => {
    const stream = await client.agent.tasks.startStream({
      instruction:
        "Go to wikipedia.org, search for 'Alan Turing', and tell me the first sentence of the article",
      kind: "browser",
    });

    for await (const event of stream) {
      console.log(event);
      if (event.type === "completed") {
        break;
      }
    }
  },
);

/** Go deeper — one-shot Responses API call with a live computer screenshot. */
const goDeeper = example(
  { page: PAGE, anchor: "go-deeper", title: "Quickstart: Go Deeper (Responses API)" },
  async (client: Lightcone): Promise<void> => {
    const computer = await client.computers.create({ kind: "desktop" });
    const id = computer.id!;

    try {
      const screenshot = await client.computers.screenshot(id);
      const screenshotUrl = screenshot.result?.screenshot_url as string;
      console.log(`Screenshot URL: ${screenshotUrl}`);
      const response: any = await client.responses.create({
        model: "tzafon.northstar-cua-fast-1.6",
        tools: [
          {
            type: "computer_use" as const,
            display_width: 1280,
            display_height: 720,
            environment: "desktop" as const,
          },
        ],
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: "Open the terminal and check disk usage",
              },
              {
                type: "input_image",
                image_url: screenshotUrl,
                detail: "auto",
              },
            ],
          },
        ],
      });

      // response.output contains a computer_call with the action Northstar chose.
      // Execute it, take a new screenshot, send it back —
      // see the CUA loop guide for the full pattern.
      for (const item of response.output ?? []) {
        if (item.type === "computer_call") {
          console.log(`Action type : ${item.action?.type}`);
          console.log(`Coordinates : (${item.action?.x}, ${item.action?.y})`);
        } else if (item.type === "message") {
          for (const block of item.content ?? []) {
            if (block?.text) {
              console.log(block.text);
            }
          }
        }
      }
    } finally {
      await client.computers.delete(id);
    }
  },
);

/** OpenAI-compatible endpoint — swap baseURL and model, nothing else changes. */
const alreadyUsingOpenAI = example(
  { page: PAGE, anchor: "already-using-openai", title: "Quickstart: Already Using OpenAI?" },
  async (): Promise<void> => {
    const oaClient = new OpenAI({
      baseURL: "https://api.tzafon.ai/v1",
      apiKey: process.env.TZAFON_API_KEY!,
    });

    const response = await oaClient.chat.completions.create({
      model: "tzafon.northstar-cua-fast-1.6",
      messages: [{ role: "user", content: "What is reinforcement learning?" }],
    });
    console.log(response.choices[0].message.content);
  },
);

export default async function quickstartGuide(
  client: Lightcone,
): Promise<void> {
  await quickstart(client);
  await goDeeper(client);
  await alreadyUsingOpenAI();
}
