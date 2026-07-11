import type Lightcone from "@tzafon/lightcone/index.js";
import { Colors } from "@/utils/term";

async function sessionLifecycleCreate(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Session Lifecycle: Create ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/computers/#create${Colors.RESET}\n`,
  );

  const computer = await client.computers.create({ kind: "browser" });
  const id = computer.id!;

  try {
    await client.computers.navigate(id, { url: "https://example.com" });
    await new Promise((r) => setTimeout(r, 2000));

    const result = await client.computers.screenshot(id);
    console.log(
      `Screenshot URL: ${Colors.BLUE}${result.result?.screenshot_url}${Colors.RESET}`,
    );
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in session lifecycle create: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function sessionLifecycleInteract(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Session Lifecycle: Interact ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/computers/#interact${Colors.RESET}\n`,
  );

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
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in session lifecycle interact: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function sessionLifecycleTerminate(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Session Lifecycle: Terminate ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/computers/#terminate${Colors.RESET}\n`,
  );

  try {
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
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in session lifecycle terminate: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function computerSessionWrapper(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** ComputerSession (High-Level Wrapper) ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/computers/#computersession-high-level-wrapper${Colors.RESET}\n`,
  );

  // TypeScript uses ComputerSession.create() from the package
  const { ComputerSession } = await import("@tzafon/lightcone/index.js");
  const computer = await ComputerSession.create(client, { kind: "browser" });

  try {
    await computer.navigate("https://example.com");
    await computer.click(100, 200);
    const result = await computer.screenshot();
    const url = ComputerSession.getScreenshotUrl(result);
    console.log(`Screenshot URL: ${Colors.BLUE}${url}${Colors.RESET}`);
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in ComputerSession wrapper: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await computer.terminate();
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function actionsReference(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(`${Colors.YELLOW}*** Actions Reference ***${Colors.RESET}\n`);
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/computers/#actions-reference${Colors.RESET}\n`,
  );

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
    console.log(`${Colors.YELLOW}--- Navigation & Viewport ---${Colors.RESET}`);
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
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in actions reference: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function timeoutsAndKeepalive(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Timeouts and Keepalive ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/computers/#timeouts-and-keepalive${Colors.RESET}\n`,
  );

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
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in timeouts and keepalive: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function persistentSessions(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(`${Colors.YELLOW}*** Persistent Sessions ***${Colors.RESET}\n`);
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/computers/#persistent-sessions${Colors.RESET}\n`,
  );

  try {
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
      console.log(
        `${Colors.GREEN}Session restored successfully${Colors.RESET}`,
      );
    } finally {
      await client.computers.delete(restored.id!);
    }
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in persistent sessions: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function batchActions(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(`${Colors.YELLOW}*** Batch Actions ***${Colors.RESET}\n`);
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/computers/#batch-actions${Colors.RESET}\n`,
  );

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
  } catch (e) {
    console.log(`\n${Colors.RED}Error in batch actions: ${e}${Colors.RESET}\n`);
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function proxySupport(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(`${Colors.YELLOW}*** Proxy Support ***${Colors.RESET}\n`);
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/computers/#proxy-support${Colors.RESET}\n`,
  );

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
  } catch (e) {
    console.log(`\n${Colors.RED}Error in proxy support: ${e}${Colors.RESET}\n`);
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

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
