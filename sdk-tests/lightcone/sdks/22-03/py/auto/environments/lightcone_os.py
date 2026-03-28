from time import time

from utils.term import Colors


def whats_included(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** What is Included ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/lightcone-os/#whats-included{Colors.RESET}\n"
        )
        with client.computer.create(kind="desktop") as computer:
            result = client.computers.exec.sync(
                computer.id,
                command="bash --version | head -n 1 && python3 --version && node --version && git --version",
            )
            print(f"Toolchain:\n{Colors.BLUE}{result.stdout}{Colors.RESET}")

    except Exception as e:
        print(f"\n{Colors.RED}Error in what is included: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def installing_software(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Installing Software ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/lightcone-os/#installing-software{Colors.RESET}\n"
        )
        with client.computer.create(kind="desktop") as computer:
            client.computers.exec.sync(
                computer.id,
                command="apt-get update",
                timeout_seconds=60,
            )
            client.computers.exec.sync(
                computer.id,
                command="apt-get install -y x11-apps",
                timeout_seconds=120,
            )
            client.computers.exec.sync(computer.id, command="xclock &")
            computer.wait(2)

            shot = computer.screenshot()
            print(
                f"Desktop screenshot after install: {Colors.BLUE}{computer.get_screenshot_url(shot)}{Colors.RESET}"
            )

    except Exception as e:
        print(f"\n{Colors.RED}Error in installing software: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def display_configuration(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Display Configuration ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/lightcone-os/#display-configuration{Colors.RESET}\n"
        )
        with client.computer.create(
            kind="desktop",
            display={"width": 1920, "height": 1080, "scale": 1.0},
        ) as computer:
            client.computers.exec.sync(
                computer.id,
                command="firefox https://example.com &",
            )
            computer.wait(3)

            shot = computer.screenshot()
            print(
                f"Configured display screenshot: {Colors.BLUE}{computer.get_screenshot_url(shot)}{Colors.RESET}"
            )

    except Exception as e:
        print(f"\n{Colors.RED}Error in display configuration: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def lightcone_os(client):
    print(f"{Colors.YELLOW}*** Environments: Lightcone OS ***{Colors.RESET}\n")
    whats_included(client)
    installing_software(client)
    display_configuration(client)
