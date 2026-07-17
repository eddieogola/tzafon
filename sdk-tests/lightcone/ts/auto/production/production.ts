import type Lightcone from "@tzafon/lightcone/index.js";
import type { ComputerResponse } from "@tzafon/lightcone/resources/computers/computers.js";
import { example } from "@/utils/example";
import { Colors } from "@/utils/term";

const PAGE = "guides/production";

// Docs use a placeholder app; the suite needs a URL that actually resolves.
const PING_URL = "https://example.com";

const pinYourModelVersion = example(
  { page: PAGE, anchor: "pin-your-model-version", title: "Pin Your Model Version" },
  async (client: Lightcone): Promise<void> => {
    const task = await client.agent.tasks.start({
      instruction: "...",
      kind: "browser",
      model: "tzafon.northstar-cua-fast-1.6", // pinned
    });
    console.log(`Task: ${Colors.YELLOW}${task.task_id}${Colors.RESET}`);
    console.log(`Status: ${Colors.GREEN}${task.status}${Colors.RESET}`);
  },
);

const makeRetriesSafeWithIdempotencyKeys = example(
  {
    page: PAGE,
    anchor: "make-retries-safe-with-idempotency-keys",
    title: "Make Retries Safe With Idempotency Keys",
  },
  async (client: Lightcone): Promise<void> => {
    const task = await client.agent.tasks.start({
      instruction: "Submit the expense report for invoice INV-4821",
      kind: "browser",
      idempotency_key: "expense-INV-4821",
    });
    if (task.reused) {
      console.log(`Already running as ${Colors.YELLOW}${task.task_id}${Colors.RESET}`);
    }

    // Retrying with the same key must return the same task with reused: true
    const retry = await client.agent.tasks.start({
      instruction: "Submit the expense report for invoice INV-4821",
      kind: "browser",
      idempotency_key: "expense-INV-4821",
    });
    console.log(`First task : ${Colors.YELLOW}${task.task_id}${Colors.RESET}`);
    console.log(
      `Retried    : ${Colors.YELLOW}${retry.task_id}${Colors.RESET} reused=${retry.reused}`,
    );
  },
);

const sessionHygiene = example(
  { page: PAGE, anchor: "session-hygiene", title: "Session Hygiene" },
  async (client: Lightcone): Promise<void> => {
    const computer = await client.computers.create({ kind: "browser" });
    const id = computer.id!;

    try {
      await client.computers.navigate(id, { url: PING_URL });

      // call periodically during long gaps between actions
      await client.computers.keepalive(id);
      console.log(`${Colors.GREEN}Keep-alive sent${Colors.RESET}`);

      const status = await client.computers.retrieveStatus(id);
      console.log(`Status: ${Colors.YELLOW}${JSON.stringify(status)}${Colors.RESET}`);
    } finally {
      await client.computers.delete(id);
    }
  },
);

const warmSessionsForLatencySensitiveServices = example(
  {
    page: PAGE,
    anchor: "warm-sessions-for-latency-sensitive-services",
    title: "Warm Sessions for Latency-Sensitive Services",
  },
  async (client: Lightcone): Promise<void> => {
    async function getComputer(client: Lightcone, envId: string): Promise<ComputerResponse> {
      // `computers.list()` returns an APIPromise of a plain array — not a
      // paginated async iterable. The docs' `for await (const c of
      // client.computers.list())` throws "is not async iterable".
      for (const c of await client.computers.list()) {
        if (c.status !== "running") continue;
        try {
          // Verify liveness with a cheap real action, not just a screenshot
          await client.computers.navigate(c.id!, { url: PING_URL });
          return c;
        } catch {
          await client.computers.delete(c.id!);
        }
      }
      return client.computers.create({
        kind: "browser",
        environment_id: envId,
        persistent: true,
      });
    }

    // Seed a persistent snapshot to adopt or restore from
    const seed = await client.computers.create({ kind: "browser", persistent: true });
    await client.computers.navigate(seed.id!, { url: PING_URL });
    await client.computers.delete(seed.id!);

    const computer = await getComputer(client, seed.id!);
    try {
      console.log(`Adopted computer: ${Colors.YELLOW}${computer.id}${Colors.RESET}`);
      console.log(`Status: ${Colors.GREEN}${computer.status}${Colors.RESET}`);
    } finally {
      await client.computers.delete(computer.id!);
    }
  },
);

const setTimeoutsAtEveryLayer = example(
  { page: PAGE, anchor: "set-timeouts-at-every-layer", title: "Set Timeouts at Every Layer" },
  async (client: Lightcone): Promise<void> => {
    const jobId = "job-4821";

    const task = await client.agent.tasks.start({
      instruction: "...",
      kind: "browser",
      model: "tzafon.northstar-cua-fast-1.6",
      max_steps: 40,
      max_duration_seconds: 600,
      idempotency_key: jobId,
    });
    console.log(`Task: ${Colors.YELLOW}${task.task_id}${Colors.RESET}`);
    console.log(`Status: ${Colors.GREEN}${task.status}${Colors.RESET}`);
  },
);

export default async function productionGuide(client: Lightcone): Promise<void> {
  console.log(`${Colors.YELLOW}*** Production: Running in Production ***${Colors.RESET}\n`);
  void pinYourModelVersion;
  void makeRetriesSafeWithIdempotencyKeys;
  void setTimeoutsAtEveryLayer;
  // await pinYourModelVersion(client);
  // await makeRetriesSafeWithIdempotencyKeys(client);
  await sessionHygiene(client);
  await warmSessionsForLatencySensitiveServices(client);
  // await setTimeoutsAtEveryLayer(client);
}
