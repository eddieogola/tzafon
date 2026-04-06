from time import time

from utils.term import Colors


TOOL = {
    "type": "computer_use",
    "display_width": 1280,
    "display_height": 720,
    "environment": "desktop",
}


def create_and_process_response(client):
    try:
        start_time = time()
        print(
            f"{Colors.YELLOW}*** Responses API: Create + Process Output ***{Colors.RESET}\n"
        )
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/responses-api/#create-a-response{Colors.RESET}\n"
        )

        response = client.responses.create(
            model="tzafon.northstar-cua-fast",
            input="Open the terminal and check disk usage",
            tools=[TOOL],
        )

        for item in response.output or []:
            if item.type == "computer_call":
                action = item.action
                print(f"Action: {action.type}")
                print(
                    f"Coordinates: ({getattr(action, 'x', None)}, {getattr(action, 'y', None)})"
                )
                print(f"Text: {getattr(action, 'text', None)}")
            elif item.type == "message":
                for block in item.content or []:
                    if hasattr(block, "text") and block.text:
                        print(block.text)

    except Exception as e:
        print(f"\n{Colors.RED}Error creating response: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def multi_turn_with_previous_response_id(client):
    try:
        start_time = time()
        print(
            f"{Colors.YELLOW}*** Responses API: Multi-turn Chaining ***{Colors.RESET}\n"
        )
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/responses-api/#multi-turn-chaining{Colors.RESET}\n"
        )

        with client.computer.create(kind="desktop") as computer:
            screenshot = computer.screenshot()
            screenshot_url = computer.get_screenshot_url(screenshot)

            response = client.responses.create(
                model="tzafon.northstar-cua-fast",
                input=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "input_text",
                                "text": "Open the file manager",
                            },
                            {
                                "type": "input_image",
                                "image_url": screenshot_url,
                                "detail": "auto",
                            },
                        ],
                    }
                ],
                tools=[TOOL],
            )

            computer_call = next(
                (
                    item
                    for item in (response.output or [])
                    if item.type == "computer_call"
                ),
                None,
            )
            if not computer_call:
                print("No computer_call received; stopping chain example.")
                return

            screenshot = computer.screenshot()
            screenshot_url = computer.get_screenshot_url(screenshot)

            followup = client.responses.create(
                model="tzafon.northstar-cua-fast",
                previous_response_id=response.id,
                input=[
                    {
                        "type": "computer_call_output",
                        "call_id": computer_call.call_id,
                        "output": {
                            "type": "input_image",
                            "image_url": screenshot_url,
                            "detail": "auto",
                        },
                    }
                ],
                tools=[TOOL],
            )

            print(f"Follow-up response status: {followup.status}")

    except Exception as e:
        print(f"\n{Colors.RED}Error in multi-turn chain: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def responses_api_guide(client):
    print(f"{Colors.YELLOW}*** Using Northstar: Responses API ***{Colors.RESET}\n")
    create_and_process_response(client)
    multi_turn_with_previous_response_id(client)
