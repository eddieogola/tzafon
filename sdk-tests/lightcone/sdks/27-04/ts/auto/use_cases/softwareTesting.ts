import type Lightcone from "@tzafon/lightcone";
import { Colors } from "@/utils/term";

type ResponseOutputMessage = {
  type?: string;
  content?: Array<{
    type?: string;
    text?: string;
  }>;
};

async function testLoginFlow(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(`${Colors.YELLOW}*** Testing a Login Flow ***${Colors.RESET}\n`);
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/use-cases/software-testing/#test-a-login-flow${Colors.RESET}\n`,
  );

  try {
    const stream = await client.agent.tasks.startStream({
      instruction:
        "Go to https://app.example.com/login. " +
        "Enter username 'testuser@example.com' and password 'test123'. " +
        "Click the login button. " +
        "Verify that the dashboard loads and shows a welcome message. " +
        "If login fails, report the error message you see.",
      kind: "desktop",
      max_steps: 15,
    });

    for await (const event of stream) {
      console.log(event);
    }
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error testing login flow: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function testMultiStepWorkflow(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Testing a Multi-step Workflow ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/use-cases/software-testing/#test-a-multi-step-workflow${Colors.RESET}\n`,
  );

  try {
    const stream = await client.agent.tasks.startStream({
      instruction:
        "Go to https://app.example.com. Log in with 'admin@example.com' / 'admin123'. " +
        "Navigate to Settings > Billing. " +
        "Verify that the current plan shows 'Pro'. " +
        "Click 'Update Payment Method'. " +
        "Verify that the payment form loads with credit card fields visible. " +
        "Do NOT submit the form - just confirm the form is present and functional.",
      kind: "desktop",
      max_steps: 30,
    });

    for await (const event of stream) {
      console.log(event);
    }
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error testing multi-step workflow: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function visualVerificationWithResponsesApi(
  client: Lightcone,
): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Visual Verification with Responses API ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/use-cases/software-testing/#visual-verification-with-the-responses-api${Colors.RESET}\n`,
  );

  const computer = await client.computers.create({ kind: "desktop" });
  const id = computer.id!;

  try {
    await client.computers.exec.sync(id, {
      command: "firefox https://app.example.com &",
    });
    await new Promise((r) => setTimeout(r, 5000));

    const screenshot = await client.computers.screenshot(id);
    const screenshotUrl = screenshot.result?.screenshot_url as
      | string
      | undefined;

    if (!screenshotUrl) {
      throw new Error("Missing screenshot URL");
    }

    console.log(
      `Screenshot URL: ${Colors.BLUE}${screenshotUrl}${Colors.RESET}\n`,
    );

    const response = await client.responses.create({
      model: "tzafon.northstar-cua-fast",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                "Does this page look correct? Check for: " +
                "1) Logo is visible " +
                "2) Navigation bar has Home, Products, About links " +
                "3) No error messages or broken images. " +
                "Report any issues.",
            },
            {
              type: "input_image",
              image_url: screenshotUrl,
            },
          ],
        },
      ],
    });

    const output = (response.output ?? []) as ResponseOutputMessage[];
    for (const item of output) {
      if (item.type !== "message") {
        continue;
      }

      for (const block of item.content ?? []) {
        if (block.type === "output_text" && block.text) {
          console.log(block.text);
        }
      }
    }
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in visual verification with responses API: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

export default async function softwareTesting(
  client: Lightcone,
): Promise<void> {
  console.log(
    `${Colors.YELLOW}*** Software Testing Use Cases ***${Colors.RESET}\n`,
  );
  await testLoginFlow(client);
  await testMultiStepWorkflow(client);
  await visualVerificationWithResponsesApi(client);
}
