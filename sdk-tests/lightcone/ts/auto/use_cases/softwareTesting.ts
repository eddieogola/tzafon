import type Lightcone from "@tzafon/lightcone/index.js";
import { example } from "@/utils/example";
import { Colors } from "@/utils/term";

const PAGE = "use-cases/software-testing";

type ResponseOutputMessage = {
  type?: string;
  content?: Array<{
    type?: string;
    text?: string;
  }>;
};

const testLoginFlow = example(
  { page: PAGE, anchor: "test-a-login-flow", title: "Testing a Login Flow" },
  async (client: Lightcone): Promise<void> => {
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
      if (event.type === "completed") {
        break;
      }
    }
  },
);

const testMultiStepWorkflow = example(
  {
    page: PAGE,
    anchor: "test-a-multi-step-workflow",
    title: "Testing a Multi-step Workflow",
  },
  async (client: Lightcone): Promise<void> => {
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
      if (event.type === "completed") {
        break;
      }
    }
  },
);

const visualVerificationWithResponsesApi = example(
  {
    page: PAGE,
    anchor: "visual-verification-with-the-responses-api",
    title: "Visual Verification with Responses API",
  },
  async (client: Lightcone): Promise<void> => {
    const computer = await client.computers.create({ kind: "desktop" });
    const id = computer.id!;
    console.log(
      `Created computer with ID: ${Colors.BLUE}${id}${Colors.RESET}\n`,
    );

    try {
      await client.computers.exec.sync(id, {
        command:
          "nohup firefox https://app.example.com > /dev/null 2>&1 & disown",
      });
      await new Promise((r) => setTimeout(r, 5000));

      const screenshot = await client.computers.screenshot(id);
      const screenshotUrl = screenshot.result?.screenshot_url as
        | string
        | undefined;
      console.log(
        `Screenshot URL: ${Colors.BLUE}${screenshotUrl}${Colors.RESET}\n`,
      );

      if (!screenshotUrl) {
        throw new Error("Missing screenshot URL");
      }

      const response = await client.responses.create({
        model: "tzafon.northstar-cua-fast-1.6",
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
                detail: "auto",
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
    } finally {
      await client.computers.delete(id);
    }
  },
);

export default async function softwareTesting(
  client: Lightcone,
): Promise<void> {
  console.log(
    `${Colors.YELLOW}*** Software Testing Use Cases ***${Colors.RESET}\n`,
  );
  // await testLoginFlow(client);
  // await testMultiStepWorkflow(client);
  await visualVerificationWithResponsesApi(client);
}
