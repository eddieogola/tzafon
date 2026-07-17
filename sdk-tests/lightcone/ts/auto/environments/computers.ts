import type Lightcone from "@tzafon/lightcone/index.js";
import { example } from "@/utils/example";
import { Colors } from "@/utils/term";

const PAGE = "guides/computers";

const sessionLifecycleCreate = example(
  { page: PAGE, anchor: "create", title: "Session Lifecycle: Create" },
  async (client: Lightcone): Promise<void> => {
    const computer = await client.computers.create({ kind: "browser" });
    const id = computer.id!;

    try {
      await client.computers.navigate(id, { url: "https://example.com" });
      await new Promise((r) => setTimeout(r, 2000));

      const result = await client.computers.screenshot(id);
      console.log(
        `Screenshot URL: ${Colors.BLUE}${result.result?.screenshot_url}${Colors.RESET}`,
      );
    } finally {
      await client.computers.delete(id);
    }
  },
);

const sessionLifecycleInteract = example(
  { page: PAGE, anchor: "interact", title: "Session Lifecycle: Interact" },
  async (client: Lightcone): Promise<void> => {
    const computer = await client.computers.create({ kind: "browser" });
    const id = computer.id!;

    try {
      await client.computers.navigate(id, { url: "https://example.com" });
      await client.computers.click(id, { x: 100, y: 200 });
      await client.computers.type(id, { text: "hello world" });
      await client.computers.hotkey(id, { keys: ["Enter"] });
      await client.computers.scroll(id, { dx: 0, dy: 300, x: 640, y: 400 });

      const result = await client.computers.screenshot(id);
      const url = result.result?.screenshot_url as string;
      console.log(`Screenshot URL: ${Colors.BLUE}${url}${Colors.RESET}`);

      const htmlResult = await client.computers.html(id);
      const content = htmlResult.result?.html_content as string;
      console.log(
        `HTML content length: ${Colors.YELLOW}${content.length} chars${Colors.RESET}`,
      );
    } finally {
      await client.computers.delete(id);
    }
  },
);

const sessionLifecycleTerminate = example(
  { page: PAGE, anchor: "terminate", title: "Session Lifecycle: Terminate" },
  async (client: Lightcone): Promise<void> => {
    const computer = await client.computers.create({ kind: "browser" });
    const id = computer.id!;

    try {
      await client.computers.navigate(id, { url: "https://example.com" });
      await new Promise((r) => setTimeout(r, 2000));

      const result = await client.computers.screenshot(id);
      console.log(
        `Screenshot URL: ${Colors.BLUE}${result.result?.screenshot_url}${Colors.RESET}`,
      );
    } finally {
      // Always clean up when done
      await client.computers.delete(id);
      console.log(`${Colors.GREEN}Session terminated manually${Colors.RESET}`);
    }
  },
);

const computerSessionWrapper = example(
  {
    page: PAGE,
    anchor: "computersession-high-level-wrapper",
    title: "ComputerSession (High-Level Wrapper)",
  },
  async (client: Lightcone): Promise<void> => {
    // TypeScript uses ComputerSession.create() from the package
    const { ComputerSession } = await import("@tzafon/lightcone/index.js");
    const computer = await ComputerSession.create(client, { kind: "browser" });

    try {
      await computer.navigate("https://example.com");
      await computer.click(100, 200);
      const result = await computer.screenshot();
      const url = ComputerSession.getScreenshotUrl(result);
      console.log(`Screenshot URL: ${Colors.BLUE}${url}${Colors.RESET}`);
    } finally {
      await computer.terminate();
    }
  },
);

const actionsReference = example(
  { page: PAGE, anchor: "actions-reference", title: "Actions Reference" },
  async (client: Lightcone): Promise<void> => {
    const computer = await client.computers.create({ kind: "browser" });
    const id = computer.id!;

    try {
      await client.computers.navigate(id, { url: "https://example.com" });
      await new Promise((r) => setTimeout(r, 2000));

      // Mouse actions
      console.log(`${Colors.YELLOW}--- Mouse Actions ---${Colors.RESET}`);
      await client.computers.click(id, { x: 100, y: 200 }); // Left-click
      await client.computers.doubleClick(id, { x: 100, y: 200 }); // Double-click
      await client.computers.rightClick(id, { x: 100, y: 200 }); // Right-click

      // Keyboard actions
      console.log(`${Colors.YELLOW}--- Keyboard Actions ---${Colors.RESET}`);
      await client.computers.type(id, { text: "hello world" });
      await client.computers.hotkey(id, { keys: ["Enter"] });

      // Navigation & viewport
      console.log(
        `${Colors.YELLOW}--- Navigation & Viewport ---${Colors.RESET}`,
      );
      await client.computers.navigate(id, { url: "https://example.com" });
      await client.computers.scroll(id, { dx: 0, dy: 300, x: 640, y: 400 });

      const result = await client.computers.screenshot(id);
      console.log(
        `Screenshot URL: ${Colors.BLUE}${result.result?.screenshot_url}${Colors.RESET}`,
      );

      const htmlResult = await client.computers.html(id);
      const content = htmlResult.result?.html_content as string;
      console.log(
        `HTML content length: ${Colors.YELLOW}${content.length} chars${Colors.RESET}`,
      );
    } finally {
      await client.computers.delete(id);
    }
  },
);

