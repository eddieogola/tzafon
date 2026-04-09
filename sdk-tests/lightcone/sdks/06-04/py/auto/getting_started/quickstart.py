import os
from time import time

from openai import OpenAI

from utils.term import Colors


def quickstart(client):
    """Section 3 — Give Northstar a task via the Tasks API."""
    try:
        start_time = time()
        print(
            f"{Colors.YELLOW}*** Quickstart: Give Northstar a Task ***{Colors.RESET}\n"
        )
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/quickstart/#3-give-northstar-a-task{Colors.RESET}\n"
        )
        for event in client.agent.tasks.start_stream(
            instruction=(
                "Go to wikipedia.org, search for 'Alan Turing', and tell me "
                "the first sentence of the article"
            ),
            kind="desktop",
        ):
            print(event)

    except Exception as e:
        print(f"\n{Colors.RED}Error running quickstart task: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def go_deeper(client):
    """Go deeper — one-shot Responses API call with a live computer screenshot."""
    try:
        start_time = time()
        print(
            f"{Colors.YELLOW}*** Quickstart: Go Deeper (Responses API) ***{Colors.RESET}\n"
        )
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/quickstart/#go-deeper{Colors.RESET}\n"
        )

        with client.computer.create(kind="desktop") as computer:
            screenshot_url = computer.get_screenshot_url(computer.screenshot())

            response = client.responses.create(
                model="tzafon.northstar-cua-fast",
                tools=[
                    {
                        "type": "computer_use",
                        "display_width": 1280,
                        "display_height": 720,
                        "environment": "desktop",
                    }
                ],
                input=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "input_text",
                                "text": "Open the terminal and check disk usage",
                            },
                            {
                                "type": "input_image",
                                "image_url": screenshot_url,
                                "detail": "auto",
                            },
                        ],
                    }
                ],
            )

            # response.output contains a computer_call with the action Northstar chose.
            # Execute it, take a new screenshot, send it back —
            # see the CUA loop guide for the full pattern.
            for item in response.output or []:
                if item.type == "computer_call":
                    action = item.action
                    print(f"Action type : {action.type}")
                    print(
                        f"Coordinates : ({getattr(action, 'x', None)}, {getattr(action, 'y', None)})"
                    )
                elif item.type == "message":
                    for block in item.content or []:
                        if hasattr(block, "text") and block.text:
                            print(block.text)

    except Exception as e:
        print(f"\n{Colors.RED}Error in go_deeper: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def already_using_openai():
    """OpenAI-compatible endpoint — swap base_url and model, nothing else changes."""
    try:
        start_time = time()
        print(
            f"{Colors.YELLOW}*** Quickstart: Already Using OpenAI? ***{Colors.RESET}\n"
        )
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/quickstart/#already-using-openai{Colors.RESET}\n"
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
        print(f"\n{Colors.RED}Error in already_using_openai: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def quickstart_guide(client):
    quickstart(client)
    # go_deeper(client)
    # already_using_openai()
