from time import time

from utils.term import Colors


def list_open_tabs(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** List Open Tabs ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/browser-tabs/#list-open-tabs{Colors.RESET}\n"
        )
        with client.computer.create(kind="browser") as computer:
            computer.navigate("https://example.com")
            result = client.computers.tabs.list(computer.id)
            print(f"Tabs: {Colors.BLUE}{result.result}{Colors.RESET}")

    except Exception as e:
        print(f"\n{Colors.RED}Error listing tabs: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def open_and_switch_tabs(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Open and Switch Tabs ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/browser-tabs/#switch-between-tabs{Colors.RESET}\n"
        )
        with client.computer.create(kind="browser") as computer:
            computer.navigate(
                "https://en.wikipedia.org/wiki/Python_(programming_language)"
            )
            client.computers.tabs.create(
                computer.id,
                url="https://en.wikipedia.org/wiki/JavaScript",
            )
            computer.wait(1)

            tabs_result = client.computers.tabs.list(computer.id)
            tabs = tabs_result.result or []
            print(f"Open tabs: {Colors.BLUE}{tabs}{Colors.RESET}")

            first_tab = next(
                (
                    tab
                    for tab in tabs
                    if getattr(tab, "url", "") and "Python" in getattr(tab, "url", "")
                ),
                None,
            )
            if first_tab and getattr(first_tab, "id", None):
                client.computers.tabs.switch(first_tab.id, id=computer.id)
                shot = computer.screenshot()
                print(
                    f"Switched tab screenshot: {Colors.BLUE}{computer.get_screenshot_url(shot)}{Colors.RESET}"
                )

    except Exception as e:
        print(f"\n{Colors.RED}Error opening/switching tabs: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def close_tab(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Close a Tab ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/browser-tabs/#close-a-tab{Colors.RESET}\n"
        )
        with client.computer.create(kind="browser") as computer:
            computer.navigate("https://example.com")
            client.computers.tabs.create(computer.id, url="https://example.org")
            computer.wait(1)

            tabs_result = client.computers.tabs.list(computer.id)
            tabs = tabs_result.result or []
            closable = next(
                (
                    tab
                    for tab in tabs
                    if not getattr(tab, "is_main_tab", False)
                    and getattr(tab, "id", None)
                ),
                None,
            )

            if closable:
                client.computers.tabs.delete(closable.id, id=computer.id)
                print(f"{Colors.GREEN}Closed non-main tab{Colors.RESET}")
            else:
                print(f"{Colors.YELLOW}No non-main tab found to close{Colors.RESET}")

    except Exception as e:
        print(f"\n{Colors.RED}Error closing tab: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def target_specific_tab_for_actions(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Target Specific Tab for Actions ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/browser-tabs/#target-a-specific-tab-for-actions{Colors.RESET}\n"
        )
        with client.computer.create(kind="browser") as computer:
            computer.navigate("https://example.com")
            client.computers.tabs.create(computer.id, url="https://example.org")
            computer.wait(1)

            tabs_result = client.computers.tabs.list(computer.id)
            tabs = tabs_result.result or []
            background_tab = next(
                (
                    tab
                    for tab in tabs
                    if getattr(tab, "url", "")
                    and "example.org" in getattr(tab, "url", "")
                ),
                None,
            )

            if background_tab and getattr(background_tab, "id", None):
                shot = client.computers.screenshot(
                    computer.id, tab_id=background_tab.id
                )
                print(
                    f"Background tab screenshot: {Colors.BLUE}{shot.result.get('screenshot_url')}{Colors.RESET}"
                )

                client.computers.type(
                    computer.id,
                    text="hello from background tab",
                    tab_id=background_tab.id,
                )
                print(
                    f"{Colors.GREEN}Typed into background tab using tab_id{Colors.RESET}"
                )

    except Exception as e:
        print(f"\n{Colors.RED}Error targeting specific tab: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def compare_two_pages(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Example: Compare Two Pages ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/browser-tabs/#example-compare-two-pages{Colors.RESET}\n"
        )
        with client.computer.create(kind="browser") as computer:
            # Open first page
            computer.navigate(
                "https://en.wikipedia.org/wiki/Python_(programming_language)"
            )
            print(f"{Colors.YELLOW}Opened first page (Python){Colors.RESET}")

            # Open second page in a new tab
            client.computers.tabs.create(
                computer.id,
                url="https://en.wikipedia.org/wiki/JavaScript",
            )
            print(f"{Colors.YELLOW}Opened second page (JavaScript){Colors.RESET}")
            computer.wait(2)

            # Screenshot the second tab (now active)
            second_shot = computer.screenshot()
            print(
                f"Tab 2 screenshot: {Colors.BLUE}{computer.get_screenshot_url(second_shot)}{Colors.RESET}"
            )

            # List tabs and switch back to first
            tabs_result = client.computers.tabs.list(computer.id)
            tabs = tabs_result.result or []
            print(f"Open tabs: {Colors.BLUE}{tabs}{Colors.RESET}")

            python_tab = next(
                (
                    tab
                    for tab in tabs
                    if getattr(tab, "url", "") and "Python" in getattr(tab, "url", "")
                ),
                None,
            )
            if python_tab and getattr(python_tab, "id", None):
                client.computers.tabs.switch(python_tab.id, id=computer.id)
                first_shot = computer.screenshot()
                print(
                    f"Tab 1 screenshot: {Colors.BLUE}{computer.get_screenshot_url(first_shot)}{Colors.RESET}"
                )

    except Exception as e:
        print(f"\n{Colors.RED}Error comparing two pages: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def manage_browser_tabs(client):
    print(f"{Colors.YELLOW}*** Environments: Manage Browser Tabs ***{Colors.RESET}\n")
    list_open_tabs(client)
    open_and_switch_tabs(client)
    close_tab(client)
    target_specific_tab_for_actions(client)
    compare_two_pages(client)
