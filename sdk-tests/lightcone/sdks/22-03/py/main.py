import os

from tzafon import Lightcone
from dotenv import load_dotenv
from auto.getting_started.browser_session import create_browser_session
from auto.tutorials.price_tracker import build_price_tracker
from auto.tutorials.login_scrape import scrape_behind_login
from auto.tutorials.automate_form import automate_form_with_ai
from auto.environments.computers import computers
from auto.environments.operate import operate_a_computer
from auto.environments.execute_shell import execute_shell
from auto.environments.manage_browser_tabs import manage_browser_tabs
from auto.environments.lightcone_os import lightcone_os
from auto.use_cases.software_testing import software_testing
from auto.use_cases.legacy_software import legacy_software
from auto.use_cases.cross_app_workflows import cross_app_workflows
from auto.using_northstar.tasks import tasks_guide
from auto.using_northstar.run_a_task import run_a_task_guide
from auto.using_northstar.responses_api import responses_api_guide
from auto.using_northstar.cua_protocol import cua_protocol_guide
from auto.using_northstar.coordinates import coordinates_guide
from auto.using_northstar.chat_completions import chat_completions_guide
from auto.integrations.langchain import langchain_integration
from auto.integrations.crewai import crewai_integration
from auto.integrations.browser_use import browser_use_integration
from auto.integrations.playwright import playwright_integration
from auto.integrations.kernel import kernel_integration


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
# automate_form_with_ai(client)

"""
Core Concepts
https://docs.lightcone.ai/guides/computers/

"""
# computers(client)

"""
Core Concepts
https://docs.lightcone.ai/guides/operate-a-computer/

"""
# operate_a_computer(client)

"""
Environments
https://docs.lightcone.ai/guides/shell-commands/

"""
# execute_shell(client)

"""
Environments
https://docs.lightcone.ai/guides/browser-tabs/

"""
# manage_browser_tabs(client)

"""
Environments
https://docs.lightcone.ai/guides/lightcone-os/

"""
# lightcone_os(client)

"""
Use Cases
https://docs.lightcone.ai/use-cases/software-testing/

"""
# software_testing(client)

"""
Use Cases
https://docs.lightcone.ai/use-cases/legacy-software/

"""
# legacy_software(client)

"""
Use Cases
https://docs.lightcone.ai/use-cases/cross-app-workflows/

"""
# cross_app_workflows(client)

"""
Using Northstar
https://docs.lightcone.ai/guides/tasks/

"""
# tasks_guide(client)

"""
Using Northstar
https://docs.lightcone.ai/guides/run-a-task/

"""
# run_a_task_guide(client)

"""
Using Northstar
https://docs.lightcone.ai/guides/responses-api/

"""
# responses_api_guide(client)

"""
Using Northstar
https://docs.lightcone.ai/guides/cua-protocol/

"""
# cua_protocol_guide(client)

"""
Using Northstar
https://docs.lightcone.ai/guides/coordinates/

"""
# coordinates_guide(client)

"""
Using Northstar
https://docs.lightcone.ai/guides/chat-completions/

"""
# chat_completions_guide(client)

"""
Integrations
https://docs.lightcone.ai/integrations/langchain/

"""
langchain_integration(client)

"""
Integrations
https://docs.lightcone.ai/integrations/crewai/

"""
# crewai_integration(client)

"""
Integrations
https://docs.lightcone.ai/integrations/browser-use/

"""
# browser_use_integration(client)

"""
Integrations
https://docs.lightcone.ai/integrations/playwright/

"""
# playwright_integration(client)

"""
Integrations
https://docs.lightcone.ai/integrations/kernel/

"""
# kernel_integration(client)
