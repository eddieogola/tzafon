import type Lightcone from "@tzafon/lightcone/index.js";
import { example } from "@/utils/example";
import { Colors } from "@/utils/term";

const PAGE = "tutorials/automate-a-form-with-ai";

const startTaskWithFormInstructions = example(
  {
    page: PAGE,
    anchor: "step-1-start-a-task-with-form-instructions",
    title: "Start a Task with Form Instructions",
  },
  async (client: Lightcone): Promise<void> => {
    const stream = await client.agent.tasks.startStream({
      instruction:
        "Go to https://httpbin.org/forms/post. " +
        "Fill in the form with these values: " +
        "Customer name: Jane Doe, " +
        "Telephone: 555-0123, " +
        "E-mail: jane@example.com, " +
        "Size: Large, " +
        "Topping: Bacon, " +
        "Topping: Cheese. " +
        "Submit the form. " +
        "You're done when you see the JSON response showing the submitted data.",
      kind: "browser",
      max_steps: 15,
    });

    for await (const event of stream) {
      console.log(`${JSON.stringify(event)}\n`);
      if (event.type === "completed") {
        break;
      }
    }
  },
);

const fireAndPoll = example(
  {
    page: PAGE,
    anchor: "step-2-use-fire-and-poll-for-background-execution",
    title: "Fire-and-Poll for Background Execution",
  },
  async (client: Lightcone): Promise<void> => {
    const task = await client.agent.tasks.start({
      instruction:
        "Go to https://httpbin.org/forms/post. " +
        "Fill in: Customer name: Jane Doe, Telephone: 555-0123. " +
        "Submit the form.",
      kind: "browser",
      max_steps: 15,
    });
    console.log(`Task started: ${Colors.YELLOW}${task.task_id}${Colors.RESET}`);

    // Wait for completion
    while (true) {
      const status = await client.agent.tasks.retrieveStatus(task.task_id!);
      console.log(`Status: ${Colors.GREEN}${status.status}${Colors.RESET}`);
      if (status.status === "completed" || status.status === "failed") {
        console.log(
          `Done! Status: ${Colors.GREEN}${status.status}${Colors.RESET}, ` +
            `exit code: ${Colors.YELLOW}${status.exit_code}${Colors.RESET}`,
        );
        break;
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
  },
);

const verifyWithManualCheck = example(
  {
    page: PAGE,
    anchor: "step-3-verify-with-a-manual-check",
    title: "Verify with a Manual Check",
  },
  async (client: Lightcone): Promise<void> => {
    // Start with persistence so we can inspect afterward
    const task = await client.agent.tasks.start({
      instruction:
        "Go to https://httpbin.org/forms/post. " +
        "Fill in: Customer name: Jane Doe, Telephone: 555-0123. " +
        "Submit the form.",
      kind: "browser",
      max_steps: 15,
      persistent: true,
    });
    console.log(`Task started: ${Colors.YELLOW}${task.task_id}${Colors.RESET}`);

    // Wait for completion
    while (true) {
      const status = await client.agent.tasks.retrieveStatus(task.task_id!);
      if (status.status === "completed" || status.status === "failed") {
        break;
      }
      await new Promise((r) => setTimeout(r, 3000));
    }

    // Inspect the final state
    const status = await client.agent.tasks.retrieveStatus(task.task_id!);
    console.log(`Status: ${Colors.GREEN}${status.status}${Colors.RESET}`);
  },
);

const steerAStuckTask = example(
  {
    page: PAGE,
    anchor: "step-4-steer-a-stuck-task",
    title: "Steer a Stuck Task",
  },
  async (client: Lightcone): Promise<void> => {
    const task = await client.agent.tasks.start({
      instruction: "Go to https://httpbin.org/forms/post and fill in the form.",
      kind: "browser",
      max_steps: 30,
    });
    console.log(`Task started: ${Colors.YELLOW}${task.task_id}${Colors.RESET}`);

    // Give it a few seconds to start
    await new Promise((r) => setTimeout(r, 8000));

    // Check if it needs help
    const status = await client.agent.tasks.retrieveStatus(task.task_id!);
    if (status.status === "running") {
      await client.agent.tasks.injectMessage(task.task_id!, {
        message:
          "For the customer name, type 'Jane Doe'. " +
          "For telephone, type '555-0123'. " +
          "Then click the Submit button.",
      });
      console.log(`${Colors.GREEN}Sent clarifying instructions${Colors.RESET}`);
    }

    // Wait for completion
    while (true) {
      const s = await client.agent.tasks.retrieveStatus(task.task_id!);
      if (s.status === "completed" || s.status === "failed") {
        console.log(
          `Done! Status: ${Colors.GREEN}${s.status}${Colors.RESET}, ` +
            `exit code: ${Colors.YELLOW}${s.exit_code}${Colors.RESET}`,
        );
        break;
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
  },
);

export default async function automateFormWithAi(
  client: Lightcone,
): Promise<void> {
  console.log(
    `${Colors.YELLOW}*** Automating Form Filling with AI ***${Colors.RESET}\n`,
  );
  await startTaskWithFormInstructions(client);
  await fireAndPoll(client);
  await verifyWithManualCheck(client);
  await steerAStuckTask(client);
}