const timeoutsAndKeepalive = example(
  {
    page: PAGE,
    anchor: "timeouts-and-keepalive",
    title: "Timeouts and Keepalive",
  },
  async (client: Lightcone): Promise<void> => {
    const computer = await client.computers.create({ kind: "browser" });
    const id = computer.id!;

    try {
      await client.computers.navigate(id, { url: "https://example.com" });
      await new Promise((r) => setTimeout(r, 2000));

      // Keep the session alive during long pauses
      await client.computers.keepalive(id);
      console.log(`${Colors.GREEN}Keep-alive sent${Colors.RESET}`);

      const result = await client.computers.screenshot(id);
      console.log(
        `Screenshot URL: ${Colors.BLUE}${result.result?.screenshot_url}${Colors.RESET}`,
      );
    } finally {
      await client.computers.delete(id);
    }
  },
);

const persistentSessions = example(
  { page: PAGE, anchor: "persistent-state", title: "Persistent Sessions" },
  async (client: Lightcone): Promise<void> => {
    // Save state on termination
    const session = await client.computers.create({
      kind: "browser",
      persistent: true,
    });
    await client.computers.navigate(session.id!, {
      url: "https://example.com",
    });
    await new Promise((r) => setTimeout(r, 2000));
    await client.computers.delete(session.id!);
    console.log(`Session saved: ${Colors.YELLOW}${session.id}${Colors.RESET}`);

    // Restore state later using the session ID
    const restored = await client.computers.create({
      kind: "browser",
      environment_id: session.id!,
      persistent: true, // save again on exit
    });
    try {
      await client.computers.navigate(restored.id!, {
        url: "https://example.com",
      });
      await new Promise((r) => setTimeout(r, 2000));

      const result = await client.computers.screenshot(restored.id!);
      console.log(
        `Restored session screenshot: ${Colors.BLUE}${result.result?.screenshot_url}${Colors.RESET}`,
      );
      console.log(`${Colors.GREEN}Session restored successfully${Colors.RESET}`);
    } finally {
      await client.computers.delete(restored.id!);
    }
  },
);

const batchActions = example(
  { page: PAGE, anchor: "batch-actions", title: "Batch Actions" },
  async (client: Lightcone): Promise<void> => {
    const computer = await client.computers.create({ kind: "browser" });
    const id = computer.id!;

    try {
      const results = await client.computers.batch(id, {
        actions: [
          { type: "go_to_url", url: "https://example.com" },
          { type: "click", x: 100, y: 200 },
          { type: "screenshot" },
        ],
      });
      console.log(
        `Executed: ${Colors.YELLOW}${results.executed}/${results.total}${Colors.RESET}`,
      );
      for (const r of results.results) {
        console.log(`  Status: ${Colors.GREEN}${r.status}${Colors.RESET}`);
      }
    } finally {
      await client.computers.delete(id);
    }
  },
);

const proxySupport = example(
  {
    page: PAGE,
    anchor: "proxy-support-browser-mode",
    title: "Proxy Support",
  },
  async (client: Lightcone): Promise<void> => {
    const computer = await client.computers.create({
      kind: "browser",
      use_advanced_proxy: true,
    });
    const id = computer.id!;

    try {
      await client.computers.navigate(id, { url: "https://example.com" });
      await new Promise((r) => setTimeout(r, 2000));

      const result = await client.computers.screenshot(id);
      console.log(
        `Screenshot URL: ${Colors.BLUE}${result.result?.screenshot_url}${Colors.RESET}`,
      );
      console.log(`${Colors.GREEN}Advanced proxy active${Colors.RESET}`);
    } finally {
      await client.computers.delete(id);
    }
  },
);

export default async function computers(client: Lightcone): Promise<void> {
  console.log(
    `${Colors.YELLOW}*** Core Concepts: Computers ***${Colors.RESET}\n`,
  );
  await sessionLifecycleCreate(client);
  await sessionLifecycleInteract(client);
  await sessionLifecycleTerminate(client);
  await computerSessionWrapper(client);
  await actionsReference(client);
  await timeoutsAndKeepalive(client);
  await persistentSessions(client);
  await batchActions(client);
  await proxySupport(client);
}
