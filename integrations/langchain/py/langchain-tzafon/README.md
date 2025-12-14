# langchain-tzafon

An integration package connecting Tzafon and LangChain.

## Installation

```bash
pip install langchain-tzafon
```

## Usage

```python
from langchain_tzafon import TzafonLoader

loader = TzafonLoader(urls=["https://example.com"], api_key="your_api_key")
documents = loader.load()
```

## specific usage with Tzafon

If you're using Tzafon specifically, ensure you have your environment variables set or pass the API key directly.

## Development

### Running Tests

This project uses `pytest` for testing. You can run the tests using `uv`:

```bash
uv run pytest
```
