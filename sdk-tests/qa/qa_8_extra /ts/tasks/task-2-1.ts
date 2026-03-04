import Computer from "@tzafon/computer";
import { handleBatchResult } from "./utils.js";

export const basicBatchExecution = async (client: Computer) => {
  const computer = await client.create({ kind: "browser" });
  await computer.setViewport(1920, 1080);

  const result = await computer.batch([
    { type: "go_to_url", url: "https://wikipedia.org" },
    { type: "wait", ms: 2000 },
    { type: "type", text: "Python programming" },
    { type: "wait", ms: 2000 },
    { type: "keypress", keys: ["enter"] },
    { type: "wait", ms: 3000 },
    { type: "screenshot" },
  ]);

  handleBatchResult(computer, result);
};
