

import os
import requests
import base64
import threading
import json

from tzafon import Computer

def get_event_screencast_info(computer_id: str):
    url = f"https://api.tzafon.ai/computers/{computer_id}/screencast"
    headers = {"Authorization": f"Bearer {os.getenv('TZAFON_API_KEY')}"}
    try:
        frame_count = 0
        with requests.get(url, headers=headers, stream=True) as response:
            for line in response.iter_lines():
                if line:
                    # Parse SSE data
                    data = line.decode('utf-8')
                    if data.startswith('data:'):
                        frame_data = data[5:].strip()
                        json_data = json.loads(frame_data)
                        image_bytes = base64.b64decode(json_data['image_data'])
                        os.makedirs("frames", exist_ok=True)
                        with open(f"frames/frame_{frame_count}.jpeg", "wb") as f:
                            f.write(image_bytes)
                        frame_count += 1
    except Exception as e:
        print(f"Error streaming screencast: {e}")

def event_screencast(client: Computer):
    with client.create(kind="browser") as computer:
        # Start streaming in a background thread so it doesn't block execution
        stream_thread = threading.Thread(target=get_event_screencast_info, args=(computer.id,), daemon=True)
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