# langchain-tzafon

An integration package connecting Tzafon and LangChain.

## Installation

```bash
pnpm install langchain-tzafon @langchain/core tzafon
```

## Usage

```typescript
import { TzafonLoader } from "langchain-tzafon";

const loader = new TzafonLoader(["https://example.com"], {
  apiKey: "your_api_key", // Optional if TZAFON_API_KEY is set in environment
});
const documents = await loader.load();
```

## Specific Usage with Tzafon

If you're using Tzafon specifically, ensure you have your environment variables set or pass the API key directly.

## Development

### Running Tests

This project uses `jest` for testing. You can run the tests using:

```bash
pnpm test
```
