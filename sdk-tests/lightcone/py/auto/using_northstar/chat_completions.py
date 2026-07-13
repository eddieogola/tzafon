from time import time

from utils.term import Colors


def basic_chat_completion(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Chat Completions: Basic Usage ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/chat-completions/#basic-usage{Colors.RESET}\n"
        )

        result = client.chat.create_completion(
            model="tzafon.northstar-cua-fast",
            messages=[
                {"role": "user", "content": "What is the capital of France?"},
            ],
        )
        print(result)

    except Exception as e:
        print(f"\n{Colors.RED}Error in basic chat completion: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def tool_calling_chat_completion(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Chat Completions: Tool Calling ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/chat-completions/#tool-calling{Colors.RESET}\n"
        )

        result = client.chat.create_completion(
            model="tzafon.northstar-cua-fast",
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

    except Exception as e:
        print(
            f"\n{Colors.RED}Error in tool-calling chat completion: {e}{Colors.RESET}\n"
        )
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def chat_completions_guide(client):
    print(f"{Colors.YELLOW}*** Using Northstar: Chat Completions ***{Colors.RESET}\n")
    basic_chat_completion(client)
    tool_calling_chat_completion(client)
