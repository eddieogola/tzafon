import Computer from "tzafon"
import { handleScreenshotResult } from "./utils";

export const shiftClickSelection = async (client: Computer) => {
    const computer = await client.create({ kind: 'browser' });

    try {
    await computer.setViewport(1920, 1080);
    await computer.navigate("https://www.tldraw.com/");
    await computer.wait(1);
    await computer.type("d");
    await computer.execute({ type: "key_down", key: "Shift" });
    await computer.click(430, 440);
    await computer.click(700, 520);
    await computer.execute({ type: "key_up", key: "Shift" });

    const result = await computer.screenshot();

    handleScreenshotResult(computer, result);
    } catch (error) {
        console.error(error);
    } finally {
        await computer.terminate();
    }
}

export const controlClickSelection = async (client: Computer) => {
    const computer = await client.create({ kind: 'browser' });

    try {
    await computer.setViewport(1920, 1080);
    await computer.navigate("https://www.tldraw.com/f/6O_RQhA2cilo3Yho9kr9X?d=v-109.-141.1684.1152.page");
    await computer.wait(1);
    await computer.execute({ type: "key_down", key: "Control" });
    await computer.click(880, 700);
    await computer.execute({ type: "key_up", key: "Control" });

    const result = await computer.screenshot();

    handleScreenshotResult(computer, result);
    } catch (error) {
        console.error(error);
    } finally {
        await computer.terminate();
    }
}


export const altClickSelection = async (client: Computer) => {
    const computer = await client.create({ kind: 'browser' });

    try {
    await computer.setViewport(1920, 1080);
    await computer.navigate("https://www.tldraw.com/f/6O_RQhA2cilo3Yho9kr9X?d=v-109.-141.1684.1152.page");
    await computer.wait(1);
    await computer.execute({ type: "key_down", key: "Alt" });
    await computer.click(880, 700);
    await computer.click(1150, 700);
    await computer.execute({ type: "key_up", key: "Alt" });

    const result = await computer.screenshot();

    handleScreenshotResult(computer, result);
    } catch (error) {
        console.error(error);
    } finally {
        await computer.terminate();
    }
}

export const checkKeyUpReleasesKey = async (client: Computer) => {
    const computer = await client.create({ kind: 'browser' });

    try {
    await computer.setViewport(1920, 1080);
    await computer.navigate("https://keyboardsimulator.xyz/");
    await computer.wait(1);
    await computer.execute({ type: "key_down", key: "Shift" });
    // await computer.execute({ type: "key_up", key: "Shift" });

    const result = await computer.screenshot();

    handleScreenshotResult(computer, result);
    } catch (error) {
        console.error(error);
    } finally {
        await computer.terminate();
    }
}