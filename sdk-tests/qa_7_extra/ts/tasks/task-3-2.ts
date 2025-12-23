import type Computer from "tzafon";
import { EventSource } from "eventsource";

const getEventStreamInfo = async (computerId: string) => {
  // Using EventSource for SSE
  const eventSource = new EventSource(
    `https://api.tzafon.ai/computers/${computerId}/events`,
    {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          headers: {
            ...init.headers,
            Authorization: `Bearer ${process.env.TZAFON_API_KEY}`,
          },
        }),
    }
  );

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Event:", JSON.stringify(data));
  };

  eventSource.onerror = (error) => {
    console.error("SSE error:", error);
  };
};

export const eventStreaming = async (client: Computer) => {
  const computer = await client.create({ kind: "browser" });
  getEventStreamInfo(computer.id);

  await computer.setViewport(1920, 1080);
  await computer.navigate("https://tldraw.com/");
  await computer.wait(1);
  await computer.type("d");
  await computer.execute({ type: "mouse_down", x: 1000, y: 440 });
  await computer.execute({ type: "mouse_up", x: 700, y: 520 });
  await computer.screenshot();
};
