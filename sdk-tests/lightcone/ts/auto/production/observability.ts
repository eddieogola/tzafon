import { execSync } from "node:child_process";
import { spawn } from "node:child_process";
import type Lightcone from "@tzafon/lightcone/index.js";
import { example } from "@/utils/example";
import { Colors } from "@/utils/term";

const PAGE = "guides/observability";

// Screencast and event SSE streams are unbounded — they run until the session
// dies. Every stream example here is bounded by frames and wall-clock so the
// suite cannot wedge.
const MAX_FRAMES = 10;
const MAX_STREAM_MS = 20_000;

// `TaskStartStreamResponse` is typed `string` in the SDK, but the stream yields
// structured events. Same cast the rest of the suite needs.
type TaskEvent = {
  type?: string;
  computer_id?: string;
};

type ScreencastFrame = {
  image_data?: string;
  nalu_data?: string;
  metadata?: unknown;
};

/**
 * `retrieveScreencast` is typed `APIPromise<void>` and awaiting it buffers the
 * whole (unbounded) SSE body. `.asResponse()` hands back the raw Response so
 * the body can be read incrementally, which is the only way to consume it.
 *
 * A stalled `read()` never settles, and the TS harness has no watchdog, so each
 * read is raced against the deadline.
 */
async function* sseLines(response: Response, deadline: number) {
  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (Date.now() < deadline) {
      const stalled = Symbol("stalled");
      const timer = new Promise<typeof stalled>((resolve) =>
        setTimeout(() => resolve(stalled), Math.max(0, deadline - Date.now())).unref(),
      );

      const next = await Promise.race([reader.read(), timer]);
      if (next === stalled) return;

      const { done, value } = next;
      if (done) return;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) yield line;
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
}

const liveViewInTheDashboard = example(
  { page: PAGE, anchor: "live-view-in-the-dashboard", title: "Live View in the Dashboard" },
  async (client: Lightcone): Promise<void> => {
    const stream = await client.agent.tasks.startStream({
      instruction: "...",
      kind: "browser",
    });

    for await (const raw of stream) {
      const event = raw as unknown as TaskEvent;
      if (event.type === "started") {
        console.log(
          `Watch live: ${Colors.BLUE}https://lightcone.ai/c/${event.computer_id}${Colors.RESET}`,
        );
        break; // the live-view URL is all this anchor demonstrates
      }
    }

    stream.controller.abort();
  },
);

const screencastStream = example(
  { page: PAGE, anchor: "screencast-stream", title: "Screencast Stream" },
  async (client: Lightcone): Promise<void> => {
    const computer = await client.computers.create({ kind: "browser" });
    const id = computer.id!;

    try {
      await client.computers.navigate(id, { url: "https://example.com" });

      const response = await client.computers.retrieveScreencast(id).asResponse();

      let frames = 0;
      const deadline = Date.now() + MAX_STREAM_MS;

      // Parse the SSE body: unnamed events carry JPEG frames (browser),
      // named "h264" events carry NAL units (desktop).
      for await (const line of sseLines(response, deadline)) {
        if (!line.startsWith("data: ")) continue;

        const frame = JSON.parse(line.slice("data: ".length)) as ScreencastFrame;
        console.log(
          `Frame ${frames + 1}: ${Colors.YELLOW}${frame.image_data?.length ?? 0} b64 chars${Colors.RESET} ` +
            `metadata=${JSON.stringify(frame.metadata)}`,
        );

        frames += 1;
        if (frames >= MAX_FRAMES) break;
      }

      console.log(`\n${Colors.GREEN}Collected ${frames} frame(s)${Colors.RESET}`);
    } finally {
      await client.computers.delete(id);
    }
  },
);

