import tzafon
from time import time

from utils.term import Colors

URL = "https://wikipedia.org"


def full_example(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Full Example ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/operate-a-computer/#the-full-example{Colors.RESET}\n"
        )
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

    except Exception as e:
        print(f"\n{Colors.RED}Error in full example: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def working_with_page_context(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Working with Page Context ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/operate-a-computer/#working-with-page-context{Colors.RESET}\n"
        )
        with client.computer.create(kind="desktop") as computer:
            client.computers.exec.sync(
                computer.id, command=f"nohup firefox {URL} > /dev/null 2>&1 &"
            )
            computer.wait(3)

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
            print(
                f"Page size: {Colors.YELLOW}{ctx.page_width}x{ctx.page_height}{Colors.RESET}"
            )
            print(
                f"Scroll position: {Colors.YELLOW}({ctx.scroll_x}, {ctx.scroll_y}){Colors.RESET}"
            )

    except Exception as e:
        print(f"\n{Colors.RED}Error in working with page context: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def handling_waits(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Handling Waits ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/operate-a-computer/#handling-waits{Colors.RESET}\n"
        )
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

    except Exception as e:
        print(f"\n{Colors.RED}Error in handling waits: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def error_handling(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Error Handling ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/operate-a-computer/#error-handling{Colors.RESET}\n"
        )
        with client.computer.create(kind="desktop") as computer:
            computer.click(100, 200)
            result = computer.screenshot()
            if result.error_message:
                print(
                    f"Action failed: {Colors.RED}{result.error_message}{Colors.RESET}"
                )
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
    except Exception as e:
        print(f"\n{Colors.RED}Error in error handling: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def operate_a_computer(client):
    print(f"{Colors.YELLOW}*** Core Concepts: Operate a Computer ***{Colors.RESET}\n")
    full_example(client)
    working_with_page_context(client)
    handling_waits(client)
    error_handling(client)
