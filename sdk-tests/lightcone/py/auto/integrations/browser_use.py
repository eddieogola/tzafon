import asyncio
import os

from utils.example import example
from utils.term import Colors

PAGE = "integrations/browser-use"


async def _browser_use_with_lightcone(client):
    # Create a Lightcone browser session
    session = client.computers.create(kind="browser")

    # Build the full CDP URL from the relative endpoint path
    cdp_path = session.endpoints.get("cdp")
    cdp_url = f"https://api.tzafon.ai{cdp_path}?token={os.getenv('TZAFON_API_KEY')}"

    from browser_use import (
        Agent,
        ChatOpenAI,
        Controller,
        BrowserSession,
        BrowserProfile,
    )
    from playwright.async_api import async_playwright

    # Connect Playwright to the Lightcone browser
    pw = None
    browser_session = None
    try:
        pw = await async_playwright().start()

        profile = BrowserProfile(keep_alive=True)
        browser_session = BrowserSession(
            browser_profile=profile,
            keep_alive=True,
            cdp_url=cdp_url,
        )

        # Use Lightcone's own model via its OpenAI-compatible API
        llm = ChatOpenAI(
            model="tzafon.northstar-cua-fast-1.6",
            base_url="https://api.tzafon.ai/v1",
            api_key=os.environ["TZAFON_API_KEY"],
        )
        controller = Controller()

        # Create a Browser-Use agent on the remote browser
        agent = Agent(
            task="Search for 'machine learning' on Wikipedia and summarize the first paragraph",
            llm=llm,
            browser_session=browser_session,
            controller=controller,
        )

        result = await agent.run()
        print(result)
    finally:
        # Release resources even if agent.run() fails (e.g. WebSocket drops).
        # Each teardown step is guarded so one failure can't mask the original error.
        if browser_session is not None:
            try:
                # kill() sets _intentional_stop (stopping the auto-reconnect loop)
                # and stops the event bus, cancelling the background reconnect task.
                # There is no close() on BrowserSession in this version.
                await browser_session.kill()
            except Exception as e:
                print(f"{Colors.RED}Warning: browser_session.kill() failed: {e}{Colors.RESET}")
        if pw is not None:
            try:
                await pw.stop()
            except Exception as e:
                print(f"{Colors.RED}Warning: playwright.stop() failed: {e}{Colors.RESET}")
        try:
            client.computers.delete(session.id)
        except Exception as e:
            print(f"{Colors.RED}Warning: computers.delete() failed: {e}{Colors.RESET}")


@example(PAGE, "example", title="Browser-Use: With Lightcone Cloud Browser")
def browser_use_with_lightcone(client):
    asyncio.run(_browser_use_with_lightcone(client))


def browser_use_integration(client):
    browser_use_with_lightcone(client)
