import os
from dotenv import load_dotenv

# Load environment variables early
load_dotenv()

from langchain_ollama import ChatOllama
from langchain.agents import create_agent
from langchain_core.tools import tool
from langchain_tzafon import TzafonLoader


@tool
def get_website_content(url: str) -> str:
    """
    Retrieves the text content of a website using TzafonLoader.
    Useful for accessing real-time data from web pages, including those with dynamic content.
    """
    loader = TzafonLoader(urls=[url], api_key=os.getenv("TZAFON_API_KEY"))
    docs = loader.load()
    return "\n\n".join([doc.page_content for doc in docs])


model = ChatOllama(model="ministral-3", temperature=0)

# Define the toolset
tools = [get_website_content]


if __name__ == "__main__":
    agent = create_agent(model=model, tools=tools)

    # Example interaction
    user_query = "Summarize the latest information from https://tzafon.ai"
    messages = [
        (
            "system",
            "You are a helpful assistant that summarizes information from websites.",
        ),
        ("human", user_query),
    ]

    print(f"Assistant: Processing query - '{user_query}'")

    try:
        response = agent.invoke({"messages": messages})
        # The response is a state dictionary, the last message is the assistant's response content
        assistant_message = response["messages"][-1].content
        print(f"\nAssistant Response:\n{assistant_message}")
    except Exception as e:
        print(f"\nError occurred: {e}")
        print("\nNote: Please ensure Ollama is running and the model is pulled.")
