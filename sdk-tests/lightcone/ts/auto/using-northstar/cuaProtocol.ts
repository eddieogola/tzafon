import type Lightcone from "@tzafon/lightcone/index.js";
import { example } from "@/utils/example";
import { DISPLAY_HEIGHT, DISPLAY_WIDTH, toPx } from "@/utils/coords";
import { Colors } from "@/utils/term";

const PAGE = "guides/cua-protocol";

const WIDTH = DISPLAY_WIDTH;
const HEIGHT = DISPLAY_HEIGHT;

const TOOL = {
  type: "computer_use",
  display_width: WIDTH,
  display_height: HEIGHT,
  environment: "desktop",
};

/** Execute one action, converting 0-999 grid coordinates to pixels. */
async function executeAction(
  client: Lightcone,
  id: string,
  action: any,
): Promise<void> {
  const x = action.x != null ? toPx(action.x, WIDTH) : Math.floor(WIDTH / 2);
  const y = action.y != null ? toPx(action.y, HEIGHT) : Math.floor(HEIGHT / 2);

  if (action.type === "click" && action.button === "right") {
    await client.computers.rightClick(id, { x, y });
    return;
  }

  switch (action.type) {
    case "click":
      await client.computers.click(id, { x, y });
      break;
    case "double_click":
      await client.computers.doubleClick(id, { x, y });
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
        dy: toPx(action.scroll_y ?? 0, HEIGHT),
        x,
        y,
      });
      break;
    case "hscroll":
      await client.computers.scroll(id, {
        dx: toPx(action.scroll_x ?? 0, WIDTH),
        dy: 0,
        x,
        y,
      });
      break;
    case "drag":
      await client.computers.drag(id, {
        x1: x,
        y1: y,
        x2: toPx(action.end_x, WIDTH),
        y2: toPx(action.end_y, HEIGHT),
      });
      break;
    case "navigate":
      await client.computers.navigate(id, { url: action.url! });
      break;
    case "wait":
      await new Promise((r) => setTimeout(r, 2000));
      break;
    default:
      break;
  }
}

const fullComputerUseLoop = example(
  { page: PAGE, anchor: "the-full-loop", title: "CUA Protocol: Full Loop" },
  async (client: Lightcone): Promise<void> => {
    const computer = await client.computers.create({ kind: "desktop" });
    const id = computer.id!;

    try {
      const initialScreenshot = await client.computers.screenshot(id);
      const initialUrl = initialScreenshot.result?.screenshot_url as string;

      let response: any = await client.responses.create({
        model: "tzafon.northstar-cua-fast-1.6",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: "Open browser and go to wikipedia.org. Search for 'Python programming language' and summarize the first paragraph of the article.",
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
        console.log(`Executing: ${action?.type}`);

        if (action?.type === "terminate") {
          console.log(`${action.status}: ${action.result}`);
          break;
        }
        if (action?.type === "answer") {
          console.log(`Answer: ${action.result}`);
          break;
        }
        if (action?.type === "done") {
          console.log(`Done: ${action.text}`);
          break;
        }

        await executeAction(client, id, action);
        await new Promise((r) => setTimeout(r, 1000));

        const newScreenshot = await client.computers.screenshot(id);
        const newUrl = newScreenshot.result?.screenshot_url as string;
        console.log(`New screenshot URL: ${newUrl}`);
        response = await client.responses.create({
          model: "tzafon.northstar-cua-fast-1.6",
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
    } finally {
      await client.computers.delete(id);
    }
  },
);

export default async function cuaProtocolGuide(
  client: Lightcone,
): Promise<void> {
  console.log(
    `${Colors.YELLOW}*** Using Northstar: Computer-Use Loop ***${Colors.RESET}\n`,
  );
  await fullComputerUseLoop(client);
}
