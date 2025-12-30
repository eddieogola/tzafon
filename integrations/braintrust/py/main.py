import os
import braintrust
from dotenv import load_dotenv
from playwright.async_api import async_playwright
from pydantic import BaseModel
import requests
from tzafon import Computer
load_dotenv()

BASE_URL = "https://api.tzafon.ai"
TZAFON_API_KEY = os.getenv("TZAFON_API_KEY")

class LoadPageInput(BaseModel):
    url: str

class LoadPageOutput(BaseModel):
    page: str

async def load_page(url: str) -> LoadPageOutput:
    client = Computer(api_key=TZAFON_API_KEY)
    session = client.create(kind="browser")

    cdp_url = f"{BASE_URL}/computers/{session.id}/cdp?token={TZAFON_API_KEY}"

    async with async_playwright() as p:
        browser = await p.chromium.connect_over_cdp(cdp_url)
        try:
            default_context = browser.contexts[0]
            page = default_context.pages[0]

            await page.goto(url)
            text = await page.content()

            result = LoadPageOutput(page=text)
            return result.model_dump_json()
        finally:
            await browser.close()


project = braintrust.projects.create(name="TZAFON API Tool - Python")

project.tools.create(
    handler=load_page,
    parameters=LoadPageInput,
    returns=LoadPageOutput,
    name="Load page",
    slug="load-page",
    description="Load a page from the internet",
    if_exists="replace",
)
