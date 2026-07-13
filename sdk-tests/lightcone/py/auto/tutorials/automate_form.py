from time import time, sleep


from utils.term import Colors


def start_agent_with_form_instructions(client):
    try:
        start_time = time()
        print(
            f"{Colors.YELLOW}*** Starting Agent with Form Instructions ***{Colors.RESET}\n"
        )
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/tutorials/automate-a-form-with-ai/#step-1-start-an-agent-with-form-instructions{Colors.RESET}\n"
        )
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

    except Exception as e:
        print(
            f"\n{Colors.RED}Error starting agent with form instructions: {e}{Colors.RESET}\n"
        )
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def fire_and_poll(client):
    try:
        start_time = time()
        print(
            f"{Colors.YELLOW}*** Fire-and-Poll for Background Execution ***{Colors.RESET}\n"
        )
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/tutorials/automate-a-form-with-ai/#step-2-use-fire-and-poll-for-background-execution{Colors.RESET}\n"
        )
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

    except Exception as e:
        print(f"\n{Colors.RED}Error in fire-and-poll: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def verify_with_manual_check(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Verify with a Manual Check ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/tutorials/automate-a-form-with-ai/#step-3-verify-with-a-manual-check{Colors.RESET}\n"
        )
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

    except Exception as e:
        print(f"\n{Colors.RED}Error verifying with manual check: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def steer_a_stuck_agent(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Steer a Stuck Agent ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/tutorials/automate-a-form-with-ai/#step-4-steer-a-stuck-agent{Colors.RESET}\n"
        )
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

    except Exception as e:
        print(f"\n{Colors.RED}Error steering stuck agent: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def automate_form_with_ai(client):
    print(f"{Colors.YELLOW}*** Automating Form Filling with AI ***{Colors.RESET}\n")
    start_agent_with_form_instructions(client)
    fire_and_poll(client)
    verify_with_manual_check(client)
    steer_a_stuck_agent(client)
