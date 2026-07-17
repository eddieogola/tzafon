import os

from utils.example import example

PAGE = "integrations/langchain"


@example(PAGE, "document-loader", title="LangChain: Document Loader")
def document_loader(client):  # noqa: ARG001
    from langchain_tzafon import TzafonLoader

    # Docs show kind="browser" here, but TzafonLoader.__init__ only accepts
    # (urls, api_key, text_content) — passing kind raises TypeError.
    loader = TzafonLoader(
        urls=["https://example.com", "https://example.com/about"],
    )

    documents = loader.load()
    for doc in documents:
        print(doc.page_content[:200])
        print(doc.metadata["url"])


@example(PAGE, "browser-tool-for-agents", title="LangChain: Browser Tool for Agents")
def browser_tool_for_agents(client):  # noqa: ARG001
    from langchain_tzafon import TzafonBrowserTool
    from langchain.agents import AgentType, initialize_agent
    from langchain_openai import ChatOpenAI

    tools = [TzafonBrowserTool()]

    # Use Lightcone's own model via its OpenAI-compatible API
    llm = ChatOpenAI(
        model="tzafon.northstar-cua-fast-1.6",
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


def langchain_integration(client):
    document_loader(client)
    browser_tool_for_agents(client)
