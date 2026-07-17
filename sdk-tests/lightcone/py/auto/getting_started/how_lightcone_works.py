import os

from openai import OpenAI

from utils.example import example
from utils.term import Colors

PAGE = "guides/how-lightcone-works"


@example(PAGE, "1-tasks-fully-managed", title="How Lightcone Works: Tasks (Fully Managed)")
def tasks_fully_managed(client):
    """§1 Tasks — fully managed. Northstar runs the whole task start to finish."""
    for event in client.agent.tasks.start_stream(
        instruction=(
            "Open LibreOffice Calc, create a budget spreadsheet with "
            "categories for rent, food, and transport"
        ),
        kind="desktop",
    ):
        print(event)


@example(
    PAGE,
    "2-responses-api-build-your-own-loop",
    title="How Lightcone Works: Responses API Loop",
)
def responses_api_loop(client):
    """§2 Responses API — build your own loop. One Northstar call with a screenshot."""
    response = client.responses.create(
        model="tzafon.northstar-cua-fast-1.6",
        input="Open the terminal and check disk usage",
        tools=[{"type": "computer_use", "environment": "desktop"}],
    )

    # Execute the action, screenshot, send back, repeat
    # response.output yields pydantic models, never dicts.
    for item in response.output or []:
        if item.type == "computer_call":
            action = item.action
            print(action)
            print(f"Action type : {action.type}")
            print(f"Keys : {', '.join(getattr(action, 'keys', None) or [])}")
        elif item.type == "message":
            for block in item.content or []:
                if hasattr(block, "text") and block.text:
                    print(block.text)


@example(
    PAGE,
    "3-computers-api-direct-control-no-model",
    title="How Lightcone Works: Computers API (Direct Control)",
)
def computers_api_direct_control(client):
    """§3 Computers API — direct control, no model involved."""
    with client.computer.create(kind="desktop") as computer:
        client.computers.exec.sync(
            computer.id,
            command="nohup firefox https://example.com > /dev/null 2>&1 &",
        )
        computer.wait(3)
        computer.click(400, 300)
        computer.type("hello")
        result = computer.screenshot()
        print(
            f"Screenshot URL: {Colors.BLUE}{computer.get_screenshot_url(result)}{Colors.RESET}"
        )


@example(PAGE, "openai-compatible-api", title="How Lightcone Works: OpenAI-Compatible API")
def openai_compatible_api():
    """OpenAI-compatible API — swap base_url and model, nothing else changes."""
    oa_client = OpenAI(
        base_url="https://api.tzafon.ai/v1",
        api_key=os.environ["TZAFON_API_KEY"],
    )

    response = oa_client.chat.completions.create(
        model="tzafon.northstar-cua-fast-1.6",
        messages=[{"role": "user", "content": "What is reinforcement learning?"}],
    )
    print(response.choices[0].message.content)


def how_lightcone_works_guide(client):
    tasks_fully_managed(client)
    responses_api_loop(client)
    computers_api_direct_control(client)
    openai_compatible_api()
