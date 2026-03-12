import os

from tzafon import Lightcone
from dotenv import load_dotenv
from auto.getting_started.browser_session import create_browser_session
from auto.tutorials.price_tracker import (
    create_browser_and_visit_page,
    extract_price_from_page,
    save_prices_and_detect_changes,
    use_persistent_session_for_faster_checks,
)


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
# Price Tracker - Step 1: Create a browser and visit the page
create_browser_and_visit_page(client)
# Price Tracker - Step 2: Extract the price from the page
extract_price_from_page(client)
# Price Tracker - Step 3: Save prices and detect changes (not implemented in this snippet)
save_prices_and_detect_changes(client)
# Price Tracker - Step 4: Use a persistent session for faster checks
use_persistent_session_for_faster_checks(client)
