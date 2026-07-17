from time import sleep

from utils.example import example
from utils.term import Colors

PAGE = "tutorials/automate-a-form-with-ai"


@example(
    PAGE,
    "step-1-start-a-task-with-form-instructions",
    title="Start a Task with Form Instructions",
)
def start_task_with_form_instructions(client):
    for event in client.agent.tasks.start_stream(
        instruction=(
            "Go to https://httpbin.org/forms/post. "
            "Fill in the form with these values: "
            "Customer name: Jane Doe, "
            "Telephone: 555-0123, "
            "E-mail: jane@example.com, "
            "Size: Large, "
            "Topping: Bacon, "
            "Topping: Cheese. "
            "Submit the form. "
            "You're done when you see the JSON response showing the submitted data."
        ),
        kind="browser",
        max_steps=15,
    ):
        print(f"{event}\n")
        if event.get("type") == "completed":
            break


@example(
    PAGE,
    "step-2-use-fire-and-poll-for-background-execution",
    title="Fire-and-Poll for Background Execution",
)
def fire_and_poll(client):
    task = client.agent.tasks.start(
        instruction=(
            "Go to https://httpbin.org/forms/post. "
            "Fill in: Customer name: Jane Doe, Telephone: 555-0123. "
            "Submit the form."
        ),
        kind="browser",
        max_steps=15,
    )
    print(f"Task started: {Colors.YELLOW}{task.task_id}{Colors.RESET}")

    # Wait for completion
    while True:
        status = client.agent.tasks.retrieve_status(task.task_id)
        print(f"Status: {Colors.GREEN}{status.status}{Colors.RESET}")

        if status.status in ("completed", "failed"):
            print(
                f"Done! Status: {Colors.GREEN}{status.status}{Colors.RESET}, "
                f"exit code: {Colors.YELLOW}{status.exit_code}{Colors.RESET}"
            )
            break
        sleep(3)


@example(PAGE, "step-3-verify-with-a-manual-check", title="Verify with a Manual Check")
def verify_with_manual_check(client):
    # Start with persistence so we can inspect afterward
    task = client.agent.tasks.start(
        instruction=(
            "Go to https://httpbin.org/forms/post. "
            "Fill in: Customer name: Jane Doe, Telephone: 555-0123. "
            "Submit the form."
        ),
        kind="browser",
        max_steps=15,
        persistent=True,
    )
    print(f"Task started: {Colors.YELLOW}{task.task_id}{Colors.RESET}")

    # Wait for completion
    while True:
        status = client.agent.tasks.retrieve_status(task.task_id)
        if status.status in ("completed", "failed"):
            break
        sleep(3)

    # Inspect the final state
    status = client.agent.tasks.retrieve_status(task.task_id)
    print(f"Status: {Colors.GREEN}{status.status}{Colors.RESET}")


@example(PAGE, "step-4-steer-a-stuck-task", title="Steer a Stuck Task")
def steer_a_stuck_task(client):
    task = client.agent.tasks.start(
        instruction="Go to https://httpbin.org/forms/post and fill in the form.",
        kind="browser",
        max_steps=30,
    )
    print(f"Task started: {Colors.YELLOW}{task.task_id}{Colors.RESET}")

    # Give it a few seconds to start
    sleep(8)

    # Check if it needs help
    status = client.agent.tasks.retrieve_status(task.task_id)
    if status.status == "running":
        client.agent.tasks.inject_message(
            task.task_id,
            message=(
                "For the customer name, type 'Jane Doe'. "
                "For telephone, type '555-0123'. "
                "Then click the Submit button."
            ),
        )
        print(f"{Colors.GREEN}Sent clarifying instructions{Colors.RESET}")

    # Wait for completion
    while True:
        status = client.agent.tasks.retrieve_status(task.task_id)
        if status.status in ("completed", "failed"):
            print(
                f"Done! Status: {Colors.GREEN}{status.status}{Colors.RESET}, "
                f"exit code: {Colors.YELLOW}{status.exit_code}{Colors.RESET}"
            )
            break
        sleep(3)


def automate_form_with_ai(client):
    print(f"{Colors.YELLOW}*** Automating Form Filling with AI ***{Colors.RESET}\n")
    start_task_with_form_instructions(client)
    fire_and_poll(client)
    verify_with_manual_check(client)
    steer_a_stuck_task(client)
