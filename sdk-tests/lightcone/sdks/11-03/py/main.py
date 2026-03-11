from tzafon import Lightcone
from dotenv import load_dotenv

load_dotenv()

client = Lightcone()

'''
Getting Started

'''

from auto.getting_started.browser_session import create_browser_session

create_browser_session(client)