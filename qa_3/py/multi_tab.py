import os

from dotenv import load_dotenv
from tzafon import Computer

from auto import list_tabs_direct_api, multi_tab_open, multi_tab_playwright_on_wikipedia


load_dotenv()
API_KEY = os.getenv("TZAFON_API_KEY")

client = Computer(api_key=API_KEY)

multi_tab_playwright_on_wikipedia(client)