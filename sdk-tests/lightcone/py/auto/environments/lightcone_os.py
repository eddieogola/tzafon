from utils.example import example
from utils.term import Colors

PAGE = "guides/lightcone-os"


@example(PAGE, "installing-software", title="Installing Software")
def installing_software(client):
    with client.computer.create(kind="desktop") as computer:
        client.computers.exec.sync(
            computer.id,
            command="apt-get install -y libreoffice",
        )
        client.computers.exec.sync(
            computer.id,
            command="libreoffice --calc &",
        )
        computer.wait(3)

        shot = computer.screenshot()
        print(
            f"Desktop screenshot after install: {Colors.BLUE}{computer.get_screenshot_url(shot)}{Colors.RESET}"
        )


@example(PAGE, "display-configuration", title="Display Configuration")
def display_configuration(client):
    with client.computer.create(
        kind="desktop",
        display={"width": 1920, "height": 1080, "scale": 1.0},
    ) as computer:
        shot = computer.screenshot()
        print(
            f"Configured display screenshot: {Colors.BLUE}{computer.get_screenshot_url(shot)}{Colors.RESET}"
        )


def lightcone_os(client):
    print(f"{Colors.YELLOW}*** Environments: Lightcone OS ***{Colors.RESET}\n")
    installing_software(client)
    display_configuration(client)
