import Lightcone from "@tzafon/lightcone/index.js";
import { example } from "@/utils/example";
import { Colors } from "@/utils/term";

const PAGE = "guides/operate-a-computer";

const URL = "https://wikipedia.org";

const fullExample = example(
  { page: PAGE, anchor: "the-full-example", title: "Full Example" },
  async (client: Lightcone): Promise<void> => {
    const computer = await client.computers.create({ kind: "desktop" });
    const id = computer.id!;

    try {
      // Open a browser on the desktop
      await client.computers.exec.sync(id, {
        command: `nohup firefox ${URL} > /dev/null 2>&1 &`,
      });
      await new Promise((r) => setTimeout(r, 3000));

      // Click the search box and type a query
      await client.computers.click(id, { x: 640, y: 360 });
      await client.computers.type(id, { text: "Ada Lovelace" });
      await client.computers.hotkey(id, { keys: ["Enter"] });
      await new Promise((r) => setTimeout(r, 2000));

      // Scroll down
      await client.computers.scroll(id, { dx: 0, dy: 500, x: 640, y: 400 });
      await new Promise((r) => setTimeout(r, 1000));

      // Capture a screenshot
      const result = await client.computers.screenshot(id);
      console.log(
        `Screenshot URL: ${Colors.BLUE}${result.result?.screenshot_url}${Colors.RESET}`,
      );
    } finally {
      await client.computers.delete(id);
    }
  },
);

const workingWithPageContext = example(
  {
    page: PAGE,
    anchor: "working-with-page-context",
    title: "Working with Page Context",
  },
  async (client: Lightcone): Promise<void> => {
    const computer = await client.computers.create({ kind: "desktop" });
    const id = computer.id!;

    try {
      await client.computers.exec.sync(id, {
        command: `nohup firefox ${URL} > /dev/null 2>&1 &`,
      });
      await new Promise((r) => setTimeout(r, 3000));

      const result = await client.computers.execute(id, {
        action: {
          type: "screenshot",
          include_context: true,
        },
      });

      const ctx = result.page_context;
      console.log(result);
      console.log(
        `Page result: ${Colors.YELLOW}${JSON.stringify(result)}${Colors.RESET}`,
      );
      console.log(`URL: ${Colors.BLUE}${ctx?.url}${Colors.RESET}`);
      console.log(`Title: ${Colors.YELLOW}${ctx?.title}${Colors.RESET}`);
      console.log(
        `Viewport: ${Colors.YELLOW}${ctx?.viewport_width}x${ctx?.viewport_height}${Colors.RESET}`,
      );
    } finally {
      await client.computers.delete(id);
    }
  },
);

const handlingWaits = example(
  { page: PAGE, anchor: "handling-waits", title: "Handling Waits" },
  async (client: Lightcone): Promise<void> => {
    const computer = await client.computers.create({ kind: "desktop" });
    const id = computer.id!;

    try {
      await client.computers.exec.sync(id, {
        command: `nohup firefox https://example.com > /dev/null 2>&1 &`,
      });
      await new Promise((r) => setTimeout(r, 3000)); // Wait for the app to launch and page to load

      await client.computers.click(id, { x: 100, y: 200 });
      await new Promise((r) => setTimeout(r, 1000)); // Wait for any animations or network requests

      const result = await client.computers.screenshot(id);
      console.log(
        `Screenshot URL: ${Colors.BLUE}${result.result?.screenshot_url}${Colors.RESET}`,
      );
    } finally {
      await client.computers.delete(id);
    }
  },
);

const errorHandling = example(
  { page: PAGE, anchor: "error-handling", title: "Error Handling" },
  async (client: Lightcone): Promise<void> => {
    const computer = await client.computers.create({ kind: "desktop" });
    const id = computer.id!;

    try {
      const result = await client.computers.click(id, { x: 100, y: 200 });
      if (result.error_message) {
        console.log(
          `Action failed: ${Colors.RED}${result.error_message}${Colors.RESET}`,
        );
      } else {
        const screenshot = await client.computers.screenshot(id);
        console.log(
          `Screenshot URL: ${Colors.BLUE}${screenshot.result?.screenshot_url}${Colors.RESET}`,
        );
      }
    } catch (err) {
      if (err instanceof Lightcone.AuthenticationError) {
        console.log(`${Colors.RED}Invalid API key${Colors.RESET}`);
      } else if (err instanceof Lightcone.RateLimitError) {
        console.log(`${Colors.RED}Rate limited — slow down${Colors.RESET}`);
      } else if (err instanceof Lightcone.APIError) {
        console.log(
          `${Colors.RED}API error ${(err as any).status}: ${err.message}${Colors.RESET}`,
        );
      } else {
        throw err;
      }
    } finally {
      await client.computers.delete(id);
    }
  },
);

export default async function operateAComputer(
  client: Lightcone,
): Promise<void> {
  console.log(
    `${Colors.YELLOW}*** Core Concepts: Operate a Computer ***${Colors.RESET}\n`,
  );
  await fullExample(client);
  await workingWithPageContext(client);
  await handlingWaits(client);
  await errorHandling(client);
}
