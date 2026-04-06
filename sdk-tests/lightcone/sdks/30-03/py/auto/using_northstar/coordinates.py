from time import time

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
                if item.type == "computer_call":
                    computer.click(item.action.x, item.action.y)
                    print(
                        f"Clicked scaled pixel coordinates: ({item.action.x}, {item.action.y})"
                    )
                    break

    except Exception as e:
        print(f"\n{Colors.RED}Error in responses scaling example: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def coordinates_guide(client):
    print(f"{Colors.YELLOW}*** Using Northstar: Coordinates ***{Colors.RESET}\n")
    coordinate_scaling_example(client)
    responses_api_scaled_coordinates(client)
