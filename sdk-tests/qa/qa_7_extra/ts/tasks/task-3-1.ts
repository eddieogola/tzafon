import Computer from "tzafon";

export const keepAlive = async (client: Computer) => {
  const computer = await client.create({ kind: "browser" });
  await computer.setViewport(1920, 1080);
  while (true) {
    const result = await computer.keepAlive();
    console.log(result);
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
};
