# UI Testing Framework for Lightcone Dashboard

## Overview

This framework automates UI testing for the Lightcone dashboard using AI-powered computer vision and automation. It:

1. **Reads test cases** from markdown files
2. **Executes tests** using Lightcone's desktop automation
3. **Captures screenshots** of actual results
4. **Compares with expected** results using AI vision
5. **Generates reports** with checkboxes for verification

## Architecture

```
┌─────────────────────┐
│  Test Case (MD)     │  Test instructions in markdown
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  UITestExecutor     │  Executes test using Lightcone
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Screenshot Capture │  Saves actual result
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  UITestComparator   │  AI-powered comparison
│  (OpenAI Vision)    │  using Lightcone API
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  TestReportGen      │  Markdown report with ☐ checkboxes
└─────────────────────┘
```

## Quick Start

### 1. Set up environment

```bash
# Install dependencies
uv sync

# Load environment (API key is already in .env)
source .env
```

### 2. Run a test

```bash
# Full test execution
.venv/bin/python run_ui_tests.py

# Dry run (analyze expected screenshot only)
.venv/bin/python run_ui_tests.py --dry-run

# Limit execution steps
.venv/bin/python run_ui_tests.py --max-steps 30
```

## Test Case Format

### Directory Structure

```
.
├── home_completions.md           # Test instructions
├── expected/
│   └── home_completions.png      # Expected result
├── actual_screenshots/            # Captured during test
│   └── home_completions_*.png
└── results/                       # Test reports
    └── home_completions_*.md
```

### Test Instructions Format

Create a markdown file (e.g., `home_completions.md`):

```markdown
Go to https://lightcone.ai/dashboard, login with email: edwineogola@gmail.com
password:

If firefox shows a save login popup, click on the key icon

Click on the Completions card
```

### Expected Screenshot

Place the expected result screenshot in `expected/` folder with matching name:
- Test: `home_completions.md`
- Expected: `expected/home_completions.png`

## How It Works

### 1. Test Execution

The framework:
1. Reads instructions from the markdown file
2. Uses Lightcone Tasks API to execute on desktop
3. Streams events in real-time
4. Captures the final state

### 2. AI Vision Analysis

Using Lightcone's OpenAI-compatible API with vision models:

```python
# Analyze expected screenshot
analysis = comparator.analyze_screenshot(
    expected_screenshot,
    test_name
)

# Compare actual vs expected
comparison = comparator.compare_screenshots(
    expected_screenshot,
    actual_screenshot,
    test_name
)
```

The AI extracts:
- Page/section being displayed
- All visible UI elements
- Element states (selected, enabled, etc.)
- Text content
- Layout structure

### 3. Report Generation

Generates markdown reports with checkboxes:

```markdown
## UI Verification Checklist

### UI Elements

- ☐ **Model dropdown** - Value: `Northstar CUA Fast 1.1 256k Alpha`
- ☐ **System prompt field** - Visible: true
- ☐ **Preset - Balanced button** - Selected: true
- ☐ **Code dropdown** - Visible: true

### Expected Text Content

- ☐ `Lightcone's now in open beta.`
- ☐ `Model`
- ☐ `System prompt`
- ☐ `Good for general tasks (temp: 0.7, max: 1024)`
```

## Features

### 🤖 AI-Powered Comparison

Uses vision models to:
- Extract UI elements automatically
- Compare screenshots intelligently
- Identify differences with severity levels
- Provide detailed analysis

### ✅ Checkbox Reports

Human-readable reports with:
- Checkboxes for each verification point
- Expected vs actual states
- Manual verification instructions
- Notes section for observations

### 📸 Screenshot Management

- Automatic screenshot capture
- Organized folder structure
- Base64 encoding for AI analysis
- Screenshot comparison side-by-side

### 🔄 Flexible Execution

- Streaming or polling modes
- Configurable step limits
- Dry run for analysis only
- Batch test execution

## API Classes

### UITestCase

Represents a single test case:

```python
test_case = UITestCase(
    name="home_completions",
    instructions_file="home_completions.md",
    expected_screenshot="expected/home_completions.png"
)
```

### UITestExecutor

Executes tests using Lightcone:

```python
executor = UITestExecutor(screenshots_dir="actual_screenshots")
result = executor.execute_test(test_case, max_steps=50)
```

### UITestComparator

Compares screenshots using AI vision:

```python
comparator = UITestComparator()

# Analyze single screenshot
analysis = comparator.analyze_screenshot(image_path, test_name)

# Compare two screenshots
comparison = comparator.compare_screenshots(
    expected_path, actual_path, test_name
)
```

### TestReportGenerator

Generates markdown reports:

```python
reporter = TestReportGenerator(results_dir="results")
report_path = reporter.generate_report(
    test_name, execution_result, comparison_result
)
```

### UITestFramework

Main orchestrator:

```python
framework = UITestFramework()

# Run single test
result = framework.run_test(test_case, max_steps=50)

# Run test suite
results = framework.run_test_suite(test_cases, max_steps=50)
```

## Examples

### Example 1: Simple Test

```python
from ui_test_framework import UITestCase, UITestFramework

test = UITestCase(
    name="login_test",
    instructions_file="login_test.md",
    expected_screenshot="expected/login_test.png"
)

