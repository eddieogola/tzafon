import Computer from "@tzafon/computer";
import { EventSource } from "eventsource";
import * as fs from "node:fs";
import { Buffer } from "node:buffer";

const getEventScreencastInfo = async (computerId: string) => {
  const eventSource = new EventSource(
    `https://api.tzafon.ai/computers/${computerId}/screencast`,
    {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          headers: {
            ...init.headers,
            Authorization: `Bearer ${process.env.TZAFON_API_KEY}`,
          },
        }),
    },
  );

  let isWriting = false;
  let pendingBuffer: Buffer | null = null;

  const triggerWrite = async () => {
    if (isWriting || !pendingBuffer) return;

    isWriting = true;
    const buffer = pendingBuffer;
    pendingBuffer = null;

    try {
      const timestamp = Date.now();
      await fs.promises.mkdir("screencast-result", { recursive: true });
      await fs.promises.writeFile(
        `screencast-result/screencast-${timestamp}.jpeg`,
        buffer,
      );
    } catch (err) {
      console.error("Error writing screencast frame:", err);
    } finally {
      isWriting = false;
      if (pendingBuffer) {
        triggerWrite();
      }
    }
  };

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data && data.image_data) {
        pendingBuffer = Buffer.from(data.image_data, "base64");
        triggerWrite();
      }
    } catch (e) {
      console.error("Error parsing screencast frame:", e);
    }
  };

  eventSource.onerror = (error) => {
    console.error("SSE error:", error);
  };
};

export const eventScreencast = async (client: Computer) => {
  const computer = await client.create({ kind: "browser" });
  getEventScreencastInfo(computer.id);
  await computer.setViewport(1920, 1080);
  await computer.navigate("https://wikipedia.org");
  await computer.wait(1);
  await computer.click(900, 500);
  await computer.type("Python programming");
  await computer.wait(1);
  await computer.hotkey(["enter"]);
  await computer.wait(1);
  await computer.screenshot();
  await computer.terminate();
};
