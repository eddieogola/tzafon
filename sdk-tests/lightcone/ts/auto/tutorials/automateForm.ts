import type Lightcone from "@tzafon/lightcone/index.js";
import { Colors } from "@/utils/term";

async function startAgentWithFormInstructions(
  client: Lightcone,
): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Starting Agent with Form Instructions ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/tutorials/automate-a-form-with-ai/#step-1-start-an-agent-with-form-instructions${Colors.RESET}\n`,
  );

  try {
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
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error starting agent with form instructions: ${e}${Colors.RESET}\n`,
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
    `${Colors.YELLOW}*** Fire-and-Poll for Background Execution ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/tutorials/automate-a-form-with-ai/#step-2-use-fire-and-poll-for-background-execution${Colors.RESET}\n`,
  );

  try {
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
  } catch (e) {
    console.log(`\n${Colors.RED}Error in fire-and-poll: ${e}${Colors.RESET}\n`);
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function verifyWithManualCheck(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Verify with a Manual Check ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/tutorials/automate-a-form-with-ai/#step-3-verify-with-a-manual-check${Colors.RESET}\n`,
  );

  try {
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
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error verifying with manual check: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function steerAStuckAgent(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(`${Colors.YELLOW}*** Steer a Stuck Agent ***${Colors.RESET}\n`);
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/tutorials/automate-a-form-with-ai/#step-4-steer-a-stuck-agent${Colors.RESET}\n`,
  );

  try {
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
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error steering stuck agent: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

export default async function automateFormWithAi(
  client: Lightcone,
): Promise<void> {
  console.log(
    `${Colors.YELLOW}*** Automating Form Filling with AI ***${Colors.RESET}\n`,
  );
  await startAgentWithFormInstructions(client);
  await fireAndPoll(client);
  await verifyWithManualCheck(client);
  await steerAStuckAgent(client);
}
