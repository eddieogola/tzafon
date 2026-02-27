import requests
import os
import threading
import re

from tzafon import Computer
client = Computer()

# ANSI escape codes for colors and styles
RESET = '\033[0m'
BOLD = '\033[1m'
RED = '\033[31m'
GREEN = '\033[32m'


def get_event_stream_info(computer_id: str):
    url = f"https://api.tzafon.ai/computers/{computer_id}/events"
    headers = {"Authorization": f"Bearer {os.getenv('TZAFON_API_KEY')}"}

    try:
        with requests.get(url, headers=headers, stream=True) as response:
            for line in response.iter_lines():
                if line:
                    decoded = line.decode("utf-8")
                    # Extract and color-code image_url in red
                    match = re.search(r'"image_url":"([^"]+)"', decoded)
                    if match:
                        image_url = match.group(1)
                        decoded = decoded.replace(image_url, f"{RED}{image_url}{RESET}")
                    print(f"{BOLD}Event Stream:{RESET} {decoded}")
    except Exception as e:
        print(f"Stream error: {e}")


def event_streaming(client: Computer):
    with client.create(kind="browser") as computer:
        # Start streaming in a background thread so it doesn't block execution
        stream_thread = threading.Thread(
            target=get_event_stream_info, args=(computer.id,), daemon=True
        )
        stream_thread.start()

        computer.set_viewport(1920, 1080)
        computer.navigate("https://wikipedia.org")
        computer.wait(1)
        computer.click(900, 500)
        computer.type("Python programming")
        computer.wait(1)
        computer.hotkey("enter")
        computer.wait(1)
        result = computer.screenshot()
        print(f"{BOLD}Computer Image URL:{RESET} {GREEN}{computer.get_screenshot_url(result)}{RESET}")


if __name__ == "__main__":
    event_streaming(client)