import Lightcone, { ComputerSession } from "@tzafon/lightcone";

const logScreenshotFailure = (result: any) => {
  console.log("-".repeat(20));
  console.log("Screenshot failed");
  console.log("Status:", result.status);
  console.log("Error Message:", result.error_message);
  console.log("Timestamp:", result.timestamp);
  console.log("-".repeat(20));
};

export const changeWikipediaLanguageAndRightClick = async (
  client: Lightcone,
) => {
  const computer = await ComputerSession.create(client, { kind: "browser" });
  try {
    await computer.setViewport(1920, 1080);
    await computer.navigate("https://wikipedia.org");
    await computer.click(1050, 150);
    await computer.wait(1);
    await computer.rightClick(1300, 450);
    await computer.wait(2);

    const result = await computer.screenshot();

    if (result.status?.toLowerCase() === "success") {
      console.log(
        `Screenshot after changing language: ${result.result?.screenshot_url}`,
      );
    } else {
      logScreenshotFailure(result);
    }
  } finally {
    await computer.terminate();
  }
};

export const nyTimesScrollToBottom = async (client: Lightcone) => {
  const computer = await ComputerSession.create(client, { kind: "browser" });
  try {
    await computer.setViewport(1920, 1080);
    await computer.navigate("https://www.nytimes.com/");
    await computer.scroll(0, 10000);
    await computer.wait(2);

    const result = await computer.screenshot();

    if (result.status?.toLowerCase() === "success") {
      console.log(
        `Screenshot after scrolling: ${result.result?.screenshot_url}`,
      );
    } else {
      logScreenshotFailure(result);
    }
  } finally {
    await computer.terminate();
  }
};

export const nyTimesCheckRobotsTxt = async (client: Lightcone) => {
  const computer = await ComputerSession.create(client, { kind: "browser" });
  try {
    await computer.setViewport(1920, 1080);
    await computer.navigate("https://www.nytimes.com/robots.txt");
    await computer.scroll(0, 500);
    await computer.wait(2);

    const result = await computer.screenshot();
    console.log(`Screenshot: ${result.result?.screenshot_url}`);

    const htmlResult = await computer.html(true);
    console.log(htmlResult.result?.html_content);
  } finally {
    await computer.terminate();
  }
};

export const bnbSearchForHomes = async (client: Lightcone) => {
  const computer = await ComputerSession.create(client, { kind: "browser" });
  try {
    await computer.setViewport(1920, 1080);
    await computer.navigate("https://www.airbnb.com");
    await computer.wait(1);
    await computer.click(600, 150);
    await computer.wait(1);
    await computer.click(650, 250);
    await computer.wait(1);
    await computer.click(750, 500);
    await computer.click(1100, 550);
    await computer.click(1300, 150);
    await computer.wait(1);
    await computer.click(920, 650);
    await computer.wait(1);

    const result = await computer.screenshot();
    if (result.status?.toLowerCase() === "success") {
      console.log(`Screenshot: ${result.result?.screenshot_url}`);
    } else {
      logScreenshotFailure(result);
    }
  } finally {
    await computer.terminate();
  }
};

export const githubSearchForTzafon = async (client: Lightcone) => {
  const computer = await ComputerSession.create(client, { kind: "browser" });
  try {
    await computer.setViewport(1920, 1080);
    await computer.navigate("https://github.com");
    await computer.wait(1);
    await computer.click(1050, 20);
    await computer.wait(1);
    await computer.type("org:tzafon");
    await computer.wait(1);
    await computer.hotkey("enter");
    await computer.wait(1);

    const result = await computer.screenshot();
    if (result.status?.toLowerCase() === "success") {
      console.log(`Screenshot: ${result.result?.screenshot_url}`);
    } else {
      logScreenshotFailure(result);
    }
  } finally {
    await computer.terminate();
  }
};

export const searchForSfAndDrag = async (client: Lightcone) => {
  const computer = await ComputerSession.create(client, { kind: "browser" });
  try {
    await computer.setViewport(1920, 1080);
    await computer.navigate("https://www.openstreetmap.org/");
    await computer.wait(1);
    await computer.type("San Francisco");
    await computer.hotkey("enter");
    await computer.wait(1);
    await computer.drag(1300, 600, 900, 600);
    await computer.wait(1);

    const result = await computer.screenshot();
    if (result.status?.toLowerCase() === "success") {
      console.log(`Screenshot: ${result.result?.screenshot_url}`);
    } else {
      logScreenshotFailure(result);
    }
  } finally {
    await computer.terminate();
  }
};

export const listTabsExecutionAction = async (client: Lightcone) => {
  const computer = await ComputerSession.create(client, { kind: "browser" });
  try {
    const res = await computer.setViewport(1920, 1080);
    console.log("Set viewport result:", res);

    const result = await computer.execute({
      type: "list_tabs",
    });

    // Assuming result.result has tabs Returns:

    const tabs = (result.result as any)?.tabs;
    if (tabs) {
      tabs.forEach((tab: any) => {
        console.log(`Tab ${tab.tab_id}: ${tab.is_main} - ${tab.url}`);
      });
    }
  } finally {
    await computer.terminate();
  }
};

