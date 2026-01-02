import os

from browser_use import (
    Agent,
    Controller,
    BrowserProfile,
    BrowserSession,
    ChatOpenAI,
)
from dotenv import load_dotenv
from tzafon import Computer

load_dotenv()


"""
1. Initialize Tzafon Browser and get the CDP URL
"""
BASE_URL = "https://api.tzafon.ai"
TZAFON_API_KEY = os.getenv("TZAFON_API_KEY")

client = Computer(
    api_key=TZAFON_API_KEY,
)

computer = client.create(kind="browser")

cdp_url = f"{BASE_URL}/computers/{computer.id}/cdp?token={TZAFON_API_KEY}"


"""
2. Initialize Browser Use iwth Tzafon CDP URL
"""

llm = ChatOpenAI(
    model="gpt-4o",
    api_key=os.getenv("OPENAI_API_KEY"),
)

profile = BrowserProfile(keep_alive=True)
browser_session = BrowserSession(
    browser_profile=profile,
    keep_alive=True,
    cdp_url=cdp_url,
)


controller = Controller()
agent = Agent(
    task="Describe your task here",
    llm=llm,
    enable_memory=False,
    use_vision=False,
    browser_session=browser_session,
    controller=controller,
)


async def keep_session_alive(computer_id):
    while True:
        client.computers.keep_alive(computer_id)
        await asyncio.sleep(10)


async def main():
    keep_alive_task = asyncio.create_task(keep_session_alive(computer.id))
    try:
        await agent.run(max_steps=20)
    finally:
        keep_alive_task.cancel()


"""
3. Run the agent
"""
if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
