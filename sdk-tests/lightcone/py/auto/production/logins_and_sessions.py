import os

from utils.example import check, example
from utils.term import Colors

PAGE = "guides/logins-and-sessions"

# The docs use app.example.com, which doesn't exist. `the-internet` is a public
# demo login with fixed credentials.
LOGIN_URL = "https://the-internet.herokuapp.com/login"
SECURE_URL = "https://the-internet.herokuapp.com/secure"

USERNAME = os.environ.get("APP_USERNAME", "tomsmith")
PASSWORD = os.environ.get("APP_PASSWORD", "SuperSecretPassword!")

ENVIRONMENT_ID = None

# NOTE: Strategy B (human-in-the-loop login handoff) has no example here.
# The docs pass `enable_login_handoff=True` to `agent.tasks.start_stream` and
# branch on `login_required` / `computer_parked` events. None of those exist in
# either SDK — `start_stream` has no such parameter, and the strings appear
# nowhere in the Python or TypeScript packages. Writing it would just assert a
# TypeError.


@example(PAGE, "strategy-a-persistent-sessions", title="Strategy A: Persistent Sessions")
def strategy_a_persistent_sessions(client):
    global ENVIRONMENT_ID

    # One-time setup: create a persistent computer and sign in.
    # The docs block here on `input("Press Enter once you've signed in...")`;
    # the suite runs unattended, so the sign-in is scripted instead.
    with client.computer.create(kind="browser", persistent=True) as computer:
        computer.navigate(LOGIN_URL)
        print(f"Sign in via the live view: {Colors.BLUE}https://lightcone.ai/c/{computer.id}{Colors.RESET}")
        computer.wait(2)

        # Coordinates measured from the 1280x720 screenshot of this page.
        computer.click(390, 250)  # username field
        computer.type(USERNAME)
        computer.click(390, 313)  # password field
        computer.type(PASSWORD)
        computer.hotkey("enter")
        computer.wait(3)

        ENVIRONMENT_ID = computer.id
        # Snapshot is committed when the block exits (computer is deleted)

    # Every run after that: boot already logged in
    with client.computer.create(
        kind="browser",
        environment_id=ENVIRONMENT_ID,
    ) as computer:
        computer.navigate(SECURE_URL)
        computer.wait(2)
        result = computer.screenshot()  # already authenticated
        print(f"Restored: {Colors.BLUE}{computer.get_screenshot_url(result)}{Colors.RESET}")

        content = computer.get_html_content(computer.html())
        check("Logout" in content, "session did not carry over — not authenticated")
        print(f"{Colors.GREEN}Still authenticated{Colors.RESET}")


@example(PAGE, "strategy-c-scripted-login", title="Strategy C: Scripted Login")
def strategy_c_scripted_login(client):
    with client.computer.create(kind="browser", persistent=True) as computer:
        computer.navigate(LOGIN_URL)
        computer.wait(2)

        result = computer.screenshot()  # find the field coordinates
        print(f"Login page: {Colors.BLUE}{computer.get_screenshot_url(result)}{Colors.RESET}")

        # Coordinates measured from the 1280x720 screenshot of this page.
        computer.click(390, 250)  # username field
        computer.type(USERNAME)
        computer.click(390, 313)  # password field
        computer.type(PASSWORD)
        computer.hotkey("enter")
        computer.wait(3)

        content = computer.get_html_content(computer.html())
        check("You logged into a secure area" in content, "login failed")
        print(f"{Colors.GREEN}Login successful{Colors.RESET}")


@example(
    PAGE,
    "session-reuse-for-multi-turn-work",
    title="Session Reuse for Multi-Turn Work",
)
def session_reuse_for_multi_turn_work(client):
    computer = client.computers.create(kind="browser", persistent=True)
    client.computers.navigate(computer.id, url=SECURE_URL)
    saved_computer_id = computer.id

    try:
        task = client.agent.tasks.start(
            instruction="Now export that report as CSV",
            kind="browser",
            computer_id=saved_computer_id,
            on_missing_computer="restore",
        )
        print(f"Task: {Colors.YELLOW}{task.task_id}{Colors.RESET}")
        print(f"Status: {Colors.GREEN}{task.status}{Colors.RESET}")
    finally:
        client.computers.delete(saved_computer_id)


@example(
    PAGE,
    "anti-bot-measures-and-captchas",
    title="Anti-Bot Measures and Captchas",
)
def anti_bot_measures_and_captchas(client):
    with client.computer.create(kind="browser", use_advanced_proxy=True) as computer:
        computer.navigate("https://example.com")
        computer.wait(2)

        result = computer.screenshot()
        print(f"Screenshot URL: {Colors.BLUE}{computer.get_screenshot_url(result)}{Colors.RESET}")
        print(f"{Colors.GREEN}Advanced proxy active{Colors.RESET}")


def logins_and_sessions_guide(client):
    print(f"{Colors.YELLOW}*** Production: Logins and Sessions ***{Colors.RESET}\n")
    strategy_a_persistent_sessions(client)
    strategy_c_scripted_login(client)
    # session_reuse_for_multi_turn_work(client)
    anti_bot_measures_and_captchas(client)
