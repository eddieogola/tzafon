import re

from utils.example import example
from utils.term import Colors

PAGE = "tutorials/scrape-behind-a-login"

SESSION_ID = None


@example(PAGE, "step-1-navigate-to-the-login-page", title="Navigating to Login Page")
def navigate_to_login_page(client):
    with client.computer.create(kind="browser") as computer:
        computer.navigate("https://quotes.toscrape.com/login")
        computer.wait(2)

        result = computer.screenshot()
        print(
            f"Login page: {Colors.BLUE}{computer.get_screenshot_url(result)}{Colors.RESET}"
        )


@example(PAGE, "step-2-fill-in-the-login-form", title="Filling Login Form")
def fill_login_form(client):
    with client.computer.create(kind="browser") as computer:
        computer.navigate("https://quotes.toscrape.com/login")
        computer.wait(2)

        # Fill in the username
        computer.click(180, 165)  # Username field
        computer.type("scraper")

        # Fill in the password
        computer.click(180, 245)  # Password field
        computer.type("password")

        # Submit
        computer.click(85, 305)  # Login button
        computer.wait(2)

        # Verify login succeeded
        result = computer.screenshot()
        print(
            f"After login: {Colors.BLUE}{computer.get_screenshot_url(result)}{Colors.RESET}"
        )

        # Check the page HTML for confirmation
        html_result = computer.html()
        content = computer.get_html_content(html_result)
        if "Logout" in content:
            print(f"\n{Colors.GREEN}Login successful!{Colors.RESET}")
        else:
            print(
                f"\n{Colors.RED}Login may have failed — check the screenshot{Colors.RESET}"
            )


@example(PAGE, "step-3-save-the-session-for-reuse", title="Saving Session")
def save_session(client):
    global SESSION_ID
    # Log in and save the session
    with client.computer.create(kind="browser", persistent=True) as computer:
        computer.navigate("https://quotes.toscrape.com/login")
        computer.wait(2)

        computer.click(180, 165)
        computer.type("scraper")
        computer.click(180, 245)
        computer.type("password")
        computer.click(85, 305)
        computer.wait(2)

        # Verify login
        html_result = computer.html()
        content = computer.get_html_content(html_result)
        if "Logout" not in content:
            raise Exception("Login failed")

        SESSION_ID = computer.id
        print(f"Session saved: {Colors.YELLOW}{SESSION_ID}{Colors.RESET}")


@example(
    PAGE,
    "step-4-restore-the-session-and-scrape",
    title="Restoring Session and Scraping",
)
def restore_session_and_scrape(client):
    if not SESSION_ID:
        raise Exception("No session ID found. Run the save_session step first.")

    with client.computer.create(
        kind="browser",
        environment_id=SESSION_ID,
    ) as computer:
        # Go directly to an authenticated page
        computer.navigate("https://quotes.toscrape.com")
        computer.wait(2)

        # Verify we're still logged in
        html_result = computer.html()
        content = computer.get_html_content(html_result)

        if "Logout" not in content:
            print("Session expired — need to log in again")
        else:
            # Extract quotes
            quotes = re.findall(r'class="text" itemprop="text">(.*?)<', content)
            authors = re.findall(r'class="author" itemprop="author">(.*?)<', content)

            for quote, author in zip(quotes, authors):
                # Clean up HTML entities
                quote = quote.replace("&#8220;", '"').replace("&#8221;", '"')
                print(f"{quote} — {author}")


@example(
    PAGE,
    "step-5-let-northstar-handle-the-login",
    title="Let Northstar Handle the Login",
)
def let_northstar_handle_login(client):
    for event in client.agent.tasks.start_stream(
        instruction=(
            "Go to https://quotes.toscrape.com/login. "
            "Log in with username 'scraper' and password 'password'. "
            "After logging in, extract all the quotes and their authors from the homepage. "
            "Report each quote with its author."
        ),
        kind="browser",
        max_steps=20,
    ):
        print(event)
        if event.get("type") == "completed":
            break


def scrape_behind_login(client):
    navigate_to_login_page(client)
    fill_login_form(client)
    save_session(client)
    restore_session_and_scrape(client)
    let_northstar_handle_login(client)
