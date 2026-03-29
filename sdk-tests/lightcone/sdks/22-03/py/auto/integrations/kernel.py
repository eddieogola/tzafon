import base64
import time as time_module
from time import time

from utils.term import Colors

TOOL = {
    "type": "computer_use",
    "display_width": 1280,
    "display_height": 800,
    "environment": "browser",
}


def kernel_cua_loop(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Kernel: CUA Loop with Northstar ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/integrations/kernel/#the-cua-loop{Colors.RESET}\n"
        )

        import kernel

        # Create a Kernel browser session
        session = kernel.browsers.create(
            stealth_mode=True,
            viewport={"width": 1280, "height": 800},
        )

        # Take initial screenshot
        png_bytes = kernel.browsers.computer.capture_screenshot(session.id)
        screenshot_b64 = base64.b64encode(png_bytes).decode()

        # First request to Northstar
        response = client.responses.create(
            model="tzafon.northstar-cua-fast",
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
                kernel.browsers.computer.click_mouse(session.id, action.x, action.y)
            elif action.type == "double_click":
                kernel.browsers.computer.click_mouse(
                    session.id, action.x, action.y, num_clicks=2
                )
            elif action.type == "type":
                kernel.browsers.computer.type_text(session.id, action.text)
            elif action.type in ("key", "keypress"):
                kernel.browsers.computer.press_key(session.id, action.keys)
            elif action.type == "scroll":
                kernel.browsers.computer.scroll(
                    session.id,
                    action.x or 640,
                    action.y or 400,
                    delta_x=0,
                    delta_y=action.scroll_y or 0,
                )
            elif action.type == "drag":
                kernel.browsers.computer.drag_mouse(
                    session.id,
                    path=[[action.x, action.y], [action.end_x, action.end_y]],
                )
            elif action.type == "navigate":
                kernel.browsers.computer.playwright_execute(
                    session.id,
                    code=f'page.goto("{action.url}")',
                )

            # Screenshot and continue
            time_module.sleep(1)
            png_bytes = kernel.browsers.computer.capture_screenshot(session.id)
            screenshot_b64 = base64.b64encode(png_bytes).decode()

            response = client.responses.create(
                model="tzafon.northstar-cua-fast",
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

        kernel.browsers.delete(session.id)

    except Exception as e:
        print(f"\n{Colors.RED}Error in kernel CUA loop: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def kernel_integration(client):
    kernel_cua_loop(client)
