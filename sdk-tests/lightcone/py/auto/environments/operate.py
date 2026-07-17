import tzafon

from utils.example import example
from utils.term import Colors

PAGE = "guides/operate-a-computer"

URL = "https://wikipedia.org"


@example(PAGE, "the-full-example", title="Full Example")
def full_example(client):
    with client.computer.create(kind="desktop") as computer:
        # Open a browser on the desktop
        client.computers.exec.sync(
            computer.id, command=f"nohup firefox {URL} > /dev/null 2>&1 &"
        )
        computer.wait(3)

        # Click the search box and type a query
        computer.click(640, 360)
        computer.type("Ada Lovelace")
        computer.hotkey("Enter")
        computer.wait(2)

        # Scroll down the page
        computer.scroll(0, 500, 640, 400)
        computer.wait(1)

        # Capture a screenshot
        result = computer.screenshot()
        print(
            f"Screenshot URL: {Colors.BLUE}{computer.get_screenshot_url(result)}{Colors.RESET}"
        )


@example(PAGE, "working-with-page-context", title="Working with Page Context")
def working_with_page_context(client):
    # Docs use a browser computer here. page_context is browser-only: a desktop
    # session returns status=SUCCESS with page_context=None, so ctx.url raises.
    with client.computer.create(kind="browser") as computer:
        computer.navigate(URL)
        computer.wait(2)

        result = client.computers.execute(
            computer.id,
            action={
                "type": "screenshot",
                "include_context": True,
            },
        )

        ctx = result.page_context
        print(result)
        print(f"Page result: {Colors.YELLOW}{result}{Colors.RESET}")
        print(f"URL: {Colors.BLUE}{ctx.url}{Colors.RESET}")
        print(f"Title: {Colors.YELLOW}{ctx.title}{Colors.RESET}")
        print(
            f"Viewport: {Colors.YELLOW}{ctx.viewport_width}x{ctx.viewport_height}{Colors.RESET}"
        )
        print(f"Page size: {Colors.YELLOW}{ctx.page_width}x{ctx.page_height}{Colors.RESET}")
        print(
            f"Scroll position: {Colors.YELLOW}({ctx.scroll_x}, {ctx.scroll_y}){Colors.RESET}"
        )


@example(PAGE, "handling-waits", title="Handling Waits")
def handling_waits(client):
    with client.computer.create(kind="desktop") as computer:
        client.computers.exec.sync(
            computer.id, command=f"nohup firefox {URL} > /dev/null 2>&1 &"
        )
        computer.wait(3)  # Wait for the app to launch and page to load

        computer.click(100, 200)
        computer.wait(1)  # Wait for any animations or network requests

        result = computer.screenshot()
        print(
            f"Screenshot URL: {Colors.BLUE}{computer.get_screenshot_url(result)}{Colors.RESET}"
        )


@example(PAGE, "error-handling", title="Error Handling")
def error_handling(client):
    try:
        with client.computer.create(kind="desktop") as computer:
            computer.click(100, 200)
            result = computer.screenshot()
            if result.error_message:
                print(f"Action failed: {Colors.RED}{result.error_message}{Colors.RESET}")
            else:
                print(
                    f"Screenshot URL: {Colors.BLUE}{computer.get_screenshot_url(result)}{Colors.RESET}"
                )

    except tzafon.AuthenticationError:
        print(f"{Colors.RED}Invalid API key{Colors.RESET}")
    except tzafon.RateLimitError:
        print(f"{Colors.RED}Rate limited — slow down{Colors.RESET}")
    except tzafon.APIStatusError as e:
        print(f"{Colors.RED}API error {e.status_code}: {e.message}{Colors.RESET}")


def operate_a_computer(client):
    print(f"{Colors.YELLOW}*** Core Concepts: Operate a Computer ***{Colors.RESET}\n")
    full_example(client)
    working_with_page_context(client)
    handling_waits(client)
    error_handling(client)
