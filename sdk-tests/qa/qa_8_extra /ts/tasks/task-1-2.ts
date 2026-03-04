import Computer from "@tzafon/computer";
import { handleScreenshotResult } from "./utils.js";

export const drawLine = async (client: Computer) => {
  const computer = await client.create({ kind: "browser" });

  try {
    await computer.setViewport(1920, 1080);
    await computer.navigate("https://tldraw.com/");
    await computer.wait(1);
    await computer.type("d");
    await computer.execute({ type: "mouse_down", x: 1000, y: 440 });
    await computer.execute({ type: "mouse_up", x: 700, y: 520 });

    const result = await computer.screenshot();

    handleScreenshotResult(computer, result);
  } catch (error) {
    console.error(error);
  } finally {
    await computer.terminate();
  }
};
