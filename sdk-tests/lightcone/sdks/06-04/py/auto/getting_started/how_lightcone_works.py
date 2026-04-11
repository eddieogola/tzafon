import os
from time import time

from openai import OpenAI

from utils.term import Colors


def tasks_fully_managed(client):
    """§1 Tasks — fully managed. Northstar runs the whole task start to finish."""
    try:
        start_time = time()
        print(
            f"{Colors.YELLOW}*** How Lightcone Works: Tasks (Fully Managed) ***{Colors.RESET}\n"
        )
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/how-lightcone-works/#1-tasks--fully-managed{Colors.RESET}\n"
        )

        for event in client.agent.tasks.start_stream(
            instruction=(
                "Open LibreOffice Calc, create a budget spreadsheet with "
                "categories for rent, food, and transport"
            ),
            kind="desktop",
        ):
            print(event)

    except Exception as e:
        print(f"\n{Colors.RED}Error in tasks_fully_managed: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def responses_api_loop(client):
    """§2 Responses API — build your own loop. One Northstar call with a screenshot."""
    try:
        start_time = time()
        print(
            f"{Colors.YELLOW}*** How Lightcone Works: Responses API Loop ***{Colors.RESET}\n"
        )
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/how-lightcone-works/#2-responses-api--build-your-own-loop{Colors.RESET}\n"
        )

        response = client.responses.create(
            model="tzafon.northstar-cua-fast",
            input="Open the terminal and check disk usage",
            tools=[{"type": "computer_use", "environment": "desktop"}],
        )

        # Execute the action, screenshot, send back, repeat
        for item in response.output or []:
            if isinstance(item, dict) and item.get("type") == "computer_call":
                action = item.get("action", {})
                print(action)
                print(f"Action type : {action.get('type')}")
                print(f"Keys : {', '.join(action.get('keys', []))}")
            elif item.type == "message":
                for block in item.content or []:
                    if hasattr(block, "text") and block.text:
                        print(block.text)

    except Exception as e:
        print(f"\n{Colors.RED}Error in responses_api_loop: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def computers_api_direct_control(client):
    """§3 Computers API — direct control, no model involved."""
    try:
        start_time = time()
        print(
            f"{Colors.YELLOW}*** How Lightcone Works: Computers API (Direct Control) ***{Colors.RESET}\n"
        )
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/how-lightcone-works/#3-computers-api--direct-control-no-model{Colors.RESET}\n"
        )

        with client.computer.create(kind="desktop") as computer:
            client.computers.exec.sync(
                computer.id, command="firefox https://example.com &"
            )
            computer.wait(3)
            computer.click(400, 300)
            computer.type("hello")
            result = computer.screenshot()
            print(
                f"Screenshot URL: {Colors.BLUE}{computer.get_screenshot_url(result)}{Colors.RESET}"
            )

    except Exception as e:
        print(
            f"\n{Colors.RED}Error in computers_api_direct_control: {e}{Colors.RESET}\n"
        )
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def openai_compatible_api():
    """OpenAI-compatible API — swap base_url and model, nothing else changes."""
    try:
        start_time = time()
        print(
            f"{Colors.YELLOW}*** How Lightcone Works: OpenAI-Compatible API ***{Colors.RESET}\n"
        )
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/how-lightcone-works/#openai-compatible-api{Colors.RESET}\n"
        )

        oa_client = OpenAI(
            base_url="https://api.tzafon.ai/v1",
            api_key=os.environ["TZAFON_API_KEY"],
        )

        response = oa_client.chat.completions.create(
            model="tzafon.northstar-cua-fast",
            messages=[{"role": "user", "content": "What is reinforcement learning?"}],
        )
        print(response.choices[0].message.content)

    except Exception as e:
        print(f"\n{Colors.RED}Error in openai_compatible_api: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def how_lightcone_works_guide(client):
    # tasks_fully_managed(client)
    # responses_api_loop(client)
    computers_api_direct_control(client)
    openai_compatible_api()
