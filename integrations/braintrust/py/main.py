import os
import braintrust
from dotenv import load_dotenv
from playwright.sync_api import sync_playwright
from pydantic import BaseModel
import requests
load_dotenv()

BASE_URL = "https://api.tzafon.ai"
TZAFON_API_KEY = os.getenv("TZAFON_API_KEY")

class LoadPageInput(BaseModel):
    url: str

class LoadPageOutput(BaseModel):
    page: str


def create_computer() -> str:
    print("Creating computer...")
    headers = {
        "Authorization": f"Bearer {TZAFON_API_KEY}",
        "Content-Type": "application/json",
    }
    resp = requests.request(
        "POST",
        f"{BASE_URL}/computers",
        json={"kind": "browser"},
        headers=headers,
        timeout=180,
    )
    data = resp.json()
    print(f"Created computer id={data['id']}")
    return data["id"]

# Load page from the internet
def load_page(input: LoadPageInput) -> LoadPageOutput:
    session_id = create_computer()
    # Verify the correct way to construct CDP URL in Python usage
    cdp_url = f"{BASE_URL}/computers/{session_id}/cdp?token={TZAFON_API_KEY}"

    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp(cdp_url)
        try:
            default_context = browser.contexts[0]
            page = default_context.pages[0]

            page.goto(url)

            readable = page.evaluate("""
                import('https://cdn.skypack.dev/@mozilla/readability').then(readability => {
                  return new readability.Readability(document).parse()
                })
            """)
            
            text = f"{readable.get('title')}\n{readable.get('textContent')}"

            return LoadPageOutput(page=text)
        finally:
            browser.close()


# Create a new project and tool in Braintrust
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
