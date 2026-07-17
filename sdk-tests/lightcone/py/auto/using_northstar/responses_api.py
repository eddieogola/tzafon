from utils.example import example
from utils.term import Colors

PAGE = "guides/responses-api"

TOOL = {
    "type": "computer_use",
    "display_width": 1280,
    "display_height": 720,
    "environment": "desktop",
}


@example(PAGE, "create-a-response", title="Responses API: Create + Process Output")
def create_and_process_response(client):
    response = client.responses.create(
        model="tzafon.northstar-cua-fast-1.6",
        input="Open the terminal and check disk usage",
        tools=[TOOL],
    )

    # response.output yields pydantic models, never dicts.
    for item in response.output or []:
        if item.type == "computer_call":
            action = item.action
            print(f"Action : {action}")
            print(f"Action: {action.type}")
            print(f"Keys: {', '.join(getattr(action, 'keys', None) or [])}")

        elif item.type == "message":
            for block in item.content or []:
                if hasattr(block, "text") and block.text:
                    print(block.text)


@example(PAGE, "extracting-information", title="Responses API: Extracting Information")
def extracting_information(client):
    tool = {
        "type": "computer_use",
        "display_width": 1280,
        "display_height": 720,
        "environment": "browser",
    }

    with client.computer.create(kind="browser") as computer:
        computer.navigate("https://example.com/pricing")
        computer.wait(3)

        # --- Phase 1: Explore WITH tools (agent scrolls, dismisses popups, etc.) ---
        screenshot_url = computer.get_screenshot_url(computer.screenshot())
        response = client.responses.create(
            model="tzafon.northstar-cua-fast-1.6",
            tools=[tool],
            input=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": "Scroll down slowly. Dismiss any popups. Stop when you can see pricing details.",
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

        for _ in range(10):
            computer_call = next(
                (o for o in (response.output or []) if o.type == "computer_call"),
                None,
            )
            if not computer_call:
                break
            action = computer_call.action
            if action.type in ("terminate", "done", "answer"):
                break
            # Execute the action — see the CUA protocol guide for the full helper
            computer.wait(1)
            screenshot_url = computer.get_screenshot_url(computer.screenshot())
            response = client.responses.create(
                model="tzafon.northstar-cua-fast-1.6",
                previous_response_id=response.id,
                tools=[tool],
                input=[
                    {
                        "type": "computer_call_output",
                        "call_id": computer_call.call_id,
                        "output": {
                            "type": "input_image",
                            "image_url": screenshot_url,
                            "detail": "auto",
                        },
                    }
                ],
            )

        # --- Phase 2: Extract WITHOUT tools (forces a text response) ---
        screenshot_url = computer.get_screenshot_url(computer.screenshot())
        extraction = client.responses.create(
            model="tzafon.northstar-cua-fast-1.6",
            input=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": "What is the price shown on this page? Reply with just the dollar amount.",
                        },
                        {
                            "type": "input_image",
                            "image_url": screenshot_url,
                            "detail": "auto",
                        },
                    ],
                }
            ],
            # No tools — the model MUST respond with text, not actions
        )

        for item in extraction.output or []:
            if item.type == "message":
                for block in item.content or []:
                    if hasattr(block, "text") and block.text:
                        print(block.text)  # e.g., "$29.99"


@example(PAGE, "multi-turn-chaining", title="Responses API: Multi-turn Chaining")
def multi_turn_with_previous_response_id(client):
    with client.computer.create(kind="desktop") as computer:
        screenshot = computer.screenshot()
        screenshot_url = computer.get_screenshot_url(screenshot)

        response = client.responses.create(
            model="tzafon.northstar-cua-fast-1.6",
            input=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": "Open the file manager",
                        },
                        {
                            "type": "input_image",
                            "image_url": screenshot_url,
                            "detail": "auto",
                        },
                    ],
                }
            ],
            tools=[TOOL],
        )

        computer_call = next(
            (item for item in (response.output or []) if item.type == "computer_call"),
            None,
        )
        if not computer_call:
            print("No computer_call received; stopping chain example.")
            return

        screenshot = computer.screenshot()
        screenshot_url = computer.get_screenshot_url(screenshot)

        followup = client.responses.create(
            model="tzafon.northstar-cua-fast-1.6",
            previous_response_id=response.id,
            input=[
                {
                    "type": "computer_call_output",
                    "call_id": computer_call.call_id,
                    "output": {
                        "type": "input_image",
                        "image_url": screenshot_url,
                        "detail": "auto",
                    },
                }
            ],
            tools=[TOOL],
        )

        print(f"Follow-up response status: {followup.status}")


@example(PAGE, "system-instructions", title="Responses API: System Instructions")
def system_instructions(client):
    # NOTE: The `instructions` parameter and `role: "system"` messages are
    # not yet supported by the Lightcone API (returns 400). As a workaround,
    # embed system instructions directly in the input text.
    response = client.responses.create(
        model="tzafon.northstar-cua-fast-1.6",
        instructions="You are operating a desktop computer. Be careful and verify each action before proceeding.",
        input="Find the system settings and check the display resolution",
        tools=[TOOL],
    )

    for item in response.output or []:
        if item.type == "computer_call":
            print(f"Action: {item.action.type}")
        elif item.type == "message":
            for block in item.content or []:
                if hasattr(block, "text") and block.text:
                    print(block.text)


@example(PAGE, "manage-responses", title="Responses API: Manage Responses")
def manage_responses(client):
    # Create a response to work with
    response = client.responses.create(
        model="tzafon.northstar-cua-fast-1.6",
        input="Open the terminal and check disk usage",
        tools=[TOOL],
    )
    print(f"Created response: {Colors.YELLOW}{response.id}{Colors.RESET}")

    # Retrieve a response
    retrieved = client.responses.retrieve(response.id)
    print(f"Status: {Colors.GREEN}{retrieved.get('status')}{Colors.RESET}")

    # Cancel an in-progress response (may already be completed here)
    client.responses.cancel(response.id)
    print(f"Response {Colors.YELLOW}{response.id}{Colors.RESET} managed successfully")


def responses_api_guide(client):
    print(f"{Colors.YELLOW}*** Using Northstar: Responses API ***{Colors.RESET}\n")
    create_and_process_response(client)
    extracting_information(client)
    multi_turn_with_previous_response_id(client)
    system_instructions(client)
    manage_responses(client)
