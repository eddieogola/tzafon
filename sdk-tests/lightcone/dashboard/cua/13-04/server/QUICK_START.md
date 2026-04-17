# Quick Start Guide - Lightcone Agent

## 1-Minute Setup

```bash
# 1. Set your API key (already in .env)
export TZAFON_API_KEY=sk_your_key_here

# 2. Install dependencies
uv sync

# 3. Run the agent
.venv/bin/python lightcone_agent.py
```

## What It Does

The agent reads instructions from `home.md` and executes them on a desktop:

1. Opens Firefox
2. Navigates to https://lightcone.ai/dashboard
3. Logs in with your credentials
4. Clicks on the Completions card

All automatically using AI-powered computer vision and control!

## File Overview

| File | Purpose |
|------|---------|
| `lightcone_agent.py` | Simple agent - easy to understand |
| `advanced_agent.py` | Full-featured with CLI options |
| `test_agent.py` | Test suite |
| `home.md` | Task instructions |

## Run Examples

```bash
# Basic execution
.venv/bin/python lightcone_agent.py

# Advanced with options
.venv/bin/python advanced_agent.py --save-events --max-steps 50

# Test without executing
.venv/bin/python test_agent.py

# Simple example
.venv/bin/python examples/simple_task.py

# Browser automation
.venv/bin/python examples/browser_automation.py
```

## Key Features

- **Streaming**: See actions in real-time
- **Polling**: Background execution
- **Control**: Pause, resume, redirect tasks
- **OpenAI Compatible**: Use with familiar frameworks
- **Logging**: Complete event history

## Customization

Edit `home.md` with your own instructions:

```markdown
Open Firefox and go to example.com
Click on the login button
Type username: myuser
Type password: mypass
Click submit
```

Then run:
```bash
.venv/bin/python lightcone_agent.py
```

## Need Help?

- See `README.md` for full documentation
- Check `examples/` for code samples
- Visit https://docs.lightcone.ai for API docs

## Common Commands

```bash
# Run with streaming (recommended)
.venv/bin/python advanced_agent.py --mode stream

# Limit to 25 steps for testing
.venv/bin/python advanced_agent.py --max-steps 25

# Save complete event log
.venv/bin/python advanced_agent.py --save-events

# Use browser mode
.venv/bin/python advanced_agent.py --kind browser
```

That's it! Happy automating! 🚀
