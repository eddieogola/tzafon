from time import sleep, time

from utils.term import Colors


def start_task_streaming(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Tasks: Start a Task (Streaming) ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/tasks/#start-a-task{Colors.RESET}\n"
        )

        for event in client.agent.tasks.start_stream(
            instruction=(
                "Open Firefox, go to Wikipedia, search for 'machine learning', "
                "and summarize the first paragraph"
            ),
            kind="desktop",
        ):
            print(event)
            if event.get("type") == "completed":
                break

    except Exception as e:
        print(f"\n{Colors.RED}Error in tasks streaming example: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def async_task_with_status_and_controls(client):
    try:
        start_time = time()
        print(
            f"{Colors.YELLOW}*** Tasks: Async + Status + Controls ***{Colors.RESET}\n"
        )
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/tasks/#check-task-status{Colors.RESET}\n"
        )

        task = client.agent.tasks.start(
            instruction=(
                "Open the terminal, check disk usage with df -h, "
                "and take a screenshot of the results"
            ),
            kind="desktop",
        )
        print(f"Task started: {Colors.YELLOW}{task.task_id}{Colors.RESET}")

        sleep(3)
        client.agent.tasks.inject_message(
            task.task_id,
            message="Focus on the top 3 mounted filesystems only.",
        )
        print(f"{Colors.GREEN}Injected guidance message{Colors.RESET}")

        client.agent.tasks.pause(task.task_id)
        print(f"{Colors.YELLOW}Task paused{Colors.RESET}")
        sleep(1)
        client.agent.tasks.resume(task.task_id)
        print(f"{Colors.GREEN}Task resumed{Colors.RESET}")

        for _ in range(10):
            status = client.agent.tasks.retrieve_status(task.task_id)
            print(f"Status: {status.status}, exit code: {status.exit_code}")
            if status.status in ("completed", "failed"):
                break
            sleep(2)

    except Exception as e:
        print(
            f"\n{Colors.RED}Error in async task controls example: {e}{Colors.RESET}\n"
        )
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def tasks_guide(client):
    print(f"{Colors.YELLOW}*** Using Northstar: Tasks ***{Colors.RESET}\n")
    start_task_streaming(client)
    async_task_with_status_and_controls(client)
