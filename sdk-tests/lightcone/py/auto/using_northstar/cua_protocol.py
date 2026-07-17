from utils.coords import DISPLAY_HEIGHT, DISPLAY_WIDTH, to_px
from utils.example import example
from utils.term import Colors

PAGE = "guides/cua-protocol"

WIDTH, HEIGHT = DISPLAY_WIDTH, DISPLAY_HEIGHT

TOOL = {
    "type": "computer_use",
    "display_width": WIDTH,
    "display_height": HEIGHT,
    "environment": "desktop",
}


def execute_action(computer, action):
    """Execute one action, converting 0-999 grid coordinates to pixels."""
    x = to_px(action.x, WIDTH) if getattr(action, "x", None) is not None else WIDTH // 2
    y = to_px(action.y, HEIGHT) if getattr(action, "y", None) is not None else HEIGHT // 2

    action_type = action.type
    if action_type == "click" and getattr(action, "button", "left") == "right":
        computer.right_click(x, y)
    elif action_type == "click":
        computer.click(x, y)
    elif action_type == "double_click":
        computer.double_click(x, y)
    elif action_type == "type":
        computer.type(action.text)
    elif action_type in ("key", "keypress"):
        computer.hotkey(*action.keys)
    elif action_type == "scroll":
        computer.scroll(0, to_px(action.scroll_y or 0, HEIGHT), x, y)
    elif action_type == "hscroll":
        computer.scroll(to_px(action.scroll_x or 0, WIDTH), 0, x, y)
    elif action_type == "drag":
        computer.drag(x, y, to_px(action.end_x, WIDTH), to_px(action.end_y, HEIGHT))
    elif action_type == "navigate":
        computer.navigate(action.url)
    elif action_type == "wait":
        computer.wait(2)


@example(PAGE, "the-full-loop", title="CUA Protocol: Full Loop")
def full_computer_use_loop(client):
    with client.computer.create(kind="desktop") as computer:
        screenshot = computer.screenshot()
        screenshot_url = computer.get_screenshot_url(screenshot)

        response = client.responses.create(
            model="tzafon.northstar-cua-fast-1.6",
            input=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": "Open browser and go to wikipedia.org. Search for 'Python programming language' and summarize the first paragraph of the article.",
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
                if item.type == "computer_call":
                    computer_call = item
                elif item.type == "message":
                    for block in item.content or []:
                        if hasattr(block, "text") and block.text:
                            print(f"Northstar says: {block.text}")

            if not computer_call:
                print("Done.")
                break

            action = computer_call.action
            print(f"Executing: {action.type}")

            if action.type == "terminate":
                print(f"{action.status}: {action.result}")
                break
            if action.type == "answer":
                print(f"Answer: {action.result}")
                break
            if action.type == "done":
                print(f"Done: {action.text}")
                break

            execute_action(computer, action)
            computer.wait(1)

            screenshot = computer.screenshot()
            screenshot_url = computer.get_screenshot_url(screenshot)
            print(f"New screenshot URL: {screenshot_url}")

            response = client.responses.create(
                model="tzafon.northstar-cua-fast-1.6",
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


def cua_protocol_guide(client):
    print(f"{Colors.YELLOW}*** Using Northstar: Computer-Use Loop ***{Colors.RESET}\n")
    full_computer_use_loop(client)
