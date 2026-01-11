# HuggingFace Agent with Calculator Tool

A Python project demonstrating how to create a HuggingFace agent with a simple calculator tool using the `smolagents` framework.

## Features

- Custom Calculator Tool that performs basic arithmetic operations (add, subtract, multiply, divide)
- HuggingFace CodeAgent that can understand natural language requests and use the calculator tool
- Built with `uv` for fast dependency management

## Prerequisites

- Python 3.12+
- uv package manager
- HuggingFace account and API token (optional, but recommended for better performance)

## Setup

1. Install dependencies:
```bash
uv sync
```

2. (Optional) Set your HuggingFace API token:
```bash
export HUGGINGFACE_TOKEN=your_token_here
```

You can get a token from https://huggingface.co/settings/tokens

## Usage

Run the agent:
```bash
uv run main.py
```

The example will demonstrate the agent solving a multiplication problem: "What is 25 multiplied by 4?"

## Calculator Tool

The `CalculatorTool` supports the following operations:
- `add`: Addition
- `subtract`: Subtraction
- `multiply`: Multiplication
- `divide`: Division (with zero-division protection)

## How It Works

1. **CalculatorTool**: A custom tool that inherits from `smolagents.Tool` and implements the `forward` method to perform calculations
2. **CodeAgent**: A HuggingFace agent that can understand natural language and decide when to use the calculator tool
3. **HfApiModel**: Uses HuggingFace's API to run the language model that powers the agent

## Customization

You can modify the agent to:
- Add more tools (e.g., web search, file operations, API calls)
- Use different HuggingFace models by changing the `HfApiModel` configuration
- Extend the calculator with more advanced operations
- Create interactive chat sessions with the agent

## Example Output

```
Initializing Hugging Face Agent with Calculator Tool...

Agent initialized successfully!
Available tools: ['calculator']

==================================================
Example: Running agent with calculator task
==================================================

Result: 100

==================================================
Calculator tool is ready to use!
==================================================
```
