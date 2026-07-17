from utils.example import example
from utils.term import Colors

PAGE = "guides/chat-completions"


@example(PAGE, "basic-usage", title="Chat Completions: Basic Usage")
def basic_chat_completion(client):
    result = client.chat.create_completion(
        model="tzafon.northstar-cua-fast-1.6",
        messages=[
            {"role": "user", "content": "What is the capital of France?"},
        ],
    )
    print(result)


@example(PAGE, "tool-calling", title="Chat Completions: Tool Calling")
def tool_calling_chat_completion(client):
    result = client.chat.create_completion(
        model="tzafon.northstar-cua-fast-1.6",
        messages=[
            {
                "role": "user",
                "content": "What's the weather in San Francisco?",
            },
        ],
        tools=[
            {
                "type": "function",
                "function": {
                    "name": "get_weather",
                    "description": "Get the current weather for a location",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "location": {
                                "type": "string",
                                "description": "City name",
                            }
                        },
                        "required": ["location"],
                    },
                },
            }
        ],
    )
    print(result)

    models = client.models.list()
    print(f"Models: {models}")


def chat_completions_guide(client):
    print(f"{Colors.YELLOW}*** Using Northstar: Chat Completions ***{Colors.RESET}\n")
    basic_chat_completion(client)
    tool_calling_chat_completion(client)
