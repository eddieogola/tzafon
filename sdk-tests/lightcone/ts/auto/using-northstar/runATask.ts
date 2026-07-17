import type Lightcone from "@tzafon/lightcone/index.js";
import { example } from "@/utils/example";
import { Colors } from "@/utils/term";

const PAGE = "guides/run-a-task";

const startTaskWithStreaming = example(
  {
    page: PAGE,
    anchor: "start-a-task-with-streaming",
    title: "Run a Task: Streaming",
  },
  async (client: Lightcone): Promise<void> => {
    const stream = await client.agent.tasks.startStream({
      instruction:
        "Open the file manager, navigate to /home, and list the contents. Then open the terminal and run 'uname -a'.",
      kind: "desktop",
      model: "tzafon.northstar-cua-fast-1.6",
      max_steps: 20,
    });

    for await (const event of stream) {
      if (event.type === "completed") {
        break;
      }
      console.log(event);
    }
  },
);

const fireAndPoll = example(
  { page: PAGE, anchor: "fire-and-poll", title: "Run a Task: Fire and Poll" },
  async (client: Lightcone): Promise<void> => {
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
  },
);

const steerMidTask = example(
  { page: PAGE, anchor: "steer-mid-task", title: "Run a Task: Steer Mid-task" },
  async (client: Lightcone): Promise<void> => {
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
  },
);

export default async function runATaskGuide(client: Lightcone): Promise<void> {
  console.log(
    `${Colors.YELLOW}*** Using Northstar: Run a Task ***${Colors.RESET}\n`,
  );
  await startTaskWithStreaming(client);
  await fireAndPoll(client);
  await steerMidTask(client);
}
