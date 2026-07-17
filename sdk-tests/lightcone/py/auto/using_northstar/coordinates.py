import json
import os

from openai import OpenAI

from utils.coords import DISPLAY_HEIGHT, DISPLAY_WIDTH, scale_coordinates, to_px
from utils.example import check, example
from utils.term import Colors

PAGE = "guides/coordinates"


@example(PAGE, "converting-to-pixel-coordinates", title="Coordinates: Scaling Example")
def coordinate_scaling_example(client):
    model_x, model_y = 500, 500
    x, y = scale_coordinates(model_x, model_y, DISPLAY_WIDTH, DISPLAY_HEIGHT)
    print(f"Model ({model_x}, {model_y}) -> Pixel ({x}, {y})")


@example(PAGE, "responses-api", title="Coordinates: Responses API Raw Coordinates")
def responses_api_raw_coordinates(client):
    """Coordinates always come back in 0-999 model space — denormalize before clicking."""
    with client.computer.create(kind="desktop") as computer:
        screenshot = computer.screenshot()
        screenshot_url = computer.get_screenshot_url(screenshot)

        response = client.responses.create(
            model="tzafon.northstar-cua-fast-1.6",
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
                    "display_width": DISPLAY_WIDTH,
                    "display_height": DISPLAY_HEIGHT,
                    "environment": "desktop",
                }
            ],
        )

        # response.output yields pydantic models, never dicts — an isinstance(item, dict)
        # guard here is dead code that silently skips the whole example.
        for item in response.output or []:
            if item.type == "computer_call":
                action = item.action
                # Denormalize from 0-999 model space to pixel coordinates
                x = to_px(action.x, DISPLAY_WIDTH)
                y = to_px(action.y, DISPLAY_HEIGHT)
                computer.click(x, y)
                print(f"Model coords: ({action.x}, {action.y})")
                print(f"Clicked pixel coordinates: ({x}, {y})")
                # A search button is never at the left screen edge. northstar-cua-fast-1.6
                # returns x=0 for every coordinate (the unversioned alias does not), so
                # without this the example clicks nothing and still reports success.
                check(
                    action.x > 0,
                    f"model returned x={action.x} — every click lands on the left edge",
                )
                break


@example(PAGE, "full-example", title="Coordinates: Chat Completions Full Example")
def chat_completions_full_example(client):
    oai = OpenAI(
        base_url="https://api.tzafon.ai/v1",
        api_key=os.environ["TZAFON_API_KEY"],
    )

    SYSTEM_PROMPT = f"""\
You are controlling a computer through screenshots and actions.

Screen information:
- Viewport size: {DISPLAY_WIDTH}x{DISPLAY_HEIGHT} pixels.
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
            model="tzafon.northstar-cua-fast-1.6",
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
                pixel_x = to_px(x, DISPLAY_WIDTH)
                pixel_y = to_px(y, DISPLAY_HEIGHT)
                print(f"Model coords: ({x}, {y})")
                print(f"Pixel coords:  ({pixel_x}, {pixel_y})")


def coordinates_guide(client):
    print(f"{Colors.YELLOW}*** Using Northstar: Coordinates ***{Colors.RESET}\n")
    coordinate_scaling_example(client)
    responses_api_raw_coordinates(client)
    chat_completions_full_example(client)
