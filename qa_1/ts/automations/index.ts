import Computer from "tzafon";

const searchForLasagna = async (client: Computer) => {
  const computer = await client.create({ kind: "browser" });

  await computer.navigate("https://wikipedia.com");
  await computer.wait(2);
  await computer.type("Lasagna");
  await computer.hotkey(["enter"]);
  await computer.wait(2);

  const result = await computer.screenshot();
  console.log(`Screenshot: ${result.result?.screenshot_url}`);
  await computer.terminate();
};

const changeWikipediaLanguage = async (client: Computer) => {
  const computer = await client.create({ kind: "browser" });

  await computer.setViewport(1920, 1080);
  await computer.navigate("https://wikipedia.com");
  await computer.click(1050, 150);
  await computer.wait(3);

  const result = await computer.screenshot();
  console.log(`Screenshot: ${result.result?.screenshot_url}`);
  await computer.terminate();
};

const openInNewTab = async (client: Computer) => {
  const computer = await client.create({ kind: "browser" });

  await computer.setViewport(1920, 1080);
  await computer.navigate("https://wikipedia.org");
  await computer.scroll(0, 300);
  await computer.click(300, 800);
  await computer.wait(3);
  await computer.hotkey(["control", "t"]); // Not sure how to switch tabs yet

  const result = await computer.screenshot();
  console.log(`Screenshot: ${result.result?.screenshot_url}`);
  await computer.terminate();
};

const scrollToBottom = async (client: Computer) => {
  const computer = await client.create({ kind: "browser" });

  await computer.setViewport(1920, 1080);
  await computer.navigate("https://www.nytimes.com/");
  await computer.scroll(0, 500);
  await computer.wait(3);

  const result = await computer.screenshot();
  console.log(`Screenshot: ${result.result?.screenshot_url}`);
  await computer.terminate();
};

const searchForBnBs = async (client: Computer) => {
  const computer = await client.create({ kind: "browser" });

  await computer.setViewport(1920, 1080);
  await computer.navigate("https://airbnb.com");
  await computer.wait(2);
  await computer.click(600, 150);
  await computer.wait(2);
  await computer.click(650, 250);
  await computer.wait(2);
  await computer.click(750, 500);
  await computer.click(1100, 550);
  await computer.click(1300, 150);
  await computer.wait(3);

  const result = await computer.screenshot();
  console.log(`Screenshot: ${result.result?.screenshot_url}`);
  await computer.terminate();
};

const searchForSF = async (client: Computer) => {
  const computer = await client.create({ kind: "browser" });

  await computer.setViewport(1920, 1080);
  await computer.navigate("https://www.openstreetmap.org/");
  await computer.wait(2);
  await computer.type("San Francisco");
  await computer.hotkey(["enter"]);
  await computer.wait(2);

  const result = await computer.screenshot();
  console.log(`Screenshot: ${result.result?.screenshot_url}`);
  await computer.terminate();
};

const useTzafonAIdocs = async (client: Computer) => {
  const computer = await client.create({ kind: "browser" });

  await computer.setViewport(1920, 1080);
  await computer.navigate("https://docs.tzafon.ai/overview");
  await computer.wait(3);
  await computer.click(900, 1020);
  await computer.wait(3);
  await computer.type("Explain the concept of Tzafon AI in simple terms.");
  await computer.hotkey(["enter"]);
  await computer.wait(4);

  const result = await computer.screenshot();
  console.log(`Screenshot: ${result.result?.screenshot_url}`);
  await computer.terminate();
};

export {
  searchForLasagna,
  changeWikipediaLanguage,
  openInNewTab,
  scrollToBottom,
  searchForBnBs,
  searchForSF,
  useTzafonAIdocs,
};
