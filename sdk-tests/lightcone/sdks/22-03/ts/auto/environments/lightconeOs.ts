import type Lightcone from "@tzafon/lightcone";
import { Colors } from "@/utils/term";

async function whatsIncluded(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(`${Colors.YELLOW}*** What is Included ***${Colors.RESET}\n`);
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/lightcone-os/#whats-included${Colors.RESET}\n`,
  );

  const computer = await client.computers.create({ kind: "desktop" });
  const id = computer.id!;

  try {
    const result = await client.computers.exec.sync(id, {
      command:
        "bash --version | head -n 1 && python3 --version && node --version && git --version",
    });
    console.log(`Toolchain:\n${Colors.BLUE}${result.stdout}${Colors.RESET}`);
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in what is included: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function installingSoftware(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(`${Colors.YELLOW}*** Installing Software ***${Colors.RESET}\n`);
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/lightcone-os/#installing-software${Colors.RESET}\n`,
  );

  const computer = await client.computers.create({ kind: "desktop" });
  const id = computer.id!;

  try {
    await client.computers.exec.sync(id, {
      command: "apt-get update",
      timeout_seconds: 60,
    });

    await client.computers.exec.sync(id, {
      command: "apt-get install -y x11-apps",
      timeout_seconds: 120,
    });

    await client.computers.exec.sync(id, {
      command: "xclock &",
    });
    await new Promise((r) => setTimeout(r, 2000));

    const shot = await client.computers.screenshot(id);
    console.log(
      `Desktop screenshot after install: ${Colors.BLUE}${shot.result?.screenshot_url}${Colors.RESET}`,
    );
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in installing software: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function displayConfiguration(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(`${Colors.YELLOW}*** Display Configuration ***${Colors.RESET}\n`);
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/lightcone-os/#display-configuration${Colors.RESET}\n`,
  );

  const computer = await client.computers.create({
    kind: "desktop",
    display: {
      width: 1920,
      height: 1080,
      scale: 1.0,
    },
  });
  const id = computer.id!;

  try {
    await client.computers.exec.sync(id, {
      command: "firefox https://example.com &",
    });
    await new Promise((r) => setTimeout(r, 3000));

    const shot = await client.computers.screenshot(id);
    console.log(
      `Configured display screenshot: ${Colors.BLUE}${shot.result?.screenshot_url}${Colors.RESET}`,
    );
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in display configuration: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

export default async function lightconeOs(client: Lightcone): Promise<void> {
  console.log(
    `${Colors.YELLOW}*** Environments: Lightcone OS ***${Colors.RESET}\n`,
  );
  await whatsIncluded(client);
  await installingSoftware(client);
  await displayConfiguration(client);
}
