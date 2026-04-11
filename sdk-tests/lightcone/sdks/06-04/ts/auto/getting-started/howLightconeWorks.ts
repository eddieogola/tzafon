import OpenAI from "openai";
import type Lightcone from "@tzafon/lightcone";
import { Colors } from "@/utils/term";

/** §1 Tasks — fully managed. Northstar runs the whole task start to finish. */
async function tasksFullyManaged(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** How Lightcone Works: Tasks (Fully Managed) ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/how-lightcone-works/#1-tasks--fully-managed${Colors.RESET}\n`,
  );

  try {
    const stream = await client.agent.tasks.startStream({
      instruction:
        "Open LibreOffice Calc, create a budget spreadsheet with categories for rent, food, and transport",
      kind: "desktop",
    });

    for await (const event of stream) {
      console.log(event);
    }
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in tasksFullyManaged: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

/** §2 Responses API — build your own loop. One Northstar call with a screenshot. */
async function responsesApiLoop(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** How Lightcone Works: Responses API Loop ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/how-lightcone-works/#2-responses-api--build-your-own-loop${Colors.RESET}\n`,
  );

  try {
    const response: any = await client.responses.create({
      model: "tzafon.northstar-cua-fast",
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
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in responsesApiLoop: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

/** §3 Computers API — direct control, no model involved. */
async function computersApiDirectControl(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** How Lightcone Works: Computers API (Direct Control) ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/how-lightcone-works/#3-computers-api--direct-control-no-model${Colors.RESET}\n`,
  );

  const computer = await client.computers.create({ kind: "desktop" });
  const id = computer.id!;

  try {
    await client.computers.exec.sync(id, {
      command: "firefox https://example.com &",
    });
    await new Promise((r) => setTimeout(r, 3000));
    await client.computers.click(id, { x: 400, y: 300 });
    await client.computers.type(id, { text: "hello" });

    const screenshot = await client.computers.screenshot(id);
    console.log(
      `Screenshot URL: ${Colors.BLUE}${screenshot.result?.screenshot_url}${Colors.RESET}`,
    );
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in computersApiDirectControl: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

/** OpenAI-compatible API — swap baseURL and model, nothing else changes. */
async function openaiCompatibleApi(): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** How Lightcone Works: OpenAI-Compatible API ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/how-lightcone-works/#openai-compatible-api${Colors.RESET}\n`,
  );

  try {
    const oaClient = new OpenAI({
      baseURL: "https://api.tzafon.ai/v1",
      apiKey: process.env.TZAFON_API_KEY!,
    });

    const response = await oaClient.chat.completions.create({
      model: "tzafon.northstar-cua-fast",
      messages: [{ role: "user", content: "What is reinforcement learning?" }],
    });
    console.log(response.choices[0].message.content);
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in openaiCompatibleApi: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

export default async function howLightconeWorksGuide(
  client: Lightcone,
): Promise<void> {
  //   await tasksFullyManaged(client);
  await responsesApiLoop(client);
  //   await computersApiDirectControl(client);
  //   await openaiCompatibleApi();
}
