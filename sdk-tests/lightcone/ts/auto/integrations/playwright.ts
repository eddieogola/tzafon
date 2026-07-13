import Lightcone from "@tzafon/lightcone/index.js";
import { chromium } from "playwright";
import { Colors } from "@/utils/term";

async function playwrightBrowserAutomation(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Playwright: Browser Automation via CDP ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/integrations/playwright/#example${Colors.RESET}\n`,
  );
  try {
    const session = await client.computers.create({ kind: "browser" });

    // Build the full CDP URL from the relative endpoint path
    const cdpPath = session.endpoints?.cdp; // e.g. "/computers/comp_xxx/cdp"
    const cdpUrl = `https://api.tzafon.ai${cdpPath}`;

    const browser = await chromium.connectOverCDP(cdpUrl, {
      headers: {
        Authorization: `Bearer ${process.env.TZAFON_API_KEY}`,
      },
    });

    const page = browser.contexts()[0].pages()[0];

    // Use the full Playwright API against an automation-friendly page.
    // Note: search engines (DuckDuckGo/Google/Bing) serve a bot CAPTCHA to the
    // remote browser's datacenter IP, so their result selectors never resolve.
    // TodoMVC is stable and bot-friendly, and still exercises fill + submit +
    // waiting for rendered content.
    await page.goto("https://demo.playwright.dev/todomvc/");
    await page.fill(".new-todo", "hello world");
    await page.press(".new-todo", "Enter");

    await page.waitForSelector(".todo-list li");
    const content = await page.innerText(".todo-list");
    console.log(content.slice(0, 500));

    await browser.close();
    await client.computers.delete(session.id!);
  } catch (e) {
    console.error(
      `\n${Colors.RED}Error in playwright example: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

export default async function playwrightIntegration(
  client: Lightcone,
): Promise<void> {
  await playwrightBrowserAutomation(client);
}
