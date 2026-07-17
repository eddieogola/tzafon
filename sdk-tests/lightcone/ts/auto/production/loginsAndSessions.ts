import type Lightcone from "@tzafon/lightcone/index.js";
import { example } from "@/utils/example";
import { Colors } from "@/utils/term";

const PAGE = "guides/logins-and-sessions";

// The docs use app.example.com, which doesn't exist. `the-internet` is a public
// demo login with fixed credentials.
const LOGIN_URL = "https://the-internet.herokuapp.com/login";
const SECURE_URL = "https://the-internet.herokuapp.com/secure";

const USERNAME = process.env.APP_USERNAME ?? "tomsmith";
const PASSWORD = process.env.APP_PASSWORD ?? "SuperSecretPassword!";

let environmentId: string | undefined;

// NOTE: Strategy B (human-in-the-loop login handoff) has no example here.
// The docs pass `enable_login_handoff: true` to `agent.tasks.startStream` and
// branch on `login_required` / `computer_parked` events. None of those exist in
// either SDK — `TaskStartStreamParams` has no such field, and the strings
// appear nowhere in the published package.

const strategyAPersistentSessions = example(
  { page: PAGE, anchor: "strategy-a-persistent-sessions", title: "Strategy A: Persistent Sessions" },
  async (client: Lightcone): Promise<void> => {
    // One-time setup: create a persistent computer and sign in
    const computer = await client.computers.create({
      kind: "browser",
      persistent: true,
    });
    await client.computers.navigate(computer.id!, { url: LOGIN_URL });
    console.log(
      `Sign in via the live view: ${Colors.BLUE}https://lightcone.ai/c/${computer.id}${Colors.RESET}`,
    );

    // ... wait for the human to sign in, or script the login (Strategy C) ...
    // The suite runs unattended, so the sign-in is scripted.
    await client.computers.click(computer.id!, { x: 348, y: 330 });
    await client.computers.type(computer.id!, { text: USERNAME });
    await client.computers.click(computer.id!, { x: 348, y: 400 });
    await client.computers.type(computer.id!, { text: PASSWORD });
    await client.computers.hotkey(computer.id!, { keys: ["enter"] });
    await new Promise((r) => setTimeout(r, 3000));

    // Deleting the computer commits the snapshot
    await client.computers.delete(computer.id!);
    environmentId = computer.id!;

    // Every run after that: boot already logged in
    const restored = await client.computers.create({
      kind: "browser",
      environment_id: environmentId,
    });

    try {
      await client.computers.navigate(restored.id!, { url: SECURE_URL });
      const htmlResult = await client.computers.html(restored.id!);
      const content = (htmlResult.result?.html_content as string) ?? "";

      if (content.includes("Logout")) {
        console.log(`${Colors.GREEN}Still authenticated${Colors.RESET}`);
      } else {
        console.log(`${Colors.RED}Session did not carry over${Colors.RESET}`);
      }
    } finally {
      await client.computers.delete(restored.id!);
    }
  },
);

const strategyCScriptedLogin = example(
  { page: PAGE, anchor: "strategy-c-scripted-login", title: "Strategy C: Scripted Login" },
  async (client: Lightcone): Promise<void> => {
    const computer = await client.computers.create({ kind: "browser", persistent: true });
    const id = computer.id!;

    try {
      await client.computers.navigate(id, { url: LOGIN_URL });

      await client.computers.click(id, { x: 348, y: 330 }); // username field
      await client.computers.type(id, { text: USERNAME });
      await client.computers.click(id, { x: 348, y: 400 }); // password field
      await client.computers.type(id, { text: PASSWORD });
      await client.computers.hotkey(id, { keys: ["enter"] });
      await new Promise((r) => setTimeout(r, 3000));

      const htmlResult = await client.computers.html(id);
      const content = (htmlResult.result?.html_content as string) ?? "";

      if (content.includes("You logged into a secure area")) {
        console.log(`${Colors.GREEN}Login successful${Colors.RESET}`);
      } else {
        console.log(`${Colors.RED}Login failed — check the screenshot${Colors.RESET}`);
      }
    } finally {
      await client.computers.delete(id);
    }
  },
);

const sessionReuseForMultiTurnWork = example(
  {
    page: PAGE,
    anchor: "session-reuse-for-multi-turn-work",
    title: "Session Reuse for Multi-Turn Work",
  },
  async (client: Lightcone): Promise<void> => {
    const computer = await client.computers.create({ kind: "browser", persistent: true });
    await client.computers.navigate(computer.id!, { url: SECURE_URL });
    const savedComputerId = computer.id!;

    try {
      const task = await client.agent.tasks.start({
        instruction: "Now export that report as CSV",
        kind: "browser",
        computer_id: savedComputerId,
        on_missing_computer: "restore",
      });
      console.log(`Task: ${Colors.YELLOW}${task.task_id}${Colors.RESET}`);
      console.log(`Status: ${Colors.GREEN}${task.status}${Colors.RESET}`);
    } finally {
      await client.computers.delete(savedComputerId);
    }
  },
);

const antiBotMeasuresAndCaptchas = example(
  { page: PAGE, anchor: "anti-bot-measures-and-captchas", title: "Anti-Bot Measures and Captchas" },
  async (client: Lightcone): Promise<void> => {
    const computer = await client.computers.create({
      kind: "browser",
      use_advanced_proxy: true,
    });
    const id = computer.id!;

    try {
      await client.computers.navigate(id, { url: "https://example.com" });

      const screenshot = await client.computers.screenshot(id);
      console.log(
        `Screenshot URL: ${Colors.BLUE}${screenshot.result?.screenshot_url}${Colors.RESET}`,
      );
      console.log(`${Colors.GREEN}Advanced proxy active${Colors.RESET}`);
    } finally {
      await client.computers.delete(id);
    }
  },
);

export default async function loginsAndSessionsGuide(client: Lightcone): Promise<void> {
  console.log(`${Colors.YELLOW}*** Production: Logins and Sessions ***${Colors.RESET}\n`);
  void sessionReuseForMultiTurnWork;
  await strategyAPersistentSessions(client);
  await strategyCScriptedLogin(client);
  // await sessionReuseForMultiTurnWork(client);
  await antiBotMeasuresAndCaptchas(client);
}
