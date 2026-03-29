import os
from time import time

from utils.term import Colors


def document_loader(client):  # noqa: ARG001
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** LangChain: Document Loader ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/integrations/langchain/#document-loader{Colors.RESET}\n"
        )

        from langchain_tzafon import TzafonLoader

        loader = TzafonLoader(
            urls=["https://example.com", "https://example.com/about"],
        )

        documents = loader.load()
        for doc in documents:
            print(doc.page_content[:200])
            print(doc.metadata["url"])

    except Exception as e:
        print(f"\n{Colors.RED}Error in document loader example: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def browser_tool_for_agents(client):  # noqa: ARG001
    try:
        start_time = time()
        print(
            f"{Colors.YELLOW}*** LangChain: Browser Tool for Agents ***{Colors.RESET}\n"
        )
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/integrations/langchain/#browser-tool-for-agents{Colors.RESET}\n"
        )

        from langchain_tzafon import TzafonBrowserTool
        from langchain.agents import AgentType, initialize_agent
        from langchain_openai import ChatOpenAI

        tools = [TzafonBrowserTool()]

        # Use Lightcone's own model via its OpenAI-compatible API
        llm = ChatOpenAI(
            model="tzafon.northstar-cua-fast",
            base_url="https://api.tzafon.ai/v1",
            api_key=os.environ["TZAFON_API_KEY"],
        )

        agent = initialize_agent(
            tools,
            llm,
            agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
        )

        result = agent.run("Go to news.ycombinator.com and tell me the top 3 stories")
        print(result)

    except Exception as e:
        print(
            f"\n{Colors.RED}Error in browser tool for agents example: {e}{Colors.RESET}\n"
        )
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def langchain_integration(client):
    document_loader(client)
    browser_tool_for_agents(client)
