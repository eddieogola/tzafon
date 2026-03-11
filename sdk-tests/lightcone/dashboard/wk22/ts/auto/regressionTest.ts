import type { Computer } from "@tzafon/computer";

export const checkModifierKeysShift = async (client: Computer) => {
  const computer = await client.create({
    kind: "browser",
    display: {
      width: 1920,
      height: 1080,
      scale: 1.0,
    },
  });

  await computer.navigate("https://www.keyboardtester.com/tester.html");
  await computer.wait(3);
  await computer.execute({
    type: "key_down",
    key: "Shift",
  });
  const result = await computer.screenshot();
  console.log(`Shift DOWN: ${result.result?.screenshot_url}`);

  // Release
  await computer.execute({
    type: "key_up",
    key: "Shift",
  });
  const result2 = await computer.screenshot();
  console.log(`Shift UP: ${result2.result?.screenshot_url}`);
};

export const checkModifierKeysControl = async (client: Computer) => {
  const computer = await client.create({
    kind: "browser",
    display: {
      width: 1920,
      height: 1080,
      scale: 1.0,
    },
  });

  await computer.navigate("https://www.keyboardtester.com/tester.html");
  await computer.wait(3);
  await computer.execute({
    type: "key_down",
    key: "Ctrl",
  });
  const result = await computer.screenshot();
  console.log(`Control DOWN: ${result.result?.screenshot_url}`);

  // Release
  await computer.execute({
    type: "key_up",
    key: "Ctrl",
  });
  const result2 = await computer.screenshot();
  console.log(`Control UP: ${result2.result?.screenshot_url}`);
};

export const checkModifierKeysAlt = async (client: Computer) => {
  const computer = await client.create({
    kind: "browser",
    display: {
      width: 1920,
      height: 1080,
      scale: 1.0,
    },
  });

  await computer.navigate("https://www.keyboardtester.com/");
  await computer.wait(3);
  await computer.click(800, 380);
  await computer.wait(3);
  await computer.execute({
    type: "key_down",
    key: "Alt",
  });
  const result = await computer.screenshot();
  console.log(`Alt DOWN: ${result.result?.screenshot_url}`);

  // Release
  await computer.execute({
    type: "key_up",
    key: "Alt",
  });
  const result2 = await computer.screenshot();
  console.log(`Alt UP: ${result2.result?.screenshot_url}`);
};

export const checkMouseDownUp = async (client: Computer) => {
  const computer = await client.create({
    kind: "browser",
    display: {
      width: 1920,
      height: 1080,
      scale: 1.0,
    },
  });

  await computer.navigate("https://kleki.com");
  await computer.wait(4);

  // Draw a line using mouse_down -> mouse_up
  await computer.execute({
    type: "mouse_down",
    x: 400,
    y: 400,
  });
  await computer.wait(0.3);
  await computer.execute({
    type: "mouse_up",
    x: 600,
    y: 500,
  });

  const result = await computer.screenshot();
  console.log(`Drawing result: ${result.result?.screenshot_url}`);
};
