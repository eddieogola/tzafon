import Lightcone from "@tzafon/lightcone";
import { Colors } from "@/utils/term";

const URL = "https://wikipedia.org";

async function fullExample(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(`${Colors.YELLOW}*** Full Example ***${Colors.RESET}\n`);
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/operate-a-computer/#the-full-example${Colors.RESET}\n`,
  );

  const computer = await client.computers.create({ kind: "desktop" });
  const id = computer.id!;

  try {
    // Open a browser on the desktop
    await client.computers.exec.sync(id, {
      command: `firefox ${URL} &`,
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
  } catch (e) {
    console.log(`\n${Colors.RED}Error in full example: ${e}${Colors.RESET}\n`);
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function workingWithPageContext(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Working with Page Context ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/operate-a-computer/#working-with-page-context${Colors.RESET}\n`,
  );

  const computer = await client.computers.create({ kind: "desktop" });
  const id = computer.id!;

  try {
    await client.computers.exec.sync(id, {
      command: `firefox ${URL} &`,
    });
    await new Promise((r) => setTimeout(r, 3000));

    const result = await client.computers.execute(id, {
      action: {
        type: "screenshot",
        include_context: true,
      },
    });

    const ctx = result.page_context;
    console.log(`URL: ${Colors.BLUE}${ctx?.url}${Colors.RESET}`);
    console.log(`Title: ${Colors.YELLOW}${ctx?.title}${Colors.RESET}`);
    console.log(
      `Viewport: ${Colors.YELLOW}${ctx?.viewport_width}x${ctx?.viewport_height}${Colors.RESET}`,
    );
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in working with page context: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function handlingWaits(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(`${Colors.YELLOW}*** Handling Waits ***${Colors.RESET}\n`);
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/operate-a-computer/#handling-waits${Colors.RESET}\n`,
  );

  const computer = await client.computers.create({ kind: "desktop" });
  const id = computer.id!;

  try {
    await client.computers.exec.sync(id, {
      command: "firefox https://example.com &",
    });
    await new Promise((r) => setTimeout(r, 3000)); // Wait for the app to launch and page to load

    await client.computers.click(id, { x: 100, y: 200 });
    await new Promise((r) => setTimeout(r, 1000)); // Wait for any animations or network requests

    const result = await client.computers.screenshot(id);
    console.log(
      `Screenshot URL: ${Colors.BLUE}${result.result?.screenshot_url}${Colors.RESET}`,
    );
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in handling waits: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function errorHandling(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(`${Colors.YELLOW}*** Error Handling ***${Colors.RESET}\n`);
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/operate-a-computer/#error-handling${Colors.RESET}\n`,
  );

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
      console.log(`${Colors.RED}Rate limited \u2014 slow down${Colors.RESET}`);
    } else if (err instanceof Lightcone.APIError) {
      console.log(
        `${Colors.RED}API error ${(err as any).status}: ${err.message}${Colors.RESET}`,
      );
    } else {
      console.log(
        `\n${Colors.RED}Error in error handling: ${err}${Colors.RESET}\n`,
      );
    }
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

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
