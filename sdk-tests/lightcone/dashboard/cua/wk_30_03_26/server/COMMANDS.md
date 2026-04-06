# Command Reference

## UI Testing Framework

### Run Tests

```bash
# Run the home_completions test (full execution)
.venv/bin/python run_ui_tests.py

# Analyze expected screenshot only (no execution)
.venv/bin/python run_ui_tests.py --dry-run

# Limit to 30 steps for faster testing
.venv/bin/python run_ui_tests.py --max-steps 30

# Run a different test
.venv/bin/python run_ui_tests.py --test-name my_test
```

### Direct Framework Usage

```bash
# Use the framework directly with all options
.venv/bin/python ui_test_framework.py \
    --test-file home_completions.md \
    --expected expected/home_completions.png \
    --test-name home_completions \
    --max-steps 50
```

## Basic Agents

### Simple Agent

```bash
# Run the basic agent (reads from home.md)
.venv/bin/python lightcone_agent.py
```

### Advanced Agent

```bash
# Run with default settings
.venv/bin/python advanced_agent.py

# Use polling mode instead of streaming
.venv/bin/python advanced_agent.py --mode poll

# Save event history to JSON
.venv/bin/python advanced_agent.py --save-events

# Save screenshots during execution
.venv/bin/python advanced_agent.py --save-screenshots

# Limit steps and save everything
.venv/bin/python advanced_agent.py --max-steps 50 --save-events --save-screenshots

# Use browser mode
.venv/bin/python advanced_agent.py --kind browser

# Custom instructions file
.venv/bin/python advanced_agent.py --file my_instructions.md
```

## Examples

### Simple Task
```bash
.venv/bin/python examples/simple_task.py
```

### Async Task with Polling
```bash
.venv/bin/python examples/async_task.py
```

### Task Control (Pause/Resume/Inject)
```bash
.venv/bin/python examples/task_control.py
```

### Browser Automation
```bash
.venv/bin/python examples/browser_automation.py
```

### OpenAI Compatibility
```bash
# Requires openai package installed
.venv/bin/python examples/openai_compatible.py
```

### LangChain Integration
```bash
# Requires langchain packages
# pip install langchain langchain-openai
.venv/bin/python examples/langchain_integration.py
```

## Testing

### Run Test Suite
```bash
# Run all framework tests
.venv/bin/python test_agent.py
```

### Individual Test Components
```bash
# Test instruction parsing only
python -c "from lightcone_agent import LightconeAgent; agent = LightconeAgent('home.md'); print(agent.read_instructions())"

# Test environment loading
python -c "from test_agent import load_env; load_env(); import os; print('API Key:', os.getenv('TZAFON_API_KEY')[:10] + '...')"
```

## Project Management

### Install/Update Dependencies
```bash
# Sync dependencies
uv sync

# Add new dependency
uv add package-name

# Update dependencies
uv lock --upgrade
```

### View Logs
```bash
# View latest log file
ls -t lightcone_agent_*.log | head -1 | xargs cat

# Follow log in real-time
tail -f lightcone_agent_*.log
```

### View Results
```bash
# List all test reports
ls -lt results/*.md

# View latest test report
ls -t results/*.md | head -1 | xargs cat

# View summary report
ls -t results/summary_*.md | head -1 | xargs cat
```

### Clean Up
```bash
# Remove old screenshots
rm -rf actual_screenshots/*.png

# Remove old reports
rm -rf results/*.md

# Remove old logs
rm -f lightcone_agent_*.log
```

## Development

### Make Scripts Executable
```bash
chmod +x *.py examples/*.py
```

### Run with Python Interpreter
```bash
# Activate venv first
source .venv/bin/activate

# Then run without .venv/bin prefix
python run_ui_tests.py --dry-run
```

### Environment Variables
```bash
# Load from .env file
export $(cat .env | xargs)

# Check if API key is set
echo $TZAFON_API_KEY

# Set API key manually
export TZAFON_API_KEY=sk_your_key_here
```

## Debugging

### Verbose Logging
```bash
# Python logging level
PYTHONVERBOSE=1 .venv/bin/python run_ui_tests.py

# Framework debug mode
LOGLEVEL=DEBUG .venv/bin/python advanced_agent.py
```

### Check Dependencies
```bash
# List installed packages
.venv/bin/pip list

# Check specific package
.venv/bin/pip show tzafon

# Verify imports
.venv/bin/python -c "import tzafon; print(tzafon.__version__)"
```

### Test API Connection
```bash
# Simple API test
.venv/bin/python -c "
from tzafon import Lightcone
client = Lightcone()
print('Connection successful!')
"
```

## Common Workflows

### Create New Test Case

```bash
# 1. Create instructions file
cat > my_new_test.md << 'EOF'
Go to https://example.com
Click the login button
Enter credentials
Verify dashboard
EOF

# 2. Add expected screenshot
# (Take screenshot and save as expected/my_new_test.png)

# 3. Add test definition to test_definitions.py
# (Edit file and add MY_NEW_TEST_EXPECTED)

# 4. Run the test
.venv/bin/python run_ui_tests.py --test-name my_new_test
```

### Debug Failed Test

```bash
# 1. Check the error in the report
cat results/my_test_*.md

# 2. View the log file
cat lightcone_agent_*.log | grep ERROR

# 3. Run with fewer steps
.venv/bin/python run_ui_tests.py --max-steps 10

# 4. Try dry run first
.venv/bin/python run_ui_tests.py --dry-run
```

### Update Expected Results

```bash
# 1. Run the test
.venv/bin/python run_ui_tests.py

# 2. If actual is correct, update expected
cp actual_screenshots/my_test_*.png expected/my_test.png

# 3. Update test definition if needed
# Edit test_definitions.py

# 4. Re-run to verify
.venv/bin/python run_ui_tests.py
```

## Quick Tips

```bash
# Run dry run to check test definition
.venv/bin/python run_ui_tests.py --dry-run

# Limit steps for faster testing
.venv/bin/python run_ui_tests.py --max-steps 20

# Check what files were created
find . -name "*.md" -mmin -10  # Files modified in last 10 min

# View test definition
python -c "from test_definitions import get_test_definition; import json; print(json.dumps(get_test_definition('home_completions'), indent=2))"

# List available tests
python -c "from test_definitions import list_available_tests; print(list_available_tests())"
```
