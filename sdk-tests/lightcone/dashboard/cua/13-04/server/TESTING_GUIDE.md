# Lightcone Dashboard CUA Testing Guide

Automated UI testing for the Lightcone dashboard using Northstar CUA (Computer Use Agent).

## Quick Start

```bash
# Set up environment variables
cp .env.example .env
# Edit .env and add your credentials

# Install dependencies
make install

# Check environment
make check-env

# Run all tests
make test-all

# Run specific test suite
make test-home
```

## Project Structure

```
server/
├── instructions/          # Test instruction files
│   ├── home/             # Home dashboard tests
│   │   ├── home_api_ref.md
│   │   ├── home_completions.md
│   │   ├── home_computers.md
│   │   ├── home_environments.md
│   │   └── home_quickstart.md
│   └── completions/      # Completions tests
│
├── expected/             # Expected screenshots
│   └── home/            # Screenshots for home tests
│       ├── home_api_ref.png
│       ├── home_completions.png
│       └── ...
│
├── results/             # Test results (auto-generated)
│   ├── home_api_ref_summary.md
│   └── ...
│
├── logs/                # Execution logs (auto-generated)
│
├── lightcone_agent.py   # Simple agent
├── advanced_agent.py    # Advanced agent with logging
├── secure_logger.py     # PII redaction utilities
└── Makefile            # Automation commands
```

## Environment Variables

Create a `.env` file with:

```bash
TZAFON_API_KEY=your_api_key_here
LIGHTCONE_EMAIL=your_email@example.com
LIGHTCONE_PASSWORD=your_password_here
```

## Available Make Commands

### Test Execution

- `make test-all` - Run all test suites
- `make test-home` - Run home dashboard tests only
- `make test-completions` - Run completions tests only
- `make test-file FILE=home/home_api_ref.md` - Run a single test

### Advanced Agent (with detailed logging)

- `make test-advanced` - Run all tests with advanced agent
- `make test-home-adv` - Run home tests with advanced agent
- `make test-completions-adv` - Run completions tests with advanced agent

### Utilities

- `make check-env` - Verify environment configuration
- `make clean` - Clean all generated files
- `make clean-results` - Clean results only
- `make clean-logs` - Clean logs only
- `make show-results` - Display test results summary
- `make quick-test` - Run a single test for quick validation

## Usage Examples

### Run all home dashboard tests

```bash
make test-home
```

This will:
1. Find all `.md` files in `instructions/home/`
2. Execute each test sequentially
3. Generate result summaries in `results/`
4. Show pass/fail status

### Run a specific test

```bash
make test-file FILE=home/home_api_ref.md
```

### Clean and re-run tests

```bash
make clean
make test-all
```

### Use advanced agent for detailed logging

```bash
make test-home-adv
```

This saves detailed event logs to `logs/` directory.

## Writing New Tests

1. Create an instruction file in `instructions/<suite>/test_name.md`:

```markdown
Go to https://lightcone.ai/dashboard, login with email: {{ LIGHTCONE_EMAIL }}
password: {{ LIGHTCONE_PASSWORD }}

If firefox shows a save login popup, click on the key icon
Dismiss Lightcone's now in open beta banner if it appears

Click on the API Reference card
```

2. Create an expected screenshot in `expected/<suite>/test_name.png`

3. Run the test:

```bash
make test-file FILE=<suite>/test_name.md
```

## Instruction File Format

Instruction files support Jinja2 templating for environment variables:

- `{{ LIGHTCONE_EMAIL }}` - Replaced with value from .env
- `{{ LIGHTCONE_PASSWORD }}` - Replaced with value from .env

Example:

```markdown
Go to https://lightcone.ai/dashboard
Login with email: {{ LIGHTCONE_EMAIL }} and password: {{ LIGHTCONE_PASSWORD }}
Click on the Environments tab
```

## Security & PII Redaction

All sensitive information (passwords, emails, API keys) is **automatically redacted** from:
- Logs
- Results summaries
- Event history
- Console output

See `SECURITY.md` for details on PII protection.

Example redaction:
```
Input:  "Login with password: secret123"
Output: "Login with [PASSWORD_***REDACTED***]: ***REDACTED***"
```

## Test Results

After running tests, check the `results/` directory for detailed summaries:

```bash
make show-results
```

Each result file contains:
- Task completion status
- Step-by-step execution log
- Screenshot verification status
- ✅ PASSED, ❌ FAILED, or ⚠️ INCONCLUSIVE

Example result structure:

```markdown
# Task Execution Summary

**Date:** 2026-04-19 14:30:00
**Instructions File:** instructions/home/home_api_ref.md
**Expected Screenshot:** expected/home/home_api_ref.png

---

## Completion Message

**Task Completion Summary:**
- ✅ Logged in with email: ***REDACTED***
- ✅ Dismissed beta banner
- ✅ Clicked on API Reference card

**Screenshot Comparison:**
Current screen matches expected screenshot.

---

**Status:** ✅ Verification PASSED

🔒 **Security Note:** Sensitive information has been redacted.
```

## Agents Comparison

### `lightcone_agent.py` (Simple Agent)
- ✅ Lightweight, minimal output
- ✅ Good for CI/CD pipelines
- ✅ Fast execution
- ✅ PII redaction
- ❌ No detailed logging
- ❌ No event history

**Use when:** Running tests in CI/CD or when you just need pass/fail results

### `advanced_agent.py` (Advanced Agent)
- ✅ All features of simple agent
- ✅ Detailed logging to files
- ✅ Event history tracking
- ✅ Optional screenshot capture
- ✅ JSON event export
- ✅ Better for debugging
- ❌ More verbose output

**Use when:** Debugging failures, analyzing agent behavior, or detailed reporting

## CLI Options

### Simple Agent

```bash
# Run a specific test suite
uv run python lightcone_agent.py --suite home

# Run a single test file
uv run python lightcone_agent.py --file home/home_api_ref.md

# Run all tests (auto-discover)
uv run python lightcone_agent.py
```

### Advanced Agent

```bash
# Run a test suite with detailed logging
uv run python advanced_agent.py --suite home

# Save screenshots during execution
uv run python advanced_agent.py --file home/home_api_ref.md --save-screenshots

# Save event history to JSON
uv run python advanced_agent.py --suite home --save-events

# Use polling mode instead of streaming
uv run python advanced_agent.py --mode poll

# Combine multiple options
uv run python advanced_agent.py --suite home --save-screenshots --save-events
```

## Troubleshooting

### Missing API Key

```
❌ Error: TZAFON_API_KEY environment variable not set
```

**Solution:** Create a `.env` file with:
```bash
TZAFON_API_KEY=your_api_key_here
```

### Test Fails with Login Error

**Solution:** Verify `LIGHTCONE_EMAIL` and `LIGHTCONE_PASSWORD` in `.env`

### No Instructions Found

```
❌ Error: No instruction files found
```

**Solution:** Ensure instruction files are in `instructions/<suite>/` directory with `.md` extension

### Expected Screenshot Missing

```
⚠️  Expected screenshot not found
```

**Solution:** Add the expected screenshot to `expected/<suite>/` directory with matching name

### Template Variable Error

```
❌ Error rendering template: 'LIGHTCONE_EMAIL' is undefined
```

**Solution:** Add the missing environment variable to `.env` file

## Adding New Test Suites

1. Create directory structure:

```bash
mkdir -p instructions/mysuite
mkdir -p expected/mysuite
```

2. Add test files:

```bash
# Create instruction file
cat > instructions/mysuite/my_test.md << 'EOF'
Go to https://lightcone.ai/dashboard
Login with {{ LIGHTCONE_EMAIL }} and {{ LIGHTCONE_PASSWORD }}
Click on my feature
EOF

# Add expected screenshot
cp /path/to/screenshot.png expected/mysuite/my_test.png
```

3. Add Makefile target:

```makefile
test-mysuite: check-env
	@echo "🧪 Running my test suite..."
	uv run python lightcone_agent.py --suite mysuite
```

4. Run the tests:

```bash
make test-mysuite
```

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: CUA Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'

      - name: Install dependencies
        run: |
          cd dashboard/cua/13-04/server
          make install

      - name: Run tests
        env:
          TZAFON_API_KEY: ${{ secrets.TZAFON_API_KEY }}
          LIGHTCONE_EMAIL: ${{ secrets.LIGHTCONE_EMAIL }}
          LIGHTCONE_PASSWORD: ${{ secrets.LIGHTCONE_PASSWORD }}
        run: |
          cd dashboard/cua/13-04/server
          make test-all

      - name: Upload results
        uses: actions/upload-artifact@v2
        with:
          name: test-results
          path: dashboard/cua/13-04/server/results/
```

## Best Practices

1. **Keep instructions atomic** - Each test should focus on one feature
2. **Use descriptive names** - `home_api_ref.md` is better than `test1.md`
3. **Update expected screenshots** - When UI changes, update screenshots
4. **Test in isolation** - Each test should be independent
5. **Handle popups** - Include steps to dismiss modal dialogs
6. **Use templates** - Leverage Jinja2 for environment-specific values

## License

See parent project license.