export const multiTabOpen = async (client: Lightcone) => {
  const computer = await ComputerSession.create(client, { kind: "browser" });
  try {
    await computer.navigate("https://wikipedia.org");
    await computer.wait(2);

    const listResult = await computer.execute({ type: "list_tabs" });
    const mainTab = (listResult.result as any)?.tabs[0]?.tab_id;

    const newTabResult = await computer.execute({
      type: "new_tab",
      url: "https://tzafon.ai/",
    });

    const secondTab = (newTabResult.result as any)?.created_tab_id;
    console.log(`Second tab ID: ${secondTab}, result:`, newTabResult);

    await computer.execute({
      type: "click",
      x: 100,
      y: 200,
      tab_id: secondTab,
    });

    await computer.execute({
      type: "type",
      text: "search query",
      tab_id: secondTab,
    });

    await computer.execute({
      type: "switch_tab",
      tab_id: mainTab,
    });

    await computer.execute({
      type: "click",
      x: 150,
      y: 250,
      tab_id: mainTab,
    });

    const screenshot1 = await computer.execute({
      type: "screenshot",
      tab_id: mainTab,
    });

    const screenshot2 = await computer.execute({
      type: "screenshot",
      tab_id: secondTab,
    });

    console.log(`Tab 1: ${(screenshot1.result as any)?.screenshot_url}`);
    console.log(`Tab 2: ${(screenshot2.result as any)?.screenshot_url}`);

    await computer.execute({
      type: "close_tab",
      tab_id: secondTab,
    });

    const finalResult = await computer.execute({ type: "list_tabs" });
    const numberOfTabsLeft = (finalResult.result as any)?.tabs?.length;

    console.log(
      `Number of tabs left after closing second tab: ${numberOfTabsLeft}`,
    );
  } finally {
    await computer.terminate();
  }
};

export const multiTabPlaywrightOnWikipedia = async (client: Lightcone) => {
  const computer = await ComputerSession.create(client, { kind: "browser" });
  try {
    await computer.setViewport(1920, 1080);
    // client.computers.navigate(id=computer.id, url=...)
    await (client as any).computers.navigate(computer.id, {
      url: "https://wikipedia.org",
    });
    await computer.wait(2);

    await (client as any).computers.click(computer.id, { x: 250, y: 920 });
    await computer.wait(2);

    await (client as any).computers.click(computer.id, { x: 400, y: 920 });
    await computer.wait(2);

    const result = await computer.execute({
      type: "list_tabs",
    });

    console.log("Number of open tabs:", (result.result as any)?.tabs?.length);

    const screenshot = await computer.screenshot();
    console.log(
      `Screenshot on Wikipedia main page: ${screenshot.result?.screenshot_url}`,
    );
  } finally {
    await computer.terminate();
  }
};

export const persistentBrowserSession = async (client: Lightcone) => {
  // === PART 1: Initial login ===
  console.log("Creating persistent session and logging in...");

  let computer = await ComputerSession.create(client, {
    kind: "browser",
    persistent: true,
  });

  await computer.navigate("https://lingualeo.com/en");
  await computer.wait(2);

  // Accept cookies if prompted
  await computer.click(945, 645);
  await computer.wait(1);

  // Click "Start Learning" / login button
  await computer.click(1010, 35);
  await computer.wait(1);

  // Click "I already have an account"
  await computer.click(600, 600);
  await computer.wait(1);

  // Enter credentials
  await computer.click(600, 230);
  await computer.type("9211624201@mailinator.com");

  await computer.click(600, 300);
  await computer.type("Mail@9211624201");

  await computer.click(600, 380);
  await computer.wait(10);

  let result = await computer.screenshot();
  console.log(`Logged in: ${result.result?.screenshot_url}`);

  // Save for later
  const sessionId = computer.id;
  console.log(`Saved session: ${sessionId}`);

  await computer.terminate();

  // === PART 2: Restore and verify ===
  console.log("\nRestoring session...");

  computer = await ComputerSession.create(client, {
    kind: "browser",
    environment_id: sessionId,
  });

  await computer.navigate("https://lingualeo.com/en");
  await computer.wait(5);

  result = await computer.screenshot();
  console.log(
    `Restored (should be logged in): ${result.result?.screenshot_url}`,
  );

  await computer.terminate();
};

export const persistentDesktopSession = async (client: Lightcone) => {
  // Create a persistent desktop session and set it up
  const computer = await ComputerSession.create(client, {
    kind: "desktop",
    persistent: true,
  });

  // Install software, configure the environment
  await client.computers.exec.sync(computer.id, {
    command: "mkdir -p ~/Desktop/project",
  });
  await computer.wait(3);

  const result = await computer.screenshot();
  console.log(`Setup complete: ${result.result?.screenshot_url}`);
  console.log(`Session ID (save this): ${computer.id}`);

  await computer.terminate();
  // Full VM snapshot is saved on terminate

  const restoredComputer = await ComputerSession.create(client, {
    kind: "desktop",
    environment_id: computer.id, // Use the same session ID to restore
  });

  // nodejs is already installed, project directory exists
  await restoredComputer.wait(2);

  const result2 = await restoredComputer.screenshot();
  console.log(`Restored: ${result2.result?.screenshot_url}`);

  await restoredComputer.terminate();
};
