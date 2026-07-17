import base64
import json
import shutil
import subprocess
from time import time

from utils.example import example
from utils.term import Colors

PAGE = "guides/observability"

# Screencast and event SSE streams are unbounded — they run until the session
# dies. The docs' `for line in response.iter_lines()` never terminates on its
# own. Every stream example here is bounded by frames and wall-clock so the
# suite cannot wedge.
MAX_FRAMES = 10
MAX_STREAM_SECONDS = 20


@example(PAGE, "live-view-in-the-dashboard", title="Live View in the Dashboard")
def live_view_in_the_dashboard(client):
    stream = client.agent.tasks.start_stream(instruction="...", kind="browser")

    for event in stream:
        if event.get("type") == "started":
            print(
                f"Watch live: {Colors.BLUE}https://lightcone.ai/c/{event['computer_id']}{Colors.RESET}"
            )
            break  # the live-view URL is all this anchor demonstrates

    stream.close()


@example(PAGE, "screencast-stream", title="Screencast Stream")
def screencast_stream(client):
    with client.computer.create(kind="browser") as computer:
        computer.navigate("https://example.com")

        frames = 0
        deadline = time() + MAX_STREAM_SECONDS

        with client.computers.with_streaming_response.retrieve_screencast(
            computer.id
        ) as response:
            for line in response.iter_lines():
                if line.startswith("data: "):
                    frame = json.loads(line[len("data: ") :])
                    # browser: frame["image_data"] is a base64 JPEG
                    image_data = frame.get("image_data", "")
                    metadata = frame.get("metadata", {})
                    print(
                        f"Frame {frames + 1}: {Colors.YELLOW}{len(image_data)} b64 chars{Colors.RESET} "
                        f"metadata={metadata}"
                    )

                    frames += 1
                    if frames >= MAX_FRAMES:
                        break

                if time() > deadline:
                    break

        print(f"\n{Colors.GREEN}Collected {frames} frame(s){Colors.RESET}")


@example(PAGE, "recording-a-session-to-mp4", title="Recording a Session to MP4")
def recording_a_session_to_mp4(client):
    # The docs example shells out to ffmpeg. Skip cleanly where it isn't
    # installed rather than failing on an unrelated missing binary.
    if not shutil.which("ffmpeg"):
        print(f"{Colors.YELLOW}ffmpeg not installed — skipping{Colors.RESET}")
        return

    computer = client.computers.create(kind="desktop")

    ffmpeg = subprocess.Popen(
        ["ffmpeg", "-y", "-i", "pipe:", "-c:v", "copy", "recording.mp4"],
        stdin=subprocess.PIPE,
    )

    frames = 0
    deadline = time() + MAX_STREAM_SECONDS

    try:
        with client.computers.with_streaming_response.retrieve_screencast(
            computer.id
        ) as response:
            for line in response.iter_lines():
                # skips "event: ..." lines and ": heartbeat" comments
                if line.startswith("data: "):
                    payload = json.loads(line[len("data: ") :])
                    if "nalu_data" in payload:
                        ffmpeg.stdin.write(base64.b64decode(payload["nalu_data"]))
                        frames += 1

                if frames >= MAX_FRAMES or time() > deadline:
                    break
    finally:
        ffmpeg.stdin.close()
        ffmpeg.wait()
        client.computers.delete(computer.id)

    print(f"\n{Colors.GREEN}Wrote recording.mp4 from {frames} NAL unit(s){Colors.RESET}")


@example(PAGE, "event-stream-and-websocket", title="Event Stream and WebSocket")
def event_stream_and_websocket(client):
    # The docs describe GET /computers/{id}/events and GET /computers/{id}/ws
    # in prose, with no code sample. Only the SSE half is reachable from the
    # SDK: `retrieve_ws` is a plain GET with no upgrade handshake, so it cannot
    # produce a WebSocket.
    with client.computer.create(kind="browser") as computer:
        events = 0
        deadline = time() + MAX_STREAM_SECONDS

        with client.computers.with_streaming_response.retrieve_events(
            computer.id
        ) as response:
            computer.navigate("https://example.com")
            computer.click(100, 200)

            for line in response.iter_lines():
                if line.startswith("data: "):
                    event = json.loads(line[len("data: ") :])
                    print(f"  {Colors.YELLOW}{event}{Colors.RESET}")

                    events += 1
                    if events >= MAX_FRAMES:
                        break

                if time() > deadline:
                    break

        print(f"\n{Colors.GREEN}Collected {events} event(s){Colors.RESET}")


@example(PAGE, "task-traces", title="Task Traces")
def task_traces(client):
    stream = client.agent.tasks.start_stream(instruction="...", kind="browser")

    for event in stream:
        print(event)  # persist these; they are the full run trace
        if event.get("type") in ("completed", "failed"):
            break

    stream.close()


@example(PAGE, "fused-act-and-observe", title="Fused Act-and-Observe")
def fused_act_and_observe(client):
    with client.computer.create(kind="browser") as computer:
        computer.navigate("https://example.com")

        result = client.computers.click(
            computer.id,
            x=100,
            y=200,
            extra_query={"screenshot_after": "true", "settle_ms": "500"},
        )
        print(f"Status: {Colors.GREEN}{result.status}{Colors.RESET}")
        print(
            f"Screenshot URL: {Colors.BLUE}{(result.result or {}).get('screenshot_url')}{Colors.RESET}"
        )


def observability_guide(client):
    print(f"{Colors.YELLOW}*** Production: Observability ***{Colors.RESET}\n")
    # live_view_in_the_dashboard(client)
    screencast_stream(client)
    recording_a_session_to_mp4(client)
    event_stream_and_websocket(client)
    # task_traces(client)
    fused_act_and_observe(client)
