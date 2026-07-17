import type Lightcone from "@tzafon/lightcone/index.js";
import { example } from "@/utils/example";
import { Colors } from "@/utils/term";

const PAGE = "guides/browser-tabs";

const listOpenTabs = example(
  { page: PAGE, anchor: "list-open-tabs", title: "List Open Tabs" },
  async (client: Lightcone): Promise<void> => {
    const computer = await client.computers.create({ kind: "browser" });
    const id = computer.id!;

    try {
      await client.computers.navigate(id, { url: "https://example.com" });
      const result = await client.computers.tabs.list(id);
      console.log(
        `Tabs: ${Colors.BLUE}${JSON.stringify(result.result)}${Colors.RESET}`,
      );
    } finally {
      await client.computers.delete(id);
    }
  },
);

const openAndSwitchTabs = example(
  { page: PAGE, anchor: "switch-between-tabs", title: "Open and Switch Tabs" },
  async (client: Lightcone): Promise<void> => {
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
        is_main?: boolean;
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
    } finally {
      await client.computers.delete(id);
    }
  },
);

const closeTab = example(
  { page: PAGE, anchor: "close-a-tab", title: "Close a Tab" },
  async (client: Lightcone): Promise<void> => {
    const computer = await client.computers.create({ kind: "browser" });
    const id = computer.id!;

    try {
      await client.computers.navigate(id, { url: "https://example.com" });
      await client.computers.tabs.create(id, { url: "https://example.org" });
      await new Promise((r) => setTimeout(r, 1000));

      const tabsResult = await client.computers.tabs.list(id);
      const tabs = (tabsResult.result?.tabs ?? []) as Array<{
        tab_id?: string;
        is_main?: boolean;
      }>;
      // The API returns is_main only on the main tab (docs say is_main_tab — wrong).
      const closable = tabs.find((t) => !t.is_main && t.tab_id);

      if (closable?.tab_id) {
        await client.computers.tabs.delete(closable.tab_id, { id });
        console.log(`${Colors.GREEN}Closed non-main tab${Colors.RESET}`);
      } else {
        console.log(
          `${Colors.YELLOW}No non-main tab found to close${Colors.RESET}`,
        );
      }
    } finally {
      await client.computers.delete(id);
    }
  },
);

const targetSpecificTabForActions = example(
  {
    page: PAGE,
    anchor: "target-a-specific-tab-for-actions",
    title: "Target Specific Tab for Actions",
  },
  async (client: Lightcone): Promise<void> => {
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
    } finally {
      await client.computers.delete(id);
    }
  },
);

const compareTwoPages = example(
  {
    page: PAGE,
    anchor: "example-compare-two-pages",
    title: "Example: Compare Two Pages",
  },
  async (client: Lightcone): Promise<void> => {
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
    } finally {
      await client.computers.delete(id);
    }
  },
);

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
