import type Lightcone from "@tzafon/lightcone/index.js";
import { example } from "@/utils/example";
import { Colors } from "@/utils/term";

const PAGE = "guides/lightcone-os";

const installingSoftware = example(
  { page: PAGE, anchor: "installing-software", title: "Installing Software" },
  async (client: Lightcone): Promise<void> => {
    const computer = await client.computers.create({ kind: "desktop" });
    const id = computer.id!;

    try {
      await client.computers.exec.sync(id, {
        command: "apt-get install -y libreoffice",
      });

      await client.computers.exec.sync(id, {
        command: "libreoffice --calc &",
      });

      await new Promise((r) => setTimeout(r, 2000));

      const shot = await client.computers.screenshot(id);
      console.log(
        `Desktop screenshot after install: ${Colors.BLUE}${shot.result?.screenshot_url}${Colors.RESET}`,
      );
    } finally {
      await client.computers.delete(id);
    }
  },
);

const displayConfiguration = example(
  {
    page: PAGE,
    anchor: "display-configuration",
    title: "Display Configuration",
  },
  async (client: Lightcone): Promise<void> => {
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
      const shot = await client.computers.screenshot(id);
      console.log(
        `Configured display screenshot: ${Colors.BLUE}${shot.result?.screenshot_url}${Colors.RESET}`,
      );
    } finally {
      await client.computers.delete(id);
    }
  },
);

export default async function lightconeOs(client: Lightcone): Promise<void> {
  console.log(
    `${Colors.YELLOW}*** Environments: Lightcone OS ***${Colors.RESET}\n`,
  );
  await installingSoftware(client);
  await displayConfiguration(client);
}