framework = UITestFramework()
result = framework.run_test(test)
print(f"Report: {result['report']}")
```

### Example 2: Dry Run

```python
from ui_test_framework import UITestComparator

comparator = UITestComparator()
analysis = comparator.analyze_screenshot(
    Path("expected/home_completions.png"),
    "home_completions"
)

print(f"Page: {analysis['page']}")
print(f"Elements: {len(analysis['elements'])}")
```

### Example 3: Batch Tests

```python
from ui_test_framework import UITestCase, UITestFramework

tests = [
    UITestCase("test1", "test1.md", "expected/test1.png"),
    UITestCase("test2", "test2.md", "expected/test2.png"),
    UITestCase("test3", "test3.md", "expected/test3.png"),
]

framework = UITestFramework()
results = framework.run_test_suite(tests, max_steps=50)
```

## Command-Line Usage

### run_ui_tests.py

Simple test runner:

```bash
# Run test with defaults
python run_ui_tests.py

# Specify test name
python run_ui_tests.py --test-name my_test

# Dry run only
python run_ui_tests.py --dry-run

# Limit steps
python run_ui_tests.py --max-steps 30
```

### ui_test_framework.py

Full framework with all options:

```bash
# Run specific test
python ui_test_framework.py \
    --test-file home_completions.md \
    --expected expected/home_completions.png \
    --test-name home_completions \
    --max-steps 50
```

## Output Files

### Test Reports

Location: `results/`

Format:
```
results/
├── home_completions_20260405_173000.md    # Individual test report
└── summary_20260405_173100.md             # Summary of all tests
```

### Screenshots

Location: `actual_screenshots/`

Format:
```
actual_screenshots/
└── home_completions_20260405_173000.png
```

### Log Files

Location: Current directory

Format:
```
lightcone_agent_20260405_173000.log
```

## Test Report Structure

Each test report includes:

1. **Test Execution Details**
   - Instructions
   - Event count
   - Execution status
   - Errors (if any)

2. **UI Verification Checklist**
   - Page identification
   - UI elements with states
   - Expected text content
   - Layout description

3. **Screenshots**
   - Expected screenshot path
   - Actual screenshot path

4. **Manual Verification Steps**
   - How to verify the test
   - Checklist instructions

5. **Notes Section**
   - For manual observations
   - Issue tracking

## Best Practices

### Writing Test Cases

1. **Be specific**: "Click on the Completions card in the left sidebar"
2. **Handle popups**: "If firefox shows a save login popup, dismiss it"
3. **Verify state**: "Ensure the Balanced preset is selected"
4. **Clear success**: "The Completions page should be displayed"

### Expected Screenshots

1. **Use high resolution**: Clear, readable screenshots
2. **Consistent state**: Same browser size, zoom level
3. **Representative**: Show the key UI elements to verify
4. **Well-named**: Match the test case name

### Reviewing Results

1. **Check execution status**: Ensure test completed successfully
2. **Review checkboxes**: Verify each UI element
3. **Compare screenshots**: Look for visual differences
4. **Note discrepancies**: Document any issues found
5. **Update expected**: If UI intentionally changed

## Troubleshooting

### Test Execution Fails

```
Error: Task execution failed
```

**Solutions:**
- Check API key is set correctly
- Verify instructions are clear
- Increase max_steps if timeout
- Check network connectivity

### Screenshot Not Captured

```
Warning: No actual screenshot available
```

**Solutions:**
- Add explicit screenshot instruction
- Increase max_steps
- Check if task completed successfully

### AI Analysis Fails

```
Error: Screenshot analysis failed
```

**Solutions:**
- Verify image file exists and is valid
- Check API key has vision access
- Try smaller image size
- Check error logs for details

### Report Generation Fails

```
Error: Could not generate report
```

**Solutions:**
- Ensure results directory exists
- Check write permissions
- Verify analysis data is valid

## Advanced Usage

### Custom Vision Models

```python
# Use specific vision model
comparator = UITestComparator()
comparator.client = OpenAI(
    api_key=os.getenv("TZAFON_API_KEY"),
    base_url="https://api.tzafon.ai/v1"
)
```

### Custom Report Templates

```python
# Extend TestReportGenerator
class CustomReportGenerator(TestReportGenerator):
    def generate_report(self, *args, **kwargs):
        # Custom report logic
        pass
```

### Integration with CI/CD

```bash
# In your CI pipeline
.venv/bin/python run_ui_tests.py --max-steps 30
if [ $? -eq 0 ]; then
    echo "Tests passed"
else
    echo "Tests failed"
    exit 1
fi
```

## Future Enhancements

- [ ] Parallel test execution
- [ ] Visual diff generation
- [ ] Video recording of test execution
- [ ] Integration with test management tools
- [ ] Automatic expected screenshot updates
- [ ] Performance metrics tracking
- [ ] Accessibility testing
- [ ] Cross-browser testing

## Resources

- [Lightcone Documentation](https://docs.lightcone.ai)
- [Lightcone Tasks API](https://docs.lightcone.ai/guides/tasks/)
- [OpenAI Vision API](https://platform.openai.com/docs/guides/vision)

## License

This framework is for internal testing of the Lightcone dashboard.
