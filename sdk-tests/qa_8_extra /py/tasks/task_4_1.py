import asyncio
import httpx
import os

from openai import OpenAI
import tzafon
from tzafon import DefaultAioHttpClient, Computer, DefaultHttpxClient


def browser_automation_example(client):
    with client.create(kind="browser") as computer:
        # Navigate to a webpage
        computer.navigate("https://wikipedia.org")
        computer.wait(2)

        # Take a screenshot
        result = computer.screenshot()
        url = computer.get_screenshot_url(result)
        print(f"Screenshot: {url}")

        # Interact with the page
        computer.click(400, 300)
        computer.type("Ada Lovelace")
        computer.hotkey("Return")


def desktop_automation_example(client):
    with client.create(kind="desktop") as computer:
        computer.click(500, 300)
        computer.type("Hello Desktop")
        computer.hotkey("ctrl", "s")
        result = computer.screenshot()
        url = computer.get_screenshot_url(result)
        print(f"Screenshot: {url}")


def session_configuration_example(client):
    computer = client.create(
        kind="browser",  # "browser" or "desktop"
        timeout_seconds=3600,  # Maximum session lifetime
        inactivity_timeout_seconds=120,  # Auto-terminate after idle
        display={"width": 1280, "height": 720, "scale": 1.0},
        context_id="my-session",  # Optional identifier
        auto_kill=True,  # End session on inactivity
    )
    print(computer.id)
    computer.terminate()


def page_context_api_example(client):
    with client.create(kind="browser") as computer:
        result = computer.execute_action("screenshot", include_context=True)
        context = result.page_context

        print(f"URL: {context.url}")
        print(f"Title: {context.title}")
        print(f"Viewport: {context.viewport_width}x{context.viewport_height}")
        print(f"Scroll position: ({context.scroll_x}, {context.scroll_y})")


def chat_completion_example():
    client = OpenAI(
        api_key=os.getenv("TZAFON_API_KEY"), base_url="https://api.tzafon.ai/v1"
    )

    response = client.chat.completions.create(
        model="tzafon.northstar.cua.sft",  # Optimized for computer-use automation
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "What should I click to search?"},
        ],
    )

    print(response.choices[0].message.content)


def async_usage_example(aclient):
    async def main() -> None:
        computer_responses = await aclient.computers.list()
        print(computer_responses)

    asyncio.run(main())


def with_aiohttp_example():
    async def main() -> None:
        async with AsyncComputer(
            api_key=os.environ.get(
                "TZAFON_API_KEY"
            ),  # This is the default and can be omitted
            http_client=DefaultAioHttpClient(),
        ) as client:
            computer_responses = await client.computers.list()
            print(computer_responses)

    asyncio.run(main())


def nested_params_example(client):
    computer_response = client.computers.create(
        display={},
    )
    print(computer_response.display)


def handling_errors_example(client):
    try:
        client.computers.list()
    except tzafon.APIConnectionError as e:
        print("The server could not be reached")
        print(e.__cause__)  # an underlying Exception, likely raised within httpx.
    except tzafon.RateLimitError as e:
        print("A 429 status code was received; we should back off a bit.")
    except tzafon.APIStatusError as e:
        print("Another non-200-range status code was received")
        print(e.status_code)
        print(e.response)
    finally:
        client.terminate()


def retries_example(client):
    client = Computer(
        # default is 2
        max_retries=0,
    )

    # Or, configure per-request:
    client.with_options(max_retries=5).computers.list()


def timeout_example():
    # Configure the default for all requests:
    client = Computer(
        # 20 seconds (default is 1 minute)
        timeout=20.0,
    )

    # More granular control:
    client = Computer(
        timeout=httpx.Timeout(60.0, read=5.0, write=10.0, connect=2.0),
    )

    # Override per-request:
    client.with_options(timeout=5.0).computers.list()


def accessing_raw_response_data_example(client):
    client = Computer()
    response = client.computers.with_raw_response.list()
    print(response.headers.get("X-My-Header"))

    computer = (
        response.parse()
    )  # get the object that `computers.list()` would have returned
    print(computer)


def with_streaming_response_example(client):
    with client.computers.with_streaming_response.list() as response:
        print(response.headers.get("X-My-Header"))

        for line in response.iter_lines():
            print(line)


def undocumented_endpoints_example(client):
    response = client.post(
        "/foo",
        cast_to=httpx.Response,
        body={"my_param": True},
    )

    print(response.headers.get("x-foo"))


def configure_http_client_example():
    client = Computer(
        # Or use the `COMPUTER_BASE_URL` env var
        base_url="http://my.test.server.example.com:8083",
        http_client=DefaultHttpxClient(
            proxy="http://my.test.proxy.example.com",
            transport=httpx.HTTPTransport(local_address="0.0.0.0"),
        ),
    )


def versioning_example():
    print(tzafon.__version__)
