import { ComputerSession } from "@tzafon/lightcone/lib/computer-session";
import type { Lightcone } from "@tzafon/lightcone";
import { Colors } from "../../utils/term";

export async function createBrowserSession(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(`${Colors.YELLOW}*** Testing Creating Browser Session ***${Colors.RESET}\n`);
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/quickstart/#3-create-a-browser-and-take-a-screenshot${Colors.RESET}\n`,
  );

  const computer = await ComputerSession.create(client, { kind: "browser" });
  try {
    await computer.navigate("https://wikipedia.org");
    await computer.wait(2);

    const result = await computer.screenshot();
    const screenshotUrl = ComputerSession.getScreenshotUrl(result);
    console.log(`Screenshot URL: ${Colors.BLUE}${screenshotUrl}${Colors.RESET}`);
    console.log(`\n${Colors.GREEN}Browser session created successfully!${Colors.RESET}`);
  } catch (e) {
    console.log(`\n${Colors.RED}Error creating browser session: ${e}${Colors.RESET}\n`);
  } finally {
    await computer.terminate();
  }

  const endTime = Date.now();
  console.log(`Execution time: ${Colors.YELLOW}${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`);
}
