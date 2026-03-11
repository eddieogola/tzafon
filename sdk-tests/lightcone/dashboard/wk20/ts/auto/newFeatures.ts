import type { Computer } from "@tzafon/computer";

export const checkBatchActions = async (client: Computer) => {
  const computer = await client.create({ kind: "browser" });
  await computer.navigate("https://example.com");
  await computer.wait(2);

  // Test batch
  const result = await computer.batch([
    { type: "click", x: 100, y: 200 },
    { type: "type", text: "Hello World" },
    { type: "screenshot" },
  ]);

  console.log(result);
  await computer.terminate();
};
