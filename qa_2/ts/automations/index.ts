import Computer from "tzafon";

export const searchForLasagnaAndRightClick = async (client: Computer) => {
  const computer = await client.create({ kind: "browser" });

  await computer.navigate("https://wikipedia.com");
  await computer.wait(2);
  await computer.type("Lasagna");
  await computer.hotkey(["enter"]);
  await computer.wait(2);
  await computer.rightClick(1300, 450);

  const result = await computer.screenshot();
  console.log(`Screenshot: ${result.result?.screenshot_url}`);
  await computer.terminate();
};
