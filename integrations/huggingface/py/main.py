from smolagents import Tool, CodeAgent, LiteLLMModel
from dotenv import load_dotenv
import os

load_dotenv()


class CalculatorTool(Tool):
    name = "calculator"
    description = "A simple calculator that can perform basic arithmetic operations: addition, subtraction, multiplication, and division."
    inputs = {
        "operation": {
            "type": "string",
            "description": "The arithmetic operation to perform. Must be one of: 'add', 'subtract', 'multiply', 'divide'",
        },
        "a": {
            "type": "number",
            "description": "The first number",
        },
        "b": {
            "type": "number",
            "description": "The second number",
        },
    }
    output_type = "number"

    def forward(self, operation: str, a: float, b: float) -> float:
        """Execute the calculation based on the operation."""
        operations = {
            "add": lambda x, y: x + y,
            "subtract": lambda x, y: x - y,
            "multiply": lambda x, y: x * y,
            "divide": lambda x, y: x / y if y != 0 else "Error: Division by zero",
        }

        if operation not in operations:
            return f"Error: Unknown operation '{operation}'. Use: add, subtract, multiply, or divide"

        result = operations[operation](a, b)
        return result


def main():
    print("Initializing Agent with Local Ollama Model...")

    # Initialize the calculator tool
    calculator = CalculatorTool()

    # Get model ID from environment or use default
    model_id = os.getenv("OLLAMA_MODEL", "ollama_chat/ministral-3")
    print(f"Using model: {model_id}")

    # Create an agent with the calculator tool
    # Using LiteLLMModel for local Ollama support
    agent = CodeAgent(
        tools=[calculator],
        model=LiteLLMModel(model_id=model_id),
    )

    print("\nAgent initialized successfully!")
    print("Available tools:", list(agent.tools.keys()))

    # Example usage
    print("\n" + "=" * 50)
    print("Example: Running agent with calculator task")
    print("=" * 50)

    try:
        result = agent.run("What is 25 multiplied by 4?")
        print(f"\nResult: {result}")
    except Exception as e:
        print(f"\nError running agent: {e}")
        print("\nNote: Make sure Ollama is running and you have the model pulled.")
        print(
            f"To pull the model, run: ollama pull {model_id.replace('ollama_chat/', '')}"
        )

    print("\n" + "=" * 50)
    print("Calculator tool is ready to use!")
    print("=" * 50)


if __name__ == "__main__":
    main()
