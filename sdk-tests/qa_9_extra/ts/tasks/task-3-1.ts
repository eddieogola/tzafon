import Computer from "@tzafon/computer";

export const keepAlive = async (client: Computer) => {
  const computer = await client.create({ kind: "browser" });
  await computer.setViewport(1920, 1080);
  while (true) {
    const result = await computer.keepAlive();
    console.log(result);
    console.log(computer.id);
    await new Promise((resolve) => setTimeout(resolve, 30000));
  }
};
