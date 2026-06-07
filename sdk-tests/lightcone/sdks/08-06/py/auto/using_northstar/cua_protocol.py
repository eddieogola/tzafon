from time import time

from utils.term import Colors


TOOL = {
    "type": "computer_use",
    "display_width": 1280,
    "display_height": 720,
    "environment": "desktop",
}


def execute_action(computer, action):
    action_type = action.get("type")
    if action_type == "click" and getattr(action, "button", "left") == "right":
        computer.right_click(action.get("x", None), action.get("y", None))
    elif action_type == "click":
        computer.click(action.get("x", None), action.get("y", None))
    elif action_type == "double_click":
        computer.double_click(action.get("x", None), action.get("y", None))
    elif action_type == "type":
        computer.type(action.text)
    elif action_type in ("key", "keypress"):
        computer.hotkey(*action.get("keys", []))
    elif action_type == "scroll":
        computer.scroll(
            0,
            action.scroll_y or 0,
            action.get("x", None) or 640,
            action.get("y", None) or 400,
        )
    elif action_type == "hscroll":
        computer.scroll(
            action.scroll_x or 0,
            0,
            action.get("x", None) or 640,
            action.get("y", None) or 400,
        )
    elif action_type == "drag":
        computer.drag(
            action.get("x", None), action.get("y", None), action.end_x, action.end_y
        )
    elif action_type == "navigate":
        computer.navigate(action.url)
    elif action_type == "wait":
        computer.wait(1)


def full_computer_use_loop(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** CUA Protocol: Full Loop ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/cua-protocol/#the-full-loop{Colors.RESET}\n"
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
                                "text": "Open the terminal and run 'uname -a'",
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

            while True:
                computer_call = None
                for item in response.output or []:
                    if isinstance(item, dict) and item.get("type") == "computer_call":
                        computer_call = item
                    elif item.type == "message":
                        for block in item.content or []:
                            if hasattr(block, "text") and block.text:
                                print(f"Northstar says: {block.text}")

                if not computer_call:
                    print("Done.")
                    break

                action = computer_call.get("action", {})
                print(f"Executing: {action.get('type')}")
                if action.get("type") in ("terminate", "done", "answer"):
                    print(f"Terminal action: {action.get('type')}")
                    break

                execute_action(computer, action)
                computer.wait(1)

                screenshot = computer.screenshot()
                screenshot_url = computer.get_screenshot_url(screenshot)

                response = client.responses.create(
                    model="tzafon.northstar-cua-fast",
                    previous_response_id=response.id,
                    input=[
                        {
                            "type": "computer_call_output",
                            "call_id": computer_call.get("call_id"),
                            "output": {
                                "type": "input_image",
                                "image_url": screenshot_url,
                                "detail": "auto",
                            },
                        }
                    ],
                    tools=[TOOL],
                )

    except Exception as e:
        print(f"\n{Colors.RED}Error in CUA loop: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def cua_protocol_guide(client):
    print(f"{Colors.YELLOW}*** Using Northstar: Computer-Use Loop ***{Colors.RESET}\n")
    full_computer_use_loop(client)
