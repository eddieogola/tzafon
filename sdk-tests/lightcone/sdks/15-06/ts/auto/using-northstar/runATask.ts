import type Lightcone from "@tzafon/lightcone/index.js";
import { Colors } from "@/utils/term";

async function startTaskWithStreaming(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(`${Colors.YELLOW}*** Run a Task: Streaming ***${Colors.RESET}\n`);
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/run-a-task/#start-a-task-with-streaming${Colors.RESET}\n`,
  );

  try {
    const stream = await client.agent.tasks.startStream({
      instruction:
        "Open the file manager, navigate to /home, and list the contents. Then open the terminal and run 'uname -a'.",
      kind: "desktop",
      model: "tzafon.northstar-cua-fast",
      max_steps: 20,
    });

    for await (const event of stream) {
      if (event.type === "completed") {
        break;
      }
      console.log(event);
    }
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in streaming run-a-task: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function fireAndPoll(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Run a Task: Fire and Poll ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/run-a-task/#fire-and-poll${Colors.RESET}\n`,
  );

  try {
    const task = await client.agent.tasks.start({
      instruction: "Open the browser and navigate to https://www.wikipedia.org",
      kind: "desktop",
    });
    console.log(`Task started: ${Colors.YELLOW}${task.task_id}${Colors.RESET}`);

    while (true) {
      const status = await client.agent.tasks.retrieveStatus(task.task_id!);
      console.log(`Status: ${status.status}`);
      console.log(status);
      if (status.status === "completed" || status.status === "failed") {
        console.log(`Exit code: ${status.exit_code}`);
        break;
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in fire-and-poll example: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function steerMidTask(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Run a Task: Steer Mid-task ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/run-a-task/#steer-mid-task${Colors.RESET}\n`,
  );

  try {
    const task = await client.agent.tasks.start({
      instruction: "Research the latest AI news using Firefox",
      kind: "desktop",
    });

    await new Promise((r) => setTimeout(r, 5000));
    await client.agent.tasks.injectMessage(task.task_id!, {
      message:
        "Actually, focus specifically on news about large language models",
    });
    console.log(`${Colors.GREEN}Steering message injected${Colors.RESET}`);

    await client.agent.tasks.pause(task.task_id!);
    console.log("Task paused");
    await new Promise((r) => setTimeout(r, 1000));
    await client.agent.tasks.resume(task.task_id!);
    console.log("Task resumed");
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in steer-mid-task example: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

export default async function runATaskGuide(client: Lightcone): Promise<void> {
  console.log(
    `${Colors.YELLOW}*** Using Northstar: Run a Task ***${Colors.RESET}\n`,
  );
  await startTaskWithStreaming(client);
  await fireAndPoll(client);
  await steerMidTask(client);
}
