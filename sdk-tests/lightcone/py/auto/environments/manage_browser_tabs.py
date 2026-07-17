from utils.example import example
from utils.term import Colors

PAGE = "guides/browser-tabs"


@example(PAGE, "list-open-tabs", title="List Open Tabs")
def list_open_tabs(client):
    with client.computer.create(kind="browser") as computer:
        computer.navigate("https://example.com")
        result = client.computers.tabs.list(computer.id)
        print(f"Tabs: {Colors.BLUE}{result.result}{Colors.RESET}")


@example(PAGE, "switch-between-tabs", title="Open and Switch Tabs")
def open_and_switch_tabs(client):
    with client.computer.create(kind="browser") as computer:
        computer.navigate("https://en.wikipedia.org/wiki/Python_(programming_language)")
        client.computers.tabs.create(
            computer.id,
            url="https://en.wikipedia.org/wiki/JavaScript",
        )
        computer.wait(1)

        tabs_result = client.computers.tabs.list(computer.id)
        tabs = tabs_result.result.get("tabs", [])
        print(f"Open tabs: {Colors.BLUE}{tabs}{Colors.RESET}")

        first_tab = next(
            (tab for tab in tabs if tab.get("url", "") and "Python" in tab.get("url", "")),
            None,
        )

        if first_tab and first_tab.get("tab_id"):
            client.computers.tabs.switch(first_tab["tab_id"], id=computer.id)
            shot = computer.screenshot()
            print(
                f"Switched tab screenshot: {Colors.BLUE}{computer.get_screenshot_url(shot)}{Colors.RESET}"
            )


@example(PAGE, "close-a-tab", title="Close a Tab")
def close_tab(client):
    with client.computer.create(kind="browser") as computer:
        computer.navigate("https://example.com")
        client.computers.tabs.create(computer.id, url="https://example.org")
        computer.wait(1)

        tabs_result = client.computers.tabs.list(computer.id)
        tabs = tabs_result.result.get("tabs", [])
        closable = next(
            # The API returns is_main only on the main tab (docs say is_main_tab — wrong).
            (tab for tab in tabs if not tab.get("is_main", False) and tab.get("tab_id")),
            None,
        )

        if closable:
            client.computers.tabs.delete(closable["tab_id"], id=computer.id)
            print(f"{Colors.GREEN}Closed non-main tab{Colors.RESET}")
        else:
            print(f"{Colors.YELLOW}No non-main tab found to close{Colors.RESET}")


@example(
    PAGE,
    "target-a-specific-tab-for-actions",
    title="Target Specific Tab for Actions",
)
def target_specific_tab_for_actions(client):
    with client.computer.create(kind="browser") as computer:
        computer.navigate("https://example.com")
        client.computers.tabs.create(computer.id, url="https://example.org")
        computer.wait(1)

        tabs_result = client.computers.tabs.list(computer.id)
        tabs = tabs_result.result.get("tabs", [])
        background_tab = next(
            (
                tab
                for tab in tabs
                if tab.get("url", "") and "example.org" in tab.get("url", "")
            ),
            None,
        )

        if background_tab and background_tab.get("tab_id"):
            shot = client.computers.screenshot(
                computer.id, tab_id=background_tab["tab_id"]
            )
            print(
                f"Background tab screenshot: {Colors.BLUE}{shot.result.get('screenshot_url')}{Colors.RESET}"
            )

            client.computers.type(
                computer.id,
                text="hello from background tab",
                tab_id=background_tab["tab_id"],
            )
            print(f"{Colors.GREEN}Typed into background tab using tab_id{Colors.RESET}")


@example(PAGE, "example-compare-two-pages", title="Example: Compare Two Pages")
def compare_two_pages(client):
    with client.computer.create(kind="browser") as computer:
        # Open first page
        computer.navigate("https://en.wikipedia.org/wiki/Python_(programming_language)")
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
        tabs = tabs_result.result.get("tabs", [])
        print(f"Open tabs: {Colors.BLUE}{tabs}{Colors.RESET}")

        python_tab = next(
            (tab for tab in tabs if tab.get("url", "") and "Python" in tab.get("url", "")),
            None,
        )
        if python_tab and python_tab.get("tab_id"):
            client.computers.tabs.switch(python_tab["tab_id"], id=computer.id)
            first_shot = computer.screenshot()
            print(
                f"Tab 1 screenshot: {Colors.BLUE}{computer.get_screenshot_url(first_shot)}{Colors.RESET}"
            )


def manage_browser_tabs(client):
    print(f"{Colors.YELLOW}*** Environments: Manage Browser Tabs ***{Colors.RESET}\n")
    list_open_tabs(client)
    open_and_switch_tabs(client)
    close_tab(client)
    target_specific_tab_for_actions(client)
    compare_two_pages(client)
