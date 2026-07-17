import Lightcone from "@tzafon/lightcone/index.js";
import { APIError, AuthenticationError, NotFoundError } from "@tzafon/lightcone/core/error.js";
import { example } from "@/utils/example";
import { Colors } from "@/utils/term";

const PAGE = "guides/errors";

// `TaskStartStreamResponse` is typed `string` in the SDK, but the stream yields
// structured events.
type TaskEvent = {
  type?: string;
  retryable?: boolean;
  error_code?: string;
};

const errorBodyShape = example(
  { page: PAGE, anchor: "error-body-shape", title: "Error Body Shape" },
  async (client: Lightcone): Promise<void> => {
    // The docs show the problem+json body but no code. Provoke a real 404 and
    // check the response carries the documented RFC 7807 fields.
    try {
      await client.computers.retrieve("does-not-exist");
    } catch (e) {
      if (!(e instanceof APIError)) throw e;

      console.log(
        `Content-Type: ${Colors.YELLOW}${e.headers?.get("content-type")}${Colors.RESET}`,
      );

      const body = e.error as Record<string, unknown> | undefined;
      console.log(`${Colors.YELLOW}${JSON.stringify(body)}${Colors.RESET}\n`);

      for (const field of ["type", "title", "status", "detail", "instance"]) {
        const present = Boolean(body && field in body);
        const color = present ? Colors.GREEN : Colors.RED;
        console.log(
          `  ${field.padEnd(9)} ${color}${present ? "present" : "MISSING"}${Colors.RESET}`,
        );
      }
    }
  },
);

const statusCodes = example(
  { page: PAGE, anchor: "status-codes", title: "Status Codes" },
  async (client: Lightcone): Promise<void> => {
    // 401 — missing or invalid API key
    try {
      await new Lightcone({ apiKey: "not-a-real-key" }).computers.list();
    } catch (e) {
      if (!(e instanceof AuthenticationError)) throw e;
      console.log(`401 -> ${Colors.GREEN}${e.constructor.name}${Colors.RESET}: ${e.status}`);
    }

    // 404 — resource does not exist, or belongs to another organization
    try {
      await client.computers.retrieve("does-not-exist");
    } catch (e) {
      if (!(e instanceof NotFoundError)) throw e;
      console.log(`404 -> ${Colors.GREEN}${e.constructor.name}${Colors.RESET}: ${e.status}`);
    }
  },
);

const taskLevelErrorsSseEvents = example(
  { page: PAGE, anchor: "task-level-errors-sse-events", title: "Task-Level Errors (SSE Events)" },
  async (client: Lightcone): Promise<void> => {
    const stream = await client.agent.tasks.startStream({
      instruction: "...",
      kind: "browser",
    });

    for await (const raw of stream) {
      console.log(raw);

      const event = raw as unknown as TaskEvent;
      if (event.type === "failed") {
        if (event.retryable) {
          // resubmit the task
        } else {
          throw new Error(`Task failed: ${event.error_code}`);
        }
      }
      if (event.type === "completed" || event.type === "failed" || event.type === "config_error") {
        break;
      }
    }

    stream.controller.abort();
  },
);

const actionLevelFailures = example(
  { page: PAGE, anchor: "action-level-failures", title: "Action-Level Failures" },
  async (client: Lightcone): Promise<void> => {
    const computer = await client.computers.create({ kind: "browser" });
    const id = computer.id!;

    try {
      // A host that cannot resolve: the API returns HTTP 200, the
      // ActionResult carries the failure.
      let result = await client.computers.navigate(id, {
        url: "https://this-host-does-not-exist.invalid",
      });
      if (result.status !== "success") {
        console.error(`Navigation failed: ${Colors.RED}${result.error_message}${Colors.RESET}`);
      } else {
        console.log(`${Colors.YELLOW}Unexpectedly succeeded: ${result.status}${Colors.RESET}`);
      }

      // Contrast with a navigation that works
      result = await client.computers.navigate(id, { url: "https://example.com" });
      console.log(`Status: ${Colors.GREEN}${result.status}${Colors.RESET}`);
    } finally {
      await client.computers.delete(id);
    }
  },
);

export default async function errorsGuide(client: Lightcone): Promise<void> {
  console.log(`${Colors.YELLOW}*** Production: Errors and Status Codes ***${Colors.RESET}\n`);
  void taskLevelErrorsSseEvents;
  await errorBodyShape(client);
  await statusCodes(client);
  // await taskLevelErrorsSseEvents(client);
  await actionLevelFailures(client);
}
