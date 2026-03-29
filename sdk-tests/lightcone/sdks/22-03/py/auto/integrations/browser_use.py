import asyncio
import os
from time import time

from utils.term import Colors


async def _browser_use_with_lightcone(client):
    # Create a Lightcone browser session
    session = client.computers.create(kind="browser")

    # Build the full CDP URL from the relative endpoint path
    cdp_path = session.endpoints.get("cdp")
    cdp_url = f"https://api.tzafon.ai{cdp_path}"

    from browser_use import Agent
    from langchain_openai import ChatOpenAI
    from playwright.async_api import async_playwright

    # Connect Playwright to the Lightcone browser
    pw = await async_playwright().start()
    browser = await pw.chromium.connect_over_cdp(
        cdp_url,
        headers={"Authorization": f"Bearer {os.environ['TZAFON_API_KEY']}"},
    )

    # Use Lightcone's own model via its OpenAI-compatible API
    llm = ChatOpenAI(
        model="tzafon.northstar-cua-fast",
        base_url="https://api.tzafon.ai/v1",
        api_key=os.environ["TZAFON_API_KEY"],
    )

    # Create a Browser-Use agent on the remote browser
    agent = Agent(
        task="Search for 'machine learning' on Wikipedia and summarize the first paragraph",
        llm=llm,
        browser=browser,
    )

    result = await agent.run()
    print(result)

    await browser.close()
    await pw.stop()
    client.computers.delete(session.id)


def browser_use_with_lightcone(client):
    try:
        start_time = time()
        print(
            f"{Colors.YELLOW}*** Browser-Use: With Lightcone Cloud Browser ***{Colors.RESET}\n"
        )
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/integrations/browser-use/#example{Colors.RESET}\n"
        )

        asyncio.run(_browser_use_with_lightcone(client))

    except Exception as e:
        print(f"\n{Colors.RED}Error in browser-use example: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def browser_use_integration(client):
    browser_use_with_lightcone(client)