const recordingASessionToMp4 = example(
  { page: PAGE, anchor: "recording-a-session-to-mp4", title: "Recording a Session to MP4" },
  async (client: Lightcone): Promise<void> => {
    // The docs example shells out to ffmpeg. Skip cleanly where it isn't
    // installed rather than failing on an unrelated missing binary.
    try {
      execSync("command -v ffmpeg", { stdio: "ignore" });
    } catch {
      console.log(`${Colors.YELLOW}ffmpeg not installed — skipping${Colors.RESET}`);
      return;
    }

    const computer = await client.computers.create({ kind: "desktop" });
    const id = computer.id!;

    const ffmpeg = spawn("ffmpeg", ["-y", "-i", "pipe:", "-c:v", "copy", "recording.mp4"]);

    let frames = 0;
    const deadline = Date.now() + MAX_STREAM_MS;

    try {
      const response = await client.computers.retrieveScreencast(id).asResponse();

      for await (const line of sseLines(response, deadline)) {
        // skips "event: ..." lines and ": heartbeat" comments
        if (!line.startsWith("data: ")) continue;

        const payload = JSON.parse(line.slice("data: ".length)) as ScreencastFrame;
        if (payload.nalu_data) {
          ffmpeg.stdin.write(Buffer.from(payload.nalu_data, "base64"));
          frames += 1;
        }

        if (frames >= MAX_FRAMES) break;
      }
    } finally {
      ffmpeg.stdin.end();
      await new Promise((resolve) => ffmpeg.on("close", resolve));
      await client.computers.delete(id);
    }

    console.log(`\n${Colors.GREEN}Wrote recording.mp4 from ${frames} NAL unit(s)${Colors.RESET}`);
  },
);

const eventStreamAndWebSocket = example(
  { page: PAGE, anchor: "event-stream-and-websocket", title: "Event Stream and WebSocket" },
  async (client: Lightcone): Promise<void> => {
    // The docs describe GET /computers/{id}/events and GET /computers/{id}/ws
    // in prose, with no code sample. Only the SSE half is reachable from the
    // SDK: `retrieveWs` is a plain GET with no upgrade handshake, so it cannot
    // produce a WebSocket.
    const computer = await client.computers.create({ kind: "browser" });
    const id = computer.id!;

    try {
      const response = await client.computers.retrieveEvents(id).asResponse();

      // Generate traffic for the stream to report on.
      void client.computers.navigate(id, { url: "https://example.com" });
      void client.computers.click(id, { x: 100, y: 200 });

      let events = 0;
      const deadline = Date.now() + MAX_STREAM_MS;

      for await (const line of sseLines(response, deadline)) {
        if (!line.startsWith("data: ")) continue;

        console.log(`  ${Colors.YELLOW}${line.slice("data: ".length)}${Colors.RESET}`);
        events += 1;
        if (events >= MAX_FRAMES) break;
      }

      console.log(`\n${Colors.GREEN}Collected ${events} event(s)${Colors.RESET}`);
    } finally {
      await client.computers.delete(id);
    }
  },
);

const taskTraces = example(
  { page: PAGE, anchor: "task-traces", title: "Task Traces" },
  async (client: Lightcone): Promise<void> => {
    const stream = await client.agent.tasks.startStream({
      instruction: "...",
      kind: "browser",
    });

    for await (const raw of stream) {
      console.log(raw); // persist these; they are the full run trace

      const event = raw as unknown as TaskEvent;
      if (event.type === "completed" || event.type === "failed") break;
    }

    stream.controller.abort();
  },
);

const fusedActAndObserve = example(
  { page: PAGE, anchor: "fused-act-and-observe", title: "Fused Act-and-Observe" },
  async (client: Lightcone): Promise<void> => {
    const computer = await client.computers.create({ kind: "browser" });
    const id = computer.id!;

    try {
      await client.computers.navigate(id, { url: "https://example.com" });

      const result = await client.computers.click(
        id,
        { x: 100, y: 200 },
        { query: { screenshot_after: "true", settle_ms: "500" } },
      );
      console.log(`Status: ${Colors.GREEN}${result.status}${Colors.RESET}`);
      console.log(
        `Screenshot URL: ${Colors.BLUE}${result.result?.screenshot_url}${Colors.RESET}`,
      );
    } finally {
      await client.computers.delete(id);
    }
  },
);

export default async function observabilityGuide(client: Lightcone): Promise<void> {
  console.log(`${Colors.YELLOW}*** Production: Observability ***${Colors.RESET}\n`);
  void liveViewInTheDashboard;
  void taskTraces;
  // await liveViewInTheDashboard(client);
  await screencastStream(client);
  await recordingASessionToMp4(client);
  await eventStreamAndWebSocket(client);
  // await taskTraces(client);
  await fusedActAndObserve(client);
}
