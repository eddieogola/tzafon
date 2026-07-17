import os

from openai import OpenAI

from utils.example import example

PAGE = "guides/quickstart"


@example(PAGE, "3-give-northstar-a-task", title="Quickstart: Give Northstar a Task")
def quickstart(client):
    """Section 3 — Give Northstar a task via the Tasks API."""
    for event in client.agent.tasks.start_stream(
        instruction="Go to wikipedia.org, search for 'Alan Turing', and tell me the first sentence of the article",
        kind="browser",
    ):
        print(event)
        if event.get("type") == "completed":
            break


@example(PAGE, "go-deeper", title="Quickstart: Go Deeper (Responses API)")
def go_deeper(client):
    """Go deeper — one-shot Responses API call with a live computer screenshot."""
    with client.computer.create(kind="desktop") as computer:
        screenshot_url = computer.get_screenshot_url(computer.screenshot())
        print(f"Screenshot URL: {screenshot_url}")
        response = client.responses.create(
            model="tzafon.northstar-cua-fast-1.6",
            tools=[
                {
                    "type": "computer_use",
                    "display_width": 1280,
                    "display_height": 720,
                    "environment": "desktop",
                }
            ],
            input=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": "Open the terminal and check disk usage",
                        },
                        {
                            "type": "input_image",
                            "image_url": screenshot_url,
                            "detail": "auto",
                        },
                    ],
                }
            ],
        )

        # response.output contains a computer_call with the action Northstar chose.
        # Execute it, take a new screenshot, send it back —
        # see the CUA loop guide for the full pattern.
        for item in response.output or []:
            if item.type == "computer_call":
                action = item.action
                print(f"Action type: {action.type}")
                print(f"Coordinates : ({action.x}, {action.y})")
            elif item.type == "message":
                for block in item.content or []:
                    if block.text:
                        print(block.text)


@example(PAGE, "already-using-openai", title="Quickstart: Already Using OpenAI?")
def already_using_openai():
    """OpenAI-compatible endpoint — swap base_url and model, nothing else changes."""
    oa_client = OpenAI(
        base_url="https://api.tzafon.ai/v1",
        api_key=os.environ["TZAFON_API_KEY"],
    )

    response = oa_client.chat.completions.create(
        model="tzafon.northstar-cua-fast-1.6",
        messages=[{"role": "user", "content": "What is reinforcement learning?"}],
    )
    print(response.choices[0].message.content)


def quickstart_guide(client):
    quickstart(client)
    go_deeper(client)
    already_using_openai()
