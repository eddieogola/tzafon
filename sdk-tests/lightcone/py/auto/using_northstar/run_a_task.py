from time import sleep

from utils.example import example
from utils.term import Colors

PAGE = "guides/run-a-task"


@example(PAGE, "start-a-task-with-streaming", title="Run a Task: Streaming")
def start_task_with_streaming(client):
    for event in client.agent.tasks.start_stream(
        instruction=(
            "Open the file manager, navigate to /home, and list the contents. "
            "Then open the terminal and run 'uname -a'."
        ),
        kind="desktop",
        model="tzafon.northstar-cua-fast-1.6",
        max_steps=20,
    ):
        if event.get("type") == "completed":
            break
        print(event)


@example(PAGE, "fire-and-poll", title="Run a Task: Fire and Poll")
def fire_and_poll(client):
    task = client.agent.tasks.start(
        instruction="Open the browser and navigate to https://www.wikipedia.org",
        kind="desktop",
    )

    while True:
        status = client.agent.tasks.retrieve_status(task.task_id)
        print(f"Status: {status.status}")
        print(status)
        if status.status in ("completed", "failed"):
            print(f"Exit code: {status.exit_code}")
            break
        sleep(2)


@example(PAGE, "steer-mid-task", title="Run a Task: Steer Mid-task")
def steer_mid_task(client):
    task = client.agent.tasks.start(
        instruction="Research the latest AI news using Firefox",
        kind="desktop",
    )
    sleep(5)
    client.agent.tasks.inject_message(
        task.task_id,
        message="Actually, focus specifically on news about large language models",
    )
    print(f"{Colors.GREEN}Steering message injected{Colors.RESET}")

    client.agent.tasks.pause(task.task_id)
    print("Task paused")
    sleep(1)
    client.agent.tasks.resume(task.task_id)
    print("Task resumed")


def run_a_task_guide(client):
    print(f"{Colors.YELLOW}*** Using Northstar: Run a Task ***{Colors.RESET}\n")
    start_task_with_streaming(client)
    fire_and_poll(client)
    steer_mid_task(client)
