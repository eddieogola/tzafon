import Computer from "tzafon";

const logScreenshotFailure = (result: any) => {
  console.log("-".repeat(20));
  console.log("Screenshot failed");
  console.log("Status:", result.status);
  console.log("Error Message:", result.error_message);
  console.log("Timestamp:", result.timestamp);
  console.log("-".repeat(20));
};

export const changeWikipediaLanguageAndRightClick = async (
  client: Computer,
) => {
  const computer = await client.create({ kind: "browser" });
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

export const nyTimesScrollToBottom = async (client: Computer) => {
  const computer = await client.create({ kind: "browser" });
  try {
    await computer.setViewport(1920, 1080);
    await computer.navigate("https://www.nytimes.com/");
    await computer.scroll(0, 1000);
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

export const nyTimesCheckRobotsTxt = async (client: Computer) => {
  const computer = await client.create({ kind: "browser" });
  try {
    await computer.setViewport(1920, 1080);
    await computer.navigate("https://www.nytimes.com/robots.txt");
    await computer.scroll(0, 500);
    await computer.wait(2);

    const result = await computer.screenshot();
    console.log(`Screenshot: ${result.result?.screenshot_url}`);

    const htmlResult = await computer.getHTML(true);
    console.log(htmlResult.result?.html_content);
  } finally {
    await computer.terminate();
  }
};

export const bnbSearchForHomes = async (client: Computer) => {
  const computer = await client.create({ kind: "browser" });
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

export const githubSearchForTzafon = async (client: Computer) => {
  const computer = await client.create({ kind: "browser" });
  try {
    await computer.setViewport(1920, 1080);
    await computer.navigate("https://www.github.com");
    await computer.wait(1);
    await computer.click(1500, 20);
    await computer.wait(1);
    await computer.type("org:tzafon");
    await computer.wait(2);
    await computer.hotkey(["enter"]);
    await computer.wait(2);

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

export const searchForSfAndDrag = async (client: Computer) => {
  const computer = await client.create({ kind: "browser" });
  try {
    await computer.setViewport(1920, 1080);
    await computer.navigate("https://www.openstreetmap.org/");
    await computer.wait(1);
    await computer.type("San Francisco");
    await computer.hotkey(["enter"]);
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

export const listTabsExecutionAction = async (client: Computer) => {
  const computer = await client.create({ kind: "browser" });
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

export const multiTabOpen = async (client: Computer) => {
  const computer = await client.create({ kind: "browser" });
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

export const multiTabPlaywrightOnWikipedia = async (client: Computer) => {
  const computer = await client.create({ kind: "browser" });
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
