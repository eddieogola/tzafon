import Computer from "@tzafon/computer";

export const mouseUp = async (client: Computer) => {
  const computer = await client.create({ kind: "browser" });
  await computer.execute({
    type: "mouse_up",
    x: 300,
    y: 400,
  });
};

export const mouseDown = async (client: Computer) => {
  const computer = await client.create({ kind: "browser" });
  await computer.execute({
    type: "mouse_down",
    x: 300,
    y: 400,
  });
};

export const keyDown = async (client: Computer) => {
  const computer = await client.create({ kind: "browser" });
  await computer.execute({
    type: "key_down",
    key: "Shift",
  });
};

export const keyUp = async (client: Computer) => {
  const computer = await client.create({ kind: "browser" });
  await computer.execute({
    type: "key_up",
    key: "Shift",
  });
};

export const changeProxy = async (client: Computer) => {
  const computer = await client.create({ kind: "browser" });
  await computer.execute({
    type: "change_proxy",
    proxy_url: "http://127.0.0.1:8080",
  });
};

export const webSocket = async (client: Computer) => {
  const computer = await client.create({ kind: "browser" });
  // WebSocket connection
  const ws = new WebSocket(
    `wss://api.tzafon.ai/v1/computers/${computer.id}/ws?token=${process.env.TZAFON_API_KEY}`,
  );

  ws.onopen = () => {
    console.log("WebSocket connected");
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Received:", data);
  };

  ws.onclose = () => {
    console.log("WebSocket closed");
  };
};
