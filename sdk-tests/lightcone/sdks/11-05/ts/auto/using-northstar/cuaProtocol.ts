import type Lightcone from "@tzafon/lightcone";
import { Colors } from "@/utils/term";

const TOOL = {
  type: "computer_use" as const,
  display_width: 1280,
  display_height: 720,
  environment: "desktop" as const,
};

async function executeAction(
  client: Lightcone,
  id: string,
  action: any,
): Promise<void> {
  if (action.type === "click" && action.button === "right") {
    await client.computers.rightClick(id, { x: action.x!, y: action.y! });
    return;
  }

  switch (action.type) {
    case "click":
      await client.computers.click(id, { x: action.x!, y: action.y! });
      break;
    case "double_click":
      await client.computers.doubleClick(id, { x: action.x!, y: action.y! });
      break;
    case "type":
      await client.computers.type(id, { text: action.text! });
      break;
    case "key":
    case "keypress":
      await client.computers.hotkey(id, { keys: action.keys! });
      break;
    case "scroll":
      await client.computers.scroll(id, {
        dx: 0,
        dy: action.scroll_y ?? 0,
        x: action.x ?? 640,
        y: action.y ?? 400,
      });
      break;
    case "hscroll":
      await client.computers.scroll(id, {
        dx: action.scroll_x ?? 0,
        dy: 0,
        x: action.x ?? 640,
        y: action.y ?? 400,
      });
      break;
    case "drag":
      console.log("Drag requested; skipping direct execution in this sample.");
      break;
    case "navigate":
      await client.computers.navigate(id, { url: action.url! });
      break;
    case "wait":
      await new Promise((r) => setTimeout(r, 1000));
      break;
    default:
      break;
  }
}

async function fullComputerUseLoop(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** CUA Protocol: Full Loop ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/cua-protocol/#the-full-loop${Colors.RESET}\n`,
  );

  const computer = await client.computers.create({ kind: "desktop" });
  const id = computer.id!;

  try {
    const initialScreenshot = await client.computers.screenshot(id);
    const initialUrl = initialScreenshot.result?.screenshot_url as string;

    let response: any = await client.responses.create({
      model: "tzafon.northstar-cua-fast",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Open the terminal and run 'uname -a'",
            },
            {
              type: "input_image",
              image_url: initialUrl,
              detail: "auto",
            } as any,
          ],
        },
      ],
      tools: [TOOL],
    });

    while (true) {
      const computerCall = (response.output ?? []).find(
        (item: any) => item.type === "computer_call",
      );

      for (const item of response.output ?? []) {
        if (item.type === "message") {
          for (const block of item.content ?? []) {
            if (block?.text) {
              console.log(`Northstar says: ${block.text}`);
            }
          }
        }
      }

      if (!computerCall) {
        console.log("Done.");
        break;
      }

      const action = computerCall.action;
      if (["terminate", "done", "answer"].includes(action?.type)) {
        console.log(`Terminal action: ${action?.type}`);
        break;
      }

      console.log(`Executing: ${action?.type}`);
      await executeAction(client, id, action);
      await new Promise((r) => setTimeout(r, 1000));

      const newScreenshot = await client.computers.screenshot(id);
      const newUrl = newScreenshot.result?.screenshot_url as string;

      response = await client.responses.create({
        model: "tzafon.northstar-cua-fast",
        previous_response_id: response.id,
        input: [
          {
            type: "computer_call_output",
            call_id: computerCall.call_id,
            output: {
              type: "input_image",
              image_url: newUrl,
              detail: "auto",
            } as any,
          },
        ],
        tools: [TOOL],
      });
    }
  } catch (e) {
    console.log(`\n${Colors.RED}Error in CUA loop: ${e}${Colors.RESET}\n`);
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

export default async function cuaProtocolGuide(
  client: Lightcone,
): Promise<void> {
  console.log(
    `${Colors.YELLOW}*** Using Northstar: Computer-Use Loop ***${Colors.RESET}\n`,
  );
  await fullComputerUseLoop(client);
}
