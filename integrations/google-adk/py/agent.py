import os
import asyncio

from dotenv import load_dotenv
from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams
from google.adk.tools.mcp_tool.mcp_toolset import McpToolset
from google.adk.sessions import InMemorySessionService
from mcp import StdioServerParameters
from google.genai import types

load_dotenv()

TZAFON_API_KEY = os.getenv("TZAFON_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

root_agent = Agent(
    model="gemini-2.5-pro",
    name="tzafon_agent",
    instruction="Help users get information from web pages using Tzafon",
    tools=[
        McpToolset(
            connection_params=StdioConnectionParams(
                server_params=StdioServerParameters(
                    command="node",
                    args=[
                        "Tzafon MCP Path Here",
                        "--proxies",
                    ],
                    env={
                        "TZAFON_API_KEY": TZAFON_API_KEY,
                        "GEMINI_API_KEY": GEMINI_API_KEY,
                    },
                ),
                timeout=300,
            ),
        )
    ],
)


async def main(query: str):
    # Create session service and session
    session_service = InMemorySessionService()
    session = await session_service.create_session(
        app_name="tzafon_app", user_id="user1", session_id="session1"
    )
    runner = Runner(
        agent=root_agent, app_name="tzafon_app", session_service=session_service
    )

    content = types.Content(role="user", parts=[types.Part(text=query)])

    # Run with proper parameters
    async for result in runner.run_async(
        session_id=session.id, new_message=content, user_id="user1"
    ):
        print(result.content.parts[0].text)


if __name__ == "__main__":
    asyncio.run(main("Navigate to wikipedia.org and take a screenshot"))
