# Lightcone Desktop Automation Agent

This project contains a Lightcone/Northstar agent that reads instructions from `home.md` and executes them on a desktop environment using AI-powered computer automation.

## Overview

The agent uses the Lightcone SDK (via Tzafon) to execute desktop automation tasks. It can:
- Read task instructions from markdown files
- Execute tasks with real-time streaming feedback
- Pause, resume, and redirect running tasks
- Log all events and actions
- Save execution history for analysis

## Prerequisites

1. Python 3.12 or higher
2. Tzafon SDK installed (already in `pyproject.toml`)
3. Lightcone API key set as environment variable

## Setup

1. **Install dependencies:**
   ```bash
   uv sync
   ```

2. **Set your API key:**
   ```bash
   export TZAFON_API_KEY=your_api_key_here
   ```

   The API key is already configured in `.env` file.

3. **Activate virtual environment:**
   ```bash
   source .venv/bin/activate
   ```

## Usage

### Basic Agent

The simple agent (`lightcone_agent.py`) provides straightforward task execution:

```bash
python lightcone_agent.py
```

This will:
1. Read instructions from `home.md`
2. Execute them on a desktop environment
3. Display real-time progress
4. Complete when the task is done

### Advanced Agent

The advanced agent (`advanced_agent.py`) offers more features and control:

```bash
# Basic usage with streaming
python advanced_agent.py

# Use polling mode instead of streaming
python advanced_agent.py --mode poll

# Specify a different instructions file
python advanced_agent.py --file custom_instructions.md

# Save screenshots during execution
python advanced_agent.py --save-screenshots

# Save event history to JSON
python advanced_agent.py --save-events

# Limit maximum steps
python advanced_agent.py --max-steps 100

# Use browser environment instead of desktop
python advanced_agent.py --kind browser

# Combine options
python advanced_agent.py --mode stream --save-events --max-steps 75
```

### Command-line Options

- `--file FILE`: Path to instructions file (default: `home.md`)
- `--mode {stream,poll}`: Execution mode (default: `stream`)
  - `stream`: Real-time event streaming
  - `poll`: Fire-and-forget with status polling
- `--max-steps N`: Maximum number of actions (default: 50)
- `--kind {desktop,browser}`: Environment type (default: `desktop`)
- `--save-screenshots`: Save screenshots during execution
- `--save-events`: Save event history to JSON file

## Instructions File Format

The `home.md` file contains instructions in a simple format:

```markdown
Go to https://lightcone.ai/dashboard, login with email: edwineogola@gmail.com
password: <password>

If firefox shows a save login popup, click on the key icon that is on the address bar to the right of the lock icon

Click on the Completions card
```

The agent automatically:
- Strips line numbers (e.g., `1→`)
- Removes empty lines and comments
- Combines instructions into a coherent task description

## Features

### 1. Streaming Mode
Real-time feedback as the agent executes tasks. See each action as it happens.

### 2. Polling Mode
Background execution with periodic status checks. Good for long-running tasks.

### 3. Task Control
- **Pause**: Temporarily stop execution
- **Resume**: Continue a paused task
- **Message Injection**: Redirect a running task with new instructions

### 4. Comprehensive Logging
- Console output with emoji indicators
- File-based logs with timestamps
- Event history in JSON format

### 5. Error Handling
- Graceful handling of interruptions
- Detailed error messages
- Automatic retry logic (built into SDK)

## Architecture

### Basic Agent (`lightcone_agent.py`)
- Simple, focused implementation
- Good for learning and basic automation
- ~200 lines of well-commented code

### Advanced Agent (`advanced_agent.py`)
- Full-featured with logging
- CLI argument parsing
- Event history tracking
- Screenshot capture support
- Suitable for production use

## OpenAI Compatibility

**Important:** Tzafon/Lightcone is fully OpenAI-compatible! You can use the familiar OpenAI SDK or any framework that supports OpenAI (LangChain, LlamaIndex, CrewAI, etc.).

### Using with OpenAI SDK

```python
from openai import OpenAI

client = OpenAI(
    api_key=os.getenv("TZAFON_API_KEY"),
    base_url="https://api.tzafon.ai/v1"
)

response = client.chat.completions.create(
    model="tzafon.northstar-cua-fast",
    messages=[
        {"role": "user", "content": "Your prompt here"}
    ]
)
```

### Supported Frameworks

- OpenAI SDK (Python & JavaScript)
- LangChain
- LlamaIndex
- CrewAI
- Vercel AI SDK
- Any OpenAI-compatible framework

See `examples/openai_compatible.py` and `examples/langchain_integration.py` for detailed examples.

## API Documentation

The agent uses the Lightcone Tasks API. Key concepts:

### Tasks
A task is a high-level instruction that Northstar executes autonomously. The agent:
1. Views the screen
2. Decides what to click/type
3. Executes actions
4. Continues until complete

### Configuration Parameters
- `instruction`: What you want done (required)
- `kind`: `"desktop"` or `"browser"` (required)
- `model`: `"tzafon.northstar-cua-fast"` (default)
- `max_steps`: Maximum actions before stopping
- `temperature`: Creativity level (0.0-1.0)

## Examples

### Example 1: Login to Dashboard
```python
from advanced_agent import AdvancedLightconeAgent

agent = AdvancedLightconeAgent("home.md")
result = agent.execute_with_streaming(max_steps=50)
print(f"Task completed: {result}")
```

### Example 2: Custom Instruction
```python
agent = AdvancedLightconeAgent()
instruction = "Open Firefox, search for 'Lightcone documentation', and open the first result"
result = agent.execute_with_streaming(instruction=instruction)
```

### Example 3: Task Control
```python
import time

# Start a task
agent = AdvancedLightconeAgent()
agent.execute_with_polling()

# After 5 seconds, inject a new instruction
time.sleep(5)
agent.inject_message("Actually, focus on the API reference instead")
```

## Troubleshooting

### API Key Issues
```
Error: TZAFON_API_KEY environment variable not set
```
Solution: Ensure the API key is exported or in `.env` file

### Connection Issues
Check your internet connection and verify the API endpoint is accessible.

### Task Failures
- Review the logs in the generated log file
- Check if `max_steps` is sufficient
- Verify the instruction is clear and specific

## Resources

- [Lightcone Documentation](https://docs.lightcone.ai)
- [Tasks API Guide](https://docs.lightcone.ai/guides/tasks/)
- [Run a Task Guide](https://docs.lightcone.ai/guides/run-a-task/)
- [Responses API](https://docs.lightcone.ai/guides/responses-api/)
- [Computers API](https://docs.lightcone.ai/guides/computers/)

## Project Structure

```
.
├── README.md                 # This file
├── home.md                   # Task instructions
├── lightcone_agent.py       # Basic agent implementation
├── advanced_agent.py        # Advanced agent with full features
├── pyproject.toml           # Python dependencies
├── .env                     # API key configuration
└── .venv/                   # Virtual environment
```

## Contributing

To add new features:
1. Follow the existing code style
2. Add comprehensive logging
3. Handle errors gracefully
4. Document new parameters

## License

This project is for educational and development purposes with the Lightcone API.
