import base64
import time as time_module

from utils.example import example

PAGE = "integrations/kernel"

TOOL = {
    "type": "computer_use",
    "display_width": 1280,
    "display_height": 800,
    "environment": "browser",
}


@example(PAGE, "the-cua-loop", title="Kernel: CUA Loop with Northstar")
def kernel_cua_loop(client):
    from kernel import Kernel

    kernel = Kernel()

    # Create a Kernel browser session
    session = kernel.browsers.create(
        stealth=True,
        viewport={"width": 1280, "height": 800},
    )

    # Take initial screenshot
    png_resp = kernel.browsers.computer.capture_screenshot(session.session_id)
    screenshot_b64 = base64.b64encode(png_resp.read()).decode()

    # First request to Northstar
    response = client.responses.create(
        model="tzafon.northstar-cua-fast-1.6",
        input=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": "Go to wikipedia.org and search for Ada Lovelace",
                    },
                    {
                        "type": "input_image",
                        "image_url": f"data:image/png;base64,{screenshot_b64}",
                        "detail": "auto",
                    },
                ],
            }
        ],
        tools=[TOOL],
    )

    # CUA loop — up to 50 steps
    for _step in range(50):
        computer_call = next(
            (o for o in (response.output or []) if o.type == "computer_call"), None
        )
        if not computer_call:
            break

        action = computer_call.action
        if action.type in ("terminate", "done", "answer"):
            print(f"Done: {getattr(action, 'result', getattr(action, 'text', ''))}")
            break

        # Execute the action on Kernel's browser
        if action.type == "click":
            kernel.browsers.computer.click_mouse(
                id=session.session_id, x=action.x, y=action.y
            )

        elif action.type == "double_click":
            kernel.browsers.computer.click_mouse(
                id=session.session_id, x=action.x, y=action.y, num_clicks=2
            )

        elif action.type == "type":
            kernel.browsers.computer.type_text(id=session.session_id, text=action.text)

        elif action.type in ("key", "keypress"):
            kernel.browsers.computer.press_key(id=session.session_id, keys=action.keys)

        elif action.type == "scroll":
            kernel.browsers.computer.scroll(
                id=session.session_id,
                x=action.x or 640,
                y=action.y or 400,
                delta_x=0,
                delta_y=action.scroll_y or 0,
            )
        elif action.type == "drag":
            kernel.browsers.computer.drag_mouse(
                id=session.session_id,
                path=[[action.x, action.y], [action.end_x, action.end_y]],
            )
        elif action.type == "navigate":
            kernel.browsers.playwright.execute(
                id=session.session_id,
                code=f'page.goto("{action.url}")',
            )

        # Screenshot and continue
        time_module.sleep(1)
        png_resp = kernel.browsers.computer.capture_screenshot(session.session_id)
        screenshot_b64 = base64.b64encode(png_resp.read()).decode()

        response = client.responses.create(
            model="tzafon.northstar-cua-fast-1.6",
            previous_response_id=response.id,
            input=[
                {
                    "type": "computer_call_output",
                    "call_id": computer_call.call_id,
                    "output": {
                        "type": "input_image",
                        "image_url": f"data:image/png;base64,{screenshot_b64}",
                        "detail": "auto",
                    },
                }
            ],
            tools=[TOOL],
        )

    kernel.browsers.delete_by_id(session.session_id)


def kernel_integration(client):
    kernel_cua_loop(client)
