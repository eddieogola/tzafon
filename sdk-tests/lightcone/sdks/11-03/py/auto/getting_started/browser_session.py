from time import time

from utils.term import Colors


def create_browser_session(client):
    try:
        start_time = time()
        print(
            f"{Colors.YELLOW}*** Testing Creating Browser Session ***{Colors.RESET}\n"
        )
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/quickstart/#3-create-a-browser-and-take-a-screenshot{Colors.RESET}\n"
        )
        with client.computer.create(
            kind="browser",
            timeout_seconds=3600,
            inactivity_timeout_seconds=120,
            display={"width": 1920, "height": 1080, "scale": 1.0},
        ) as computer:
            computer.navigate("https://wikipedia.org")
            computer.wait(2)

            result = computer.screenshot()
            print(
                f"Screenshot URL:{Colors.BLUE}{computer.get_screenshot_url(result)}{Colors.RESET}"
            )
            print(
                f"\n{Colors.GREEN}Browser session created successfully!{Colors.RESET}"
            )
    except Exception as e:
        print(f"\n{Colors.RED}Error creating browser session: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"Execution time: {Colors.YELLOW}{end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )
