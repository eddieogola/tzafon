import Lightcone from "@tzafon/lightcone";
import { Colors } from "@/utils/term";

const TOOL = {
  type: "computer_use" as const,
  display_width: 1280,
  display_height: 800,
  environment: "browser" as const,
};

async function kernelCuaLoop(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Kernel: CUA Loop with Northstar ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/integrations/kernel/#the-cua-loop${Colors.RESET}\n`,
  );
  try {
    // @ts-ignore — optional peer dependency, install with: npm install @onkernel/sdk
    const Kernel = (await import("@onkernel/sdk")).default;
    const kernel = new Kernel();

    // Create a Kernel browser session
    const session = await kernel.browsers.create({
      stealthMode: true,
      viewport: { width: 1280, height: 800 },
    });

    // Take initial screenshot
    const pngBuffer = await kernel.browsers.computer.captureScreenshot(
      session.id,
    );
    const screenshotB64 = pngBuffer.toString("base64");

    // First request to Northstar
    let response = await client.responses.create({
      model: "tzafon.northstar-cua-fast",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Go to wikipedia.org and search for Ada Lovelace",
            },
            {
              type: "input_image",
              image_url: `data:image/png;base64,${screenshotB64}`,
            },
          ],
        },
      ],
      tools: [TOOL],
    });

    // CUA loop — up to 50 steps
    for (let step = 0; step < 50; step++) {
      const computerCall = response.output?.find(
        (o) => o.type === "computer_call",
      );
      if (!computerCall || computerCall.type !== "computer_call") break;

      const action = computerCall.action!;
      if (["terminate", "done", "answer"].includes(action.type!)) break;

      // Execute the action on Kernel's browser
      switch (action.type) {
        case "click":
          await kernel.browsers.computer.clickMouse(
            session.id,
            action.x!,
            action.y!,
          );
          break;
        case "double_click":
          await kernel.browsers.computer.clickMouse(
            session.id,
            action.x!,
            action.y!,
            {
              numClicks: 2,
            },
          );
          break;
        case "type":
          await kernel.browsers.computer.typeText(session.id, action.text!);
          break;
        case "key":
        case "keypress":
          await kernel.browsers.computer.pressKey(session.id, action.keys!);
          break;
        case "scroll":
          await kernel.browsers.computer.scroll(
            session.id,
            action.x ?? 640,
            action.y ?? 400,
            { deltaX: 0, deltaY: action.scroll_y ?? 0 },
          );
          break;
        case "drag":
          await kernel.browsers.computer.dragMouse(session.id, {
            path: [
              [action.x!, action.y!],
              [action.end_x!, action.end_y!],
            ],
          });
          break;
        default:
          console.log(`Unhandled action type: ${action.type}`);
      }

      // Screenshot and continue
      await new Promise((r) => setTimeout(r, 1000));
      const newPng = await kernel.browsers.computer.captureScreenshot(
        session.id,
      );
      const newB64 = newPng.toString("base64");

      response = await client.responses.create({
        model: "tzafon.northstar-cua-fast",
        previous_response_id: response.id!,
        input: [
          {
            type: "computer_call_output",
            call_id: computerCall.call_id!,
            output: {
              type: "input_image",
              image_url: `data:image/png;base64,${newB64}`,
            },
          },
        ],
        tools: [TOOL],
      });

      void step; // suppress unused variable warning
    }

    await kernel.browsers.delete(session.id);
  } catch (e) {
    console.error(
      `\n${Colors.RED}Error in kernel CUA loop: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

export default async function kernelIntegration(
  client: Lightcone,
): Promise<void> {
  await kernelCuaLoop(client);
}
