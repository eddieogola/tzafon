from utils.example import example
from utils.term import Colors

PAGE = "guides/computers"


@example(PAGE, "create", title="Session Lifecycle: Create")
def session_lifecycle_create(client):
    # High-level wrapper with automatic cleanup
    with client.computer.create(kind="browser") as computer:
        computer.navigate("https://example.com")
        computer.wait(2)

        result = computer.screenshot()
        print(
            f"Screenshot URL: {Colors.BLUE}{computer.get_screenshot_url(result)}{Colors.RESET}"
        )


@example(PAGE, "interact", title="Session Lifecycle: Interact")
def session_lifecycle_interact(client):
    with client.computer.create(kind="browser") as computer:
        computer.navigate("https://example.com")
        computer.click(100, 200)
        computer.type("hello world")
        computer.hotkey("enter")
        computer.scroll(0, 300, 640, 400)  # dx, dy, x, y

        result = computer.screenshot()
        url = computer.get_screenshot_url(result)
        print(f"Screenshot URL: {Colors.BLUE}{url}{Colors.RESET}")

        html_result = computer.html()
        content = computer.get_html_content(html_result)
        print(f"HTML content length: {Colors.YELLOW}{len(content)} chars{Colors.RESET}")


@example(PAGE, "terminate", title="Session Lifecycle: Terminate")
def session_lifecycle_terminate(client):
    # Automatic with context manager (recommended)
    with client.computer.create(kind="browser") as computer:
        computer.navigate("https://example.com")
        computer.wait(2)
        result = computer.screenshot()
        print(
            f"Screenshot URL: {Colors.BLUE}{computer.get_screenshot_url(result)}{Colors.RESET}"
        )
    # session terminates when block exits
    print(f"{Colors.GREEN}Session terminated automatically{Colors.RESET}")

    # Or manual cleanup
    session = client.computers.create(kind="browser")
    try:
        client.computers.navigate(id=session.id, url="https://example.com")
        result = client.computers.screenshot(id=session.id)
        print(
            f"Screenshot URL: {Colors.BLUE}{result.result.get('screenshot_url')}{Colors.RESET}"
        )
    finally:
        client.computers.delete(session.id)
        print(f"{Colors.GREEN}Session terminated manually{Colors.RESET}")


@example(
    PAGE,
    "computersession-high-level-wrapper",
    title="ComputerSession (High-Level Wrapper)",
)
def computer_session_wrapper(client):
    with client.computer.create(kind="browser") as computer:
        computer.navigate("https://example.com")
        computer.click(100, 200)
        result = computer.screenshot()
        url = computer.get_screenshot_url(result)
        print(f"Screenshot URL: {Colors.BLUE}{url}{Colors.RESET}")


@example(PAGE, "actions-reference", title="Actions Reference")
def actions_reference(client):
    with client.computer.create(kind="browser") as computer:
        computer.navigate("https://example.com")
        computer.wait(2)

        # Mouse actions
        print(f"{Colors.YELLOW}--- Mouse Actions ---{Colors.RESET}")
        computer.click(100, 200)  # Left-click
        computer.double_click(100, 200)  # Double-click
        computer.right_click(100, 200)  # Right-click (context menu)

        # Keyboard actions
        print(f"{Colors.YELLOW}--- Keyboard Actions ---{Colors.RESET}")
        computer.type("hello world")
        computer.hotkey("enter")

        # Navigation & viewport
        print(f"{Colors.YELLOW}--- Navigation & Viewport ---{Colors.RESET}")
        computer.navigate("https://example.com")
        computer.scroll(0, 300, 640, 400)  # dx, dy, x, y

        result = computer.screenshot()
        print(
            f"Screenshot URL: {Colors.BLUE}{computer.get_screenshot_url(result)}{Colors.RESET}"
        )

        html_result = computer.html()
        content = computer.get_html_content(html_result)
        print(f"HTML content length: {Colors.YELLOW}{len(content)} chars{Colors.RESET}")


@example(PAGE, "timeouts-and-keepalive", title="Timeouts and Keepalive")
def timeouts_and_keepalive(client):
    with client.computer.create(kind="browser") as computer:
        computer.navigate("https://example.com")
        computer.wait(2)

        # Keep the session alive during long pauses
        computer.keep_alive()
        print(f"{Colors.GREEN}Keep-alive sent{Colors.RESET}")

        result = computer.screenshot()
        print(
            f"Screenshot URL: {Colors.BLUE}{computer.get_screenshot_url(result)}{Colors.RESET}"
        )


@example(PAGE, "persistent-state", title="Persistent Sessions")
def persistent_sessions(client):
    # Save state on termination
    with client.computer.create(kind="browser", persistent=True) as computer:
        computer.navigate("https://example.com")
        computer.wait(2)
        session_id = computer.id
        print(f"Session saved: {Colors.YELLOW}{session_id}{Colors.RESET}")

    # Restore state later using the session ID
    with client.computer.create(
        kind="browser",
        environment_id=session_id,
        persistent=True,  # save again on exit
    ) as computer:
        computer.navigate("https://example.com")
        computer.wait(2)
        result = computer.screenshot()
        print(
            f"Restored session screenshot: {Colors.BLUE}{computer.get_screenshot_url(result)}{Colors.RESET}"
        )
        print(f"{Colors.GREEN}Session restored successfully{Colors.RESET}")


@example(PAGE, "batch-actions", title="Batch Actions")
def batch_actions(client):
    with client.computer.create(kind="browser") as computer:
        results = client.computers.batch(
            computer.id,
            actions=[
                {"type": "go_to_url", "url": "https://example.com"},
                {"type": "click", "x": 100, "y": 200},
                {"type": "screenshot"},
            ],
        )
        print(
            f"Executed: {Colors.YELLOW}{results['executed']}/{results['total']}{Colors.RESET}"
        )
        for r in results["results"]:
            print(f"  Status: {Colors.GREEN}{r['status']}{Colors.RESET}")


@example(PAGE, "proxy-support-browser-mode", title="Proxy Support")
def proxy_support(client):
    # Use the built-in advanced proxy
    with client.computer.create(
        kind="browser",
        use_advanced_proxy=True,
    ) as computer:
        computer.navigate("https://example.com")
        computer.wait(2)

        result = computer.screenshot()
        print(
            f"Screenshot URL: {Colors.BLUE}{computer.get_screenshot_url(result)}{Colors.RESET}"
        )
        print(f"{Colors.GREEN}Advanced proxy active{Colors.RESET}")


def computers(client):
    print(f"{Colors.YELLOW}*** Core Concepts: Computers ***{Colors.RESET}\n")
    session_lifecycle_create(client)
    session_lifecycle_interact(client)
    session_lifecycle_terminate(client)
    computer_session_wrapper(client)
    actions_reference(client)
    timeouts_and_keepalive(client)
    persistent_sessions(client)
    batch_actions(client)
    proxy_support(client)
