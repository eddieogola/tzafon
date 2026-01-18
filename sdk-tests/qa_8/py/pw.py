import os
import requests
from playwright.sync_api import Playwright, sync_playwright
from dotenv import load_dotenv
load_dotenv()

TOKEN = os.getenv("TZAFON_API_KEY") 

BASE_URL = "https://api.tzafon.ai"

print(BASE_URL)

def create_computer() -> str:
    print("Creating computer...")
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json",
    }
    resp = requests.request(
        "POST",
        f"{BASE_URL}/computers",
        json={"kind": "browser"},
        headers=headers,
        timeout=180,
    )

    print("=" * 20)
    print(resp.content)
    data = resp.json()
    print("Created computer: ", data)
    print("=" * 20)
    print(f"Created computer id={data['id']}")
    return data["id"]


def run(playwright: Playwright, cdp_url: str, computer_id: str) -> None:
    print(f"connecting to cdp url: {cdp_url}")
    browser = playwright.chromium.connect_over_cdp(cdp_url)
    context = browser.new_context()
    page = context.new_page()

    print("opening google page")
    page.evaluate("location.href = 'https://www.google.com'")

    print("waiting for google page to load")
    page.wait_for_function("document.readyState === 'complete' || document.readyState === 'interactive'", timeout=60000)

    print("filling search box")
    page.get_by_role("combobox", name="Search").click()
    page.get_by_role("combobox", name="Search").fill("Tzafon AI")

    print("clicking enter button")
    page.keyboard.press("Enter")

    # print("opening first result")
    # page.wait_for_selector('a:has(h3)', timeout=60000)
    # page.locator('a:has(h3)').first.click()

    # print("waiting for page to load")
    # page.wait_for_function("document.readyState === 'complete' || document.readyState === 'interactive'", timeout=60000)
    # print("Title(tzafon ai):", page.title())

    page.screenshot(path=f"screenshot_{computer_id}.png", full_page=True)
    print(f"Saved screenshot_{computer_id}.png")

    context.close()
    browser.close()


if __name__ == "__main__":
    computer_id = create_computer()
    cdp_url = f"{BASE_URL}/computers/{computer_id}/cdp?token={TOKEN}"
    with sync_playwright() as p:
        run(p, cdp_url, computer_id)