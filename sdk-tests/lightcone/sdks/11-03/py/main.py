import os

from tzafon import Lightcone
from dotenv import load_dotenv
from auto.getting_started.browser_session import create_browser_session
from auto.tutorials.price_tracker import build_price_tracker
from auto.tutorials.login_scrape import scrape_behind_login


load_dotenv()

client = Lightcone(
    api_key=os.getenv("TZAFON_API_KEY"),
    timeout=30.0,  # seconds
    max_retries=3,
)

"""
Getting Started
https://docs.lightcone.ai/guides/quickstart/

"""
# create_browser_session(client)

"""
Tutorials
https://docs.lightcone.ai/tutorials/build-a-price-tracker/

"""
# build_price_tracker(client)
# scrape_behind_login(client)
