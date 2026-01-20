import requests
import time
from playwright.sync_api import Playwright, sync_playwright
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration
BASE_URL = "https://api.tzafon.ai"
TOKEN = os.getenv("TZAFON_API_KEY")

# Proxy configuration (example using Oxylabs)
PROXY = "http://username:password@proxy-server:port"


def create_computer_with_proxy() -> str:
    """Create a Tzafon browser session and configure proxy."""
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json",
    }

    # Step 1: Create the browser session
    print("Creating browser session...")
    resp = requests.post(
        f"{BASE_URL}/computers",
        json={"kind": "browser"},
        headers=headers,
        timeout=180,
    )
    data = resp.json()
    computer_id = data["id"]
    print(f"Created computer: {computer_id}")

    # Step 2: Set the proxy
    print("Configuring proxy...")
    resp = requests.post(
        f"{BASE_URL}/computers/{computer_id}/execute",
        json={"action": {"type": "change_proxy", "proxy_url": PROXY}},
        headers=headers,
        timeout=180,
    )

    if resp.status_code == 200:
        print("Proxy configured successfully")
    else:
        print(f"Proxy configuration failed: {resp.content}")

    return computer_id


def run_playwright(playwright: Playwright, cdp_url: str, computer_id: str) -> None:
    """Connect Playwright and perform automation."""
    print(f"Connecting to CDP: {cdp_url}")

    # Connect to the Tzafon browser via CDP
    browser = playwright.chromium.connect_over_cdp(cdp_url)

    # Get the existing context and page
    context = browser.contexts[0]
    page = context.pages[0]

    try:
        # Navigate to a page
        print("Navigating to website...")
        page.goto("https://httpbin.org/ip", wait_until="networkidle", timeout=30000)

        # Wait for content to load
        time.sleep(2)

        # Take a screenshot
        page.screenshot(path="screenshot_with_proxy.png")
        print("Screenshot saved: screenshot_with_proxy.png")

        # Get the page content (shows IP from proxy)
        content = page.content()
        print(f"Page content: {content[:500]}")

    except Exception as e:
        print(f"Error during automation: {e}")

    finally:
        # Clean up
        context.close()
        browser.close()


def terminate_computer(computer_id: str) -> None:
    """Terminate the browser session."""
    headers = {"Authorization": f"Bearer {TOKEN}"}
    requests.delete(f"{BASE_URL}/computers/{computer_id}", headers=headers)
    print(f"Terminated computer: {computer_id}")


if __name__ == "__main__":
    computer_id = create_computer_with_proxy()

    try:
        cdp_url = f"{BASE_URL}/computers/{computer_id}/cdp?token={TOKEN}"

        with sync_playwright() as p:
            run_playwright(p, cdp_url, computer_id)
    finally:
        terminate_computer(computer_id)
