from time import time

from utils.term import Colors


def session_lifecycle_create(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Session Lifecycle: Create ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/computers/#create{Colors.RESET}\n"
        )
        # High-level wrapper with automatic cleanup
        with client.computer.create(kind="browser") as computer:
            computer.navigate("https://example.com")
            computer.wait(2)

            result = computer.screenshot()
            print(
                f"Screenshot URL: {Colors.BLUE}{computer.get_screenshot_url(result)}{Colors.RESET}"
            )

    except Exception as e:
        print(f"\n{Colors.RED}Error in session lifecycle create: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def session_lifecycle_interact(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Session Lifecycle: Interact ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/computers/#interact{Colors.RESET}\n"
        )
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
            print(
                f"HTML content length: {Colors.YELLOW}{len(content)} chars{Colors.RESET}"
            )

    except Exception as e:
        print(f"\n{Colors.RED}Error in session lifecycle interact: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def session_lifecycle_terminate(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Session Lifecycle: Terminate ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/computers/#terminate{Colors.RESET}\n"
        )
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

    except Exception as e:
        print(
            f"\n{Colors.RED}Error in session lifecycle terminate: {e}{Colors.RESET}\n"
        )
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def computer_session_wrapper(client):
    try:
        start_time = time()
        print(
            f"{Colors.YELLOW}*** ComputerSession (High-Level Wrapper) ***{Colors.RESET}\n"
        )
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/computers/#computersession-high-level-wrapper{Colors.RESET}\n"
        )
        with client.computer.create(kind="browser") as computer:
            computer.navigate("https://example.com")
            computer.click(100, 200)
            result = computer.screenshot()
            url = computer.get_screenshot_url(result)
            print(f"Screenshot URL: {Colors.BLUE}{url}{Colors.RESET}")

    except Exception as e:
        print(f"\n{Colors.RED}Error in ComputerSession wrapper: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def actions_reference(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Actions Reference ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/computers/#actions-reference{Colors.RESET}\n"
        )
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
            print(
                f"HTML content length: {Colors.YELLOW}{len(content)} chars{Colors.RESET}"
            )

    except Exception as e:
        print(f"\n{Colors.RED}Error in actions reference: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def timeouts_and_keepalive(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Timeouts and Keepalive ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/computers/#timeouts-and-keepalive{Colors.RESET}\n"
        )
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

    except Exception as e:
        print(f"\n{Colors.RED}Error in timeouts and keepalive: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def persistent_sessions(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Persistent Sessions ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/computers/#persistent-sessions{Colors.RESET}\n"
        )
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

    except Exception as e:
        print(f"\n{Colors.RED}Error in persistent sessions: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def batch_actions(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Batch Actions ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/computers/#batch-actions{Colors.RESET}\n"
        )
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

    except Exception as e:
        print(f"\n{Colors.RED}Error in batch actions: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def proxy_support(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Proxy Support ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/computers/#proxy-support{Colors.RESET}\n"
        )
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

    except Exception as e:
        print(f"\n{Colors.RED}Error in proxy support: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


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
