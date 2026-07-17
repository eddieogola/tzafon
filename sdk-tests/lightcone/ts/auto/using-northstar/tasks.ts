import type Lightcone from "@tzafon/lightcone/index.js";
import { example } from "@/utils/example";
import { Colors } from "@/utils/term";

const PAGE = "guides/tasks";

const startTaskStreaming = example(
  { page: PAGE, anchor: "operations", title: "Tasks: Start a Task (Streaming)" },
  async (client: Lightcone): Promise<void> => {
    const stream = await client.agent.tasks.startStream({
      instruction:
        "Open Firefox, go to Wikipedia, search for 'machine learning', and summarize the first paragraph",
      kind: "desktop",
    });

    for await (const event of stream) {
      console.log(event);
      if (event.type === "completed") {
        break;
      }
    }
  },
);

const asyncTaskWithStatusAndControls = example(
  { page: PAGE, anchor: "operations", title: "Tasks: Async + Status + Controls" },
  async (client: Lightcone): Promise<void> => {
    const task = await client.agent.tasks.start({
      instruction:
        "Open the terminal, check disk usage with df -h, and take a screenshot of the results",
      kind: "desktop",
    });
    console.log(`Task started: ${Colors.YELLOW}${task.task_id}${Colors.RESET}`);

    await new Promise((r) => setTimeout(r, 3000));
    await client.agent.tasks.injectMessage(task.task_id!, {
      message: "Focus on the top 3 mounted filesystems only.",
    });
    console.log(`${Colors.GREEN}Injected guidance message${Colors.RESET}`);

    await client.agent.tasks.pause(task.task_id!);
    console.log(`${Colors.YELLOW}Task paused${Colors.RESET}`);
    await new Promise((r) => setTimeout(r, 1000));
    await client.agent.tasks.resume(task.task_id!);
    console.log(`${Colors.GREEN}Task resumed${Colors.RESET}`);

    for (let i = 0; i < 10; i++) {
      const status = await client.agent.tasks.retrieveStatus(task.task_id!);
      console.log(`Status: ${status.status}, exit code: ${status.exit_code}`);
      if (status.status === "completed" || status.status === "failed") {
        break;
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
  },
);

export default async function tasksGuide(client: Lightcone): Promise<void> {
  console.log(
    `${Colors.YELLOW}*** Using Northstar: Tasks ***${Colors.RESET}\n`,
  );
  await startTaskStreaming(client);
  await asyncTaskWithStatusAndControls(client);
}
