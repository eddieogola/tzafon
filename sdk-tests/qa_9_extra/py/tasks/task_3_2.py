import requests
import os
import threading

from tzafon import Computer


def get_event_stream_info(computer_id: str):
    url = f"https://api.tzafon.ai/computers/{computer_id}/events"
    headers = {"Authorization": f"Bearer {os.getenv('TZAFON_API_KEY')}"}

    try:
        with requests.get(url, headers=headers, stream=True) as response:
            for line in response.iter_lines():
                if line:
                    print(line.decode("utf-8"))
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
        computer.screenshot()
