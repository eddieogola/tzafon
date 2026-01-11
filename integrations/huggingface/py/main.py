import os

from smolagents import Tool, CodeAgent, OpenAIServerModel
from dotenv import load_dotenv
from tzafon import Computer


class TzafonWebLoader(Tool):
    name = "tzafon_web_loader"
    description = "Loads a web page from Tzafon and returns the content as a string."
    inputs = {
        "url": {
            "type": "string",
            "description": "The URL of the web page to load.",
        },
    }
    output_type = "string"

    def forward(self, url: str) -> str:
        """Load the web page and return its content."""

        try:
            client = Computer(
                api_key=os.getenv("TZAFON_API_KEY"),
            )
            with client.create(kind="browser") as computer:
                computer.navigate(url)
                computer.wait(2)
                result = computer.html()
                html_content = computer.get_html_content(result)

                return html_content
        except Exception as e:
            print(f"Error loading web page: {e}")
            raise e


def main():
    load_dotenv()
    print("Initializing Agent with OpenAI Model...")

    # Initialize the Tzafon web loader tool
    tzafon_web_loader = TzafonWebLoader()

    # Get model ID from environment or use default
    model_id = os.getenv("OPENAI_MODEL", "gpt-4o")
    print(f"Using model: {model_id}")

    # Create an agent with the Tzafon web loader tool
    # Using OpenAIServerModel for OpenAI integration

    agent = CodeAgent(
        tools=[tzafon_web_loader],
        model=OpenAIServerModel(
            model_id=model_id,
            api_key=os.getenv("OPENAI_API_KEY"),
        ),
    )

    print("\nAgent initialized successfully!")
    print("Available tools:", list(agent.tools.keys()))

    # Example usage
    print("\n" + "=" * 50)
    print("Example: Running agent with tzafon web loader task")
    print("=" * 50)

    try:
        result = agent.run(
            "Summarize the first paragraph of the following URL: https://en.wikipedia.org/wiki/Northern_gannet"
        )
        print(f"\nResult: {result}")
    except Exception as e:
        print(f"\nError running agent: {e}")
        print("\nNote: Make sure OPENAI_API_KEY is set in your .env file.")

    print("\n" + "=" * 50)
    print("Tzafon web loader tool is ready to use!")
    print("=" * 50)


if __name__ == "__main__":
    main()
