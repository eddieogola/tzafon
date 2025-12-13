import os
import threading


from dotenv import load_dotenv

from auto import (
    bnb_search_for_homes,
    change_wikipedia_language_and_right_click,
    github_search_for_tzafon,
    ny_times_check_robots_txt,
    ny_times_scroll_to_bottom,
    search_for_sf_and_drag,
    checkout_at_target,
    list_tabs_execution_action,
    list_tabs_direct_api,
    multi_tab_open
)

load_dotenv()
API_KEY = os.getenv("TZAFON_API_KEY")

from tzafon import Computer

# client = Computer(api_key=API_KEY)

# change_wikipedia_language_and_right_click(client)
# ny_times_scroll_to_bottom(client)
# ny_times_check_robots_txt(client)
# bnb_search_for_homes(client)
# github_search_for_tzafon(client)
# search_for_sf_and_drag(client)
# checkout_at_target(client) -> target is not working at the moment.
# list_tabs_execution_action(client)
# list_tabs_direct_api(client)
# multi_tab_open(client)

# def run_browser():
#     search_for_sf_and_drag(client)

# threads = [threading.Thread(target=run_browser) for _ in range(100)]

# for t in threads:
#     t.start()
# for t in threads:
#     t.join()

# computer = client.create(kind="browser")
# # computer.navigate("https://google.com")
# # computer.navigate("https://www.nytimes.com/")
# computer.navigate("https://github.com/")
# result = computer.html()
# html_content = computer.get_html_content(result)
# print(type(html_content))
# print(html_content)
# computer.terminate()


from playwright.sync_api import Playwright, sync_playwright

BASE_URL = "https://api.tzafon.ai"
TOKEN = API_KEY

def create_computer() -> str:
    # print("Creating computer...")
    # headers = {
    #     "Authorization": f"Bearer {TOKEN}",
    #     "Content-Type": "application/json",
    # }
    # resp = requests.request(
    #     "POST",
    #     f"{BASE_URL}/computers",
    #     json={"kind": "browser"},
    #     headers=headers,
    #     timeout=180,
    # )
    # data = resp.json()
    # print(data)
    # print(f"Created computer id={data['id']}")
    # return data["id"]
    client = Computer(api_key=API_KEY)
    return client.create(kind="browser").id 


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

