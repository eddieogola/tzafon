# Braintrust + Tzafon Integration (Python)

This example demonstrates how to create a [Braintrust](https://www.braintrust.dev/) tool that uses [Tzafon](https://www.tzafon.ai/computer) for browser automation.

## What is Tzafon?

Tzafon is a runtime for agent automation, built in Rust for AI automation at scale. It provides:

- **Lightweight performance** — 75x less CPU and 74% less memory than standard headless runtimes
- **Resilient under load** — 99.99% reliability and 4.8x faster cold starts
- **Isolated by design** — Each environment runs in a Firecracker micro-VM
- **Unified API surface** — Launch and scale Browser, Sandbox, and Linux from a single API

Learn more at [tzafon.ai/computer](https://www.tzafon.ai/computer).

## Prerequisites

- Python 3.10+
- A Tzafon API key
- A Braintrust API key

## Setup

### 1. Install dependencies

```bash
pip install braintrust tzafon playwright python-dotenv pydantic requests
```

Then install Playwright browsers:

```bash
playwright install chromium
```

### 2. Get your Tzafon API Key

1. Go to the [Tzafon Dashboard](https://tzafon.ai/dashboard)
2. Sign up or log in to your account
3. Navigate to the API Keys section
4. Create a new API key or copy your existing one

### 3. Get your Braintrust API Key

1. Go to [Braintrust](https://www.braintrust.dev/)
2. Sign up or log in
3. Navigate to Settings → API Keys
4. Create a new API key

### 4. Configure environment variables

Create a `.env` file in the project root:

```bash
TZAFON_API_KEY=your_tzafon_api_key_here
BRAINTRUST_API_KEY=your_braintrust_api_key_here
```

## Usage

### Running locally

To test the tool locally:

```bash
python main.py
```

### Pushing to Braintrust

To deploy your tool to Braintrust, use the `braintrust push` command:

```bash
braintrust push main.py --requirements requirements.txt
```

This will:

1. Bundle your code and dependencies using `uv`
2. Upload the tool to your Braintrust project
3. Make it available in the Braintrust UI

Once pushed, you can:

- **View the tool** in the Braintrust UI under your project's Tools section
- **Add it to prompts** for use in AI workflows
- **Call it from code** using the Braintrust SDK

### Using the Tool in Code

After pushing, you can invoke the tool programmatically:

```python
import braintrust

client = braintrust.init()
result = client.invoke_tool(
    project="TZAFON API Tool - Python",
    slug="load-page",
    input={"url": "https://example.com"}
)
print(result)
```

## How it Works

The `load_page` tool:

1. Creates a Tzafon browser session
2. Connects via Chrome DevTools Protocol (CDP)
3. Navigates to the specified URL
4. Extracts and returns the page content

```python
async def load_page(url: str) -> LoadPageOutput:
    client = Computer(api_key=TZAFON_API_KEY)
    session = client.create(kind="browser")

    cdp_url = f"{BASE_URL}/computers/{session.id}/cdp?token={TZAFON_API_KEY}"

    async with async_playwright() as p:
        browser = await p.chromium.connect_over_cdp(cdp_url)
        # ... navigate and extract content
```

## Resources

- [Tzafon Documentation](https://docs.tzafon.ai)
- [Tzafon Computer Runtime](https://www.tzafon.ai/computer)
- [Braintrust Tools Documentation](https://www.braintrust.dev/docs/core/functions/tools)
- [Braintrust Python SDK](https://www.braintrust.dev/docs/reference/sdks/python)
