import json
import os
from time import time

from openai import OpenAI

from utils.term import Colors


def scale_coordinates(model_x, model_y, viewport_width, viewport_height):
    x = int(model_x * (viewport_width - 1) / 999)
    y = int(model_y * (viewport_height - 1) / 999)
    return x, y


def coordinate_scaling_example(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Coordinates: Scaling Example ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/coordinates/#how-scaling-works{Colors.RESET}\n"
        )

        model_x, model_y = 500, 500
        x, y = scale_coordinates(model_x, model_y, 1280, 720)
        print(f"Model ({model_x}, {model_y}) -> Pixel ({x}, {y})")

    except Exception as e:
        print(f"\n{Colors.RED}Error in coordinate scaling example: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def responses_api_scaled_coordinates(client):
    try:
        start_time = time()
        print(
            f"{Colors.YELLOW}*** Coordinates: Responses API Auto-scaling ***{Colors.RESET}\n"
        )
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/coordinates/#which-api-scales-coordinates{Colors.RESET}\n"
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
                            {"type": "input_text", "text": "Click the search button"},
                            {
                                "type": "input_image",
                                "image_url": screenshot_url,
                                "detail": "auto",
                            },
                        ],
                    }
                ],
                tools=[
                    {
                        "type": "computer_use",
                        "display_width": 1280,
                        "display_height": 720,
                        "environment": "desktop",
                    }
                ],
            )

            for item in response.output or []:
                if isinstance(item, dict) and item.get("type") == "computer_call":
                    computer.click(item["action"]["x"], item["action"]["y"])
                    print(
                        f"Clicked scaled pixel coordinates: ({item['action']['x']}, {item['action']['y']})"
                    )
                    break

    except Exception as e:
        print(f"\n{Colors.RED}Error in responses scaling example: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def chat_completions_full_example(client):
    try:
        start_time = time()
        print(
            f"{Colors.YELLOW}*** Coordinates: Chat Completions Full Example ***{Colors.RESET}\n"
        )
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/coordinates/#full-example{Colors.RESET}\n"
        )

        oai = OpenAI(
            base_url="https://api.tzafon.ai/v1",
            api_key=os.environ["TZAFON_API_KEY"],
        )

        VIEWPORT_WIDTH = 1280
        VIEWPORT_HEIGHT = 720

        SYSTEM_PROMPT = f"""\
You are controlling a computer through screenshots and actions.

Screen information:
- Viewport size: {VIEWPORT_WIDTH}x{VIEWPORT_HEIGHT} pixels.
- Coordinates range from (0,0) at the top-left to (999,999) at the bottom-right.
- All coordinate values must be integers between 0 and 999 inclusive.

When clicking or interacting with elements:
- Look at the screenshot to find the element's position.
- Return coordinates in the 0-999 range. Your code will convert them to pixel coordinates.
- Click elements in their CENTER, not on edges."""

        with client.computer.create(kind="desktop") as computer:
            screenshot = computer.screenshot()
            screenshot_url = computer.get_screenshot_url(screenshot)

            result = oai.chat.completions.create(
                model="tzafon.northstar-cua-fast",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Click the search button"},
                            {"type": "image_url", "image_url": {"url": screenshot_url}},
                        ],
                    },
                ],
                tools=[
                    {
                        "type": "function",
                        "function": {
                            "name": "click",
                            "description": "Click at screen coordinates (0-999 range).",
                            "parameters": {
                                "type": "object",
                                "properties": {
                                    "x": {
                                        "type": "integer",
                                        "description": "X position (0=left edge, 999=right edge)",
                                    },
                                    "y": {
                                        "type": "integer",
                                        "description": "Y position (0=top edge, 999=bottom edge)",
                                    },
                                },
                                "required": ["x", "y"],
                            },
                        },
                    }
                ],
            )

            for choice in result.choices:
                for tool_call in choice.message.tool_calls or []:
                    args = json.loads(tool_call.function.arguments)
                    x = int(str(args["x"]).split(",")[0])
                    y = int(str(args["y"]).split(",")[0])
                    pixel_x = int(x / 1000 * VIEWPORT_WIDTH)
                    pixel_y = int(y / 1000 * VIEWPORT_HEIGHT)
                    print(f"Model coords: ({x}, {y})")
                    print(f"Pixel coords:  ({pixel_x}, {pixel_y})")

    except Exception as e:
        print(
            f"\n{Colors.RED}Error in chat completions full example: {e}{Colors.RESET}\n"
        )
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def coordinates_guide(client):
    print(f"{Colors.YELLOW}*** Using Northstar: Coordinates ***{Colors.RESET}\n")
    coordinate_scaling_example(client)
    responses_api_scaled_coordinates(client)
    chat_completions_full_example(client)
