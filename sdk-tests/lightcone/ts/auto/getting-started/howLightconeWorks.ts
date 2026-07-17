import OpenAI from "openai/index.js";
import type Lightcone from "@tzafon/lightcone/index.js";
import { example } from "@/utils/example";
import { Colors } from "@/utils/term";

const PAGE = "guides/how-lightcone-works";

/** §1 Tasks — fully managed. Northstar runs the whole task start to finish. */
const tasksFullyManaged = example(
  {
    page: PAGE,
    anchor: "1-tasks-fully-managed",
    title: "How Lightcone Works: Tasks (Fully Managed)",
  },
  async (client: Lightcone): Promise<void> => {
    const stream = await client.agent.tasks.startStream({
      instruction:
        "Open LibreOffice Calc, create a budget spreadsheet with categories for rent, food, and transport",
      kind: "desktop",
    });

    for await (const event of stream) {
      console.log(event);
    }
  },
);

/** §2 Responses API — build your own loop. One Northstar call with a screenshot. */
const responsesApiLoop = example(
  {
    page: PAGE,
    anchor: "2-responses-api-build-your-own-loop",
    title: "How Lightcone Works: Responses API Loop",
  },
  async (client: Lightcone): Promise<void> => {
    const response: any = await client.responses.create({
      model: "tzafon.northstar-cua-fast-1.6",
      input: "Open the terminal and check disk usage",
      tools: [
        { type: "computer_use" as const, environment: "desktop" as const },
      ],
    });

    // Execute the action, screenshot, send back, repeat
    for (const item of response.output ?? []) {
      if (item.type === "computer_call") {
        console.log(`Action type : ${item.action?.type}`);
        console.log(`Keys : ${item.action?.keys?.join(", ")}`);
      } else if (item.type === "message") {
        for (const block of item.content ?? []) {
          if (block?.text) console.log(block.text);
        }
      }
    }
  },
);

/** §3 Computers API — direct control, no model involved. */
const computersApiDirectControl = example(
  {
    page: PAGE,
    anchor: "3-computers-api-direct-control-no-model",
    title: "How Lightcone Works: Computers API (Direct Control)",
  },
  async (client: Lightcone): Promise<void> => {
    const computer = await client.computers.create({ kind: "desktop" });
    const id = computer.id!;

    try {
      await client.computers.exec.sync(id, {
        command: "nohup firefox https://example.com > /dev/null 2>&1 &",
      });
      await new Promise((r) => setTimeout(r, 3000));
      await client.computers.click(id, { x: 400, y: 300 });
      await client.computers.type(id, { text: "hello" });

      const screenshot = await client.computers.screenshot(id);
      console.log(
        `Screenshot URL: ${Colors.BLUE}${screenshot.result?.screenshot_url}${Colors.RESET}`,
      );
    } finally {
      await client.computers.delete(id);
    }
  },
);

/** OpenAI-compatible API — swap baseURL and model, nothing else changes. */
const openaiCompatibleApi = example(
  {
    page: PAGE,
    anchor: "openai-compatible-api",
    title: "How Lightcone Works: OpenAI-Compatible API",
  },
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

export default async function howLightconeWorksGuide(
  client: Lightcone,
): Promise<void> {
  await tasksFullyManaged(client);
  await responsesApiLoop(client);
  await computersApiDirectControl(client);
  await openaiCompatibleApi();
}
