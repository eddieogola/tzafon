import type Lightcone from "@tzafon/lightcone";
import { Colors } from "@/utils/term";

async function listOpenTabs(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(`${Colors.YELLOW}*** List Open Tabs ***${Colors.RESET}\n`);
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/browser-tabs/#list-open-tabs${Colors.RESET}\n`,
  );

  const computer = await client.computers.create({ kind: "browser" });
  const id = computer.id!;

  try {
    await client.computers.navigate(id, { url: "https://example.com" });
    const result = await client.computers.tabs.list(id);
    console.log(
      `Tabs: ${Colors.BLUE}${JSON.stringify(result.result)}${Colors.RESET}`,
    );
  } catch (e) {
    console.log(`\n${Colors.RED}Error listing tabs: ${e}${Colors.RESET}\n`);
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function openAndSwitchTabs(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(`${Colors.YELLOW}*** Open and Switch Tabs ***${Colors.RESET}\n`);
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/browser-tabs/#switch-between-tabs${Colors.RESET}\n`,
  );

  const computer = await client.computers.create({ kind: "browser" });
  const id = computer.id!;

  try {
    await client.computers.navigate(id, {
      url: "https://en.wikipedia.org/wiki/Python_(programming_language)",
    });

    await client.computers.tabs.create(id, {
      url: "https://en.wikipedia.org/wiki/JavaScript",
    });
    await new Promise((r) => setTimeout(r, 1000));

    const tabsResult = await client.computers.tabs.list(id);
    const tabs = (tabsResult.result?.tabs ?? []) as Array<{
      tab_id?: string;
      url?: string;
      is_main_tab?: boolean;
    }>;
    console.log(
      `Open tabs: ${Colors.BLUE}${JSON.stringify(tabs)}${Colors.RESET}`,
    );

    const firstTab = tabs.find((t) => t.url?.includes("Python"));
    if (firstTab?.tab_id) {
      await client.computers.tabs.switch(firstTab.tab_id, { id });
      const shot = await client.computers.screenshot(id);
      console.log(
        `Switched tab screenshot: ${Colors.BLUE}${shot.result?.screenshot_url}${Colors.RESET}`,
      );
    }
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error opening/switching tabs: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function closeTab(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(`${Colors.YELLOW}*** Close a Tab ***${Colors.RESET}\n`);
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/browser-tabs/#close-a-tab${Colors.RESET}\n`,
  );

  const computer = await client.computers.create({ kind: "browser" });
  const id = computer.id!;

  try {
    await client.computers.navigate(id, { url: "https://example.com" });
    await client.computers.tabs.create(id, { url: "https://example.org" });
    await new Promise((r) => setTimeout(r, 1000));

    const tabsResult = await client.computers.tabs.list(id);
    const tabs = (tabsResult.result?.tabs ?? []) as Array<{
      tab_id?: string;
      is_main_tab?: boolean;
    }>;
    const closable = tabs.find((t) => !t.is_main_tab && t.tab_id);

    if (closable?.tab_id) {
      await client.computers.tabs.delete(closable.tab_id, { id });
      console.log(`${Colors.GREEN}Closed non-main tab${Colors.RESET}`);
    } else {
      console.log(
        `${Colors.YELLOW}No non-main tab found to close${Colors.RESET}`,
      );
    }
  } catch (e) {
    console.log(`\n${Colors.RED}Error closing tab: ${e}${Colors.RESET}\n`);
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function targetSpecificTabForActions(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Target Specific Tab for Actions ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/browser-tabs/#target-a-specific-tab-for-actions${Colors.RESET}\n`,
  );

  const computer = await client.computers.create({ kind: "browser" });
  const id = computer.id!;

  try {
    await client.computers.navigate(id, { url: "https://example.com" });
    await client.computers.tabs.create(id, { url: "https://example.org" });
    await new Promise((r) => setTimeout(r, 1000));

    const tabsResult = await client.computers.tabs.list(id);
    const tabs = (tabsResult.result?.tabs ?? []) as Array<{
      tab_id?: string;
      url?: string;
    }>;
    const backgroundTab = tabs.find((t) => t.url?.includes("example.org"));

    if (backgroundTab?.tab_id) {
      const shot = await client.computers.screenshot(id, {
        tab_id: backgroundTab.tab_id,
      });
      console.log(
        `Background tab screenshot: ${Colors.BLUE}${shot.result?.screenshot_url}${Colors.RESET}`,
      );

      await client.computers.type(id, {
        text: "hello from background tab",
        tab_id: backgroundTab.tab_id,
      });
      console.log(
        `${Colors.GREEN}Typed into background tab using tab_id${Colors.RESET}`,
      );
    }
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error targeting specific tab: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function compareTwoPages(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Example: Compare Two Pages ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/browser-tabs/#example-compare-two-pages${Colors.RESET}\n`,
  );

  const computer = await client.computers.create({ kind: "browser" });
  const id = computer.id!;

  try {
    // Open first page
    await client.computers.navigate(id, {
      url: "https://en.wikipedia.org/wiki/Python_(programming_language)",
    });
    console.log(`${Colors.YELLOW}Opened first page (Python)${Colors.RESET}`);

    // Open second page in a new tab
    await client.computers.tabs.create(id, {
      url: "https://en.wikipedia.org/wiki/JavaScript",
    });
    console.log(
      `${Colors.YELLOW}Opened second page (JavaScript)${Colors.RESET}`,
    );
    await new Promise((r) => setTimeout(r, 2000));

    // Screenshot the second tab (now active)
    const secondShot = await client.computers.screenshot(id);
    console.log(
      `Tab 2 screenshot: ${Colors.BLUE}${secondShot.result?.screenshot_url}${Colors.RESET}`,
    );

    // List tabs and switch back to first
    const tabsResult = await client.computers.tabs.list(id);
    const tabs = (tabsResult.result?.tabs ?? []) as Array<{
      tab_id?: string;
      url?: string;
    }>;
    console.log(
      `Open tabs: ${Colors.BLUE}${JSON.stringify(tabs)}${Colors.RESET}`,
    );

    const pythonTab = tabs.find((t) => t.url?.includes("Python"));
    if (pythonTab?.tab_id) {
      await client.computers.tabs.switch(pythonTab.tab_id, { id });
      const firstShot = await client.computers.screenshot(id);
      console.log(
        `Tab 1 screenshot: ${Colors.BLUE}${firstShot.result?.screenshot_url}${Colors.RESET}`,
      );
    }
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error comparing two pages: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

export default async function manageBrowserTabs(
  client: Lightcone,
): Promise<void> {
  console.log(
    `${Colors.YELLOW}*** Environments: Manage Browser Tabs ***${Colors.RESET}\n`,
  );
  await listOpenTabs(client);
  await openAndSwitchTabs(client);
  await closeTab(client);
  await targetSpecificTabForActions(client);
  await compareTwoPages(client);
}
