import asyncio
import os
from time import time

from utils.term import Colors


def sync_playwright_example(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Playwright: Sync Example ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/integrations/playwright/#example{Colors.RESET}\n"
        )

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

            # Use the full Playwright API
            page.goto("https://example.com")
            page.fill("input[name='search']", "hello world")
            page.click("button[type='submit']")

            # Wait for results
            page.wait_for_selector(".results")
            content = page.inner_text("body")
            print(content[:500])

            browser.close()

        client.computers.delete(session.id)

    except Exception as e:
        print(f"\n{Colors.RED}Error in sync playwright example: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


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


def async_playwright_example():
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Playwright: Async Python ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/integrations/playwright/#async-python{Colors.RESET}\n"
        )

        asyncio.run(_async_playwright_example())

    except Exception as e:
        print(f"\n{Colors.RED}Error in async playwright example: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def playwright_integration(client):
    sync_playwright_example(client)
    async_playwright_example()
