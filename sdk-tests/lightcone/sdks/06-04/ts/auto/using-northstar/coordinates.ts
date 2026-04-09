import type Lightcone from "@tzafon/lightcone";
import { Colors } from "@/utils/term";

function scaleCoordinates(
  modelX: number,
  modelY: number,
  viewportWidth: number,
  viewportHeight: number,
): [number, number] {
  const x = Math.floor((modelX * (viewportWidth - 1)) / 999);
  const y = Math.floor((modelY * (viewportHeight - 1)) / 999);
  return [x, y];
}

async function coordinateScalingExample(): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Coordinates: Scaling Example ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/coordinates/#how-scaling-works${Colors.RESET}\n`,
  );

  try {
    const modelX = 500;
    const modelY = 500;
    const [x, y] = scaleCoordinates(modelX, modelY, 1280, 720);
    console.log(`Model (${modelX}, ${modelY}) -> Pixel (${x}, ${y})`);
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in coordinate scaling example: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function responsesApiScaledCoordinates(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Coordinates: Responses API Auto-scaling ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/coordinates/#which-api-scales-coordinates${Colors.RESET}\n`,
  );

  const computer = await client.computers.create({ kind: "desktop" });
  const id = computer.id!;

  try {
    const screenshot = await client.computers.screenshot(id);
    const screenshotUrl = screenshot.result?.screenshot_url as string;

    const response: any = await client.responses.create({
      model: "tzafon.northstar-cua-fast",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: "Click the search button" },
            { type: "input_image", image_url: screenshotUrl },
          ],
        },
      ],
      tools: [
        {
          type: "computer_use",
          display_width: 1280,
          display_height: 720,
          environment: "desktop",
        },
      ],
    });

    for (const item of response.output ?? []) {
      if (item.type === "computer_call") {
        await client.computers.click(id, {
          x: item.action?.x,
          y: item.action?.y,
        });
        console.log(
          `Clicked scaled pixel coordinates: (${item.action?.x}, ${item.action?.y})`,
        );
        break;
      }
    }
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in responses scaling example: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

export default async function coordinatesGuide(
  client: Lightcone,
): Promise<void> {
  console.log(
    `${Colors.YELLOW}*** Using Northstar: Coordinates ***${Colors.RESET}\n`,
  );
  await coordinateScalingExample();
  await responsesApiScaledCoordinates(client);
}
