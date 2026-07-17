import asyncio
import os

from utils.example import example

PAGE = "integrations/playwright"


@example(PAGE, "example", title="Playwright: Sync Example")
def sync_playwright_example(client):
    from playwright.sync_api import sync_playwright

    session = client.computers.create(kind="browser")

    # Build the full CDP URL from the relative endpoint path
    cdp_path = session.endpoints.get("cdp")
    cdp_url = f"https://api.tzafon.ai{cdp_path}"

    with sync_playwright() as p:
        # Connect Playwright with auth headers
        browser = p.chromium.connect_over_cdp(
            cdp_url,
            headers={"Authorization": f"Bearer {os.environ['TZAFON_API_KEY']}"},
        )
        page = browser.contexts[0].pages[0]

        # Use the full Playwright API against an automation-friendly page.
        # Note: search engines (DuckDuckGo/Google/Bing) serve a bot CAPTCHA
        # to the remote browser's datacenter IP, so their result selectors
        # never resolve. TodoMVC is stable and bot-friendly, and still
        # exercises fill + submit + waiting for rendered content.
        page.goto("https://demo.playwright.dev/todomvc/")
        page.fill(".new-todo", "hello world")
        page.press(".new-todo", "Enter")

        # Wait for the rendered result
        page.wait_for_selector(".todo-list li")
        content = page.inner_text(".todo-list")
        print(content[:500])

        browser.close()

    client.computers.delete(session.id)


async def _async_playwright_example():
    from playwright.async_api import async_playwright
    from tzafon import AsyncLightcone

    async_client = AsyncLightcone()
    session = await async_client.computers.create(kind="browser")
    cdp_path = session.endpoints.get("cdp")
    cdp_url = f"https://api.tzafon.ai{cdp_path}"

    async with async_playwright() as p:
        browser = await p.chromium.connect_over_cdp(
            cdp_url,
            headers={"Authorization": f"Bearer {os.environ['TZAFON_API_KEY']}"},
        )
        page = browser.contexts[0].pages[0]
        await page.goto("https://example.com")
        content = await page.inner_text("body")
        print(content[:200])
        await browser.close()

    await async_client.computers.delete(session.id)


@example(PAGE, "async-python", title="Playwright: Async Python")
def async_playwright_example():
    asyncio.run(_async_playwright_example())


def playwright_integration(client):
    sync_playwright_example(client)
    async_playwright_example()
