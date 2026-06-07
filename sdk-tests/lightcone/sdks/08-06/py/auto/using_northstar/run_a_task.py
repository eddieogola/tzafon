from time import sleep, time

from utils.term import Colors


def start_task_with_streaming(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Run a Task: Streaming ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/run-a-task/#start-a-task-with-streaming{Colors.RESET}\n"
        )

        for event in client.agent.tasks.start_stream(
            instruction=(
                "Open the file manager, navigate to /home, and list the contents. "
                "Then open the terminal and run 'uname -a'."
            ),
            kind="desktop",
            model="tzafon.northstar-cua-fast",
            max_steps=20,
        ):
            print(event)

    except Exception as e:
        print(f"\n{Colors.RED}Error in streaming run-a-task: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def fire_and_poll(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Run a Task: Fire and Poll ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/run-a-task/#fire-and-poll{Colors.RESET}\n"
        )

        task = client.agent.tasks.start(
            instruction="Open the terminal and check system resource usage with htop",
            kind="desktop",
        )
        print(f"Task started: {Colors.YELLOW}{task.task_id}{Colors.RESET}")

        while True:
            status = client.agent.tasks.retrieve_status(task.task_id)
            print(f"Status: {status.status}")
            if status.status in ("completed", "failed"):
                print(f"Exit code: {status.exit_code}")
                break
            sleep(2)

    except Exception as e:
        print(f"\n{Colors.RED}Error in fire-and-poll example: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def steer_mid_task(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Run a Task: Steer Mid-task ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/run-a-task/#steer-mid-task{Colors.RESET}\n"
        )

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

    except Exception as e:
        print(f"\n{Colors.RED}Error in steer-mid-task example: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def run_a_task_guide(client):
    print(f"{Colors.YELLOW}*** Using Northstar: Run a Task ***{Colors.RESET}\n")
    start_task_with_streaming(client)
    fire_and_poll(client)
    steer_mid_task(client)
