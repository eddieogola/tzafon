# 🦜 @tzafon/langchain-tzafon

An integration package connecting **[Tzafon](https://tzafon.ai)** and **[LangChain](https://www.langchain.com/)**.

`@tzafon/langchain-tzafon` provides two powerful integrations:
- **ChatTzafon**: A LangChain chat model for Tzafon's AI models (with streaming support)
- **TzafonLoader**: A Document Loader using Tzafon's headless browser infrastructure

---

## ✨ Features

- **Chat Completions**: Access Tzafon's AI models via LangChain's chat interface
- **Streaming Support**: Real-time token streaming for chat responses
- **Headless Browser Rendering**: Powered by Tzafon's cloud-based browser instances
- **JavaScript Support**: Naturally handles SPAs and dynamically loaded content
- **Seamless Integration**: Fully compatible with LangChain's interfaces

---

## 🚀 Installation

```bash
pnpm add @tzafon/langchain-tzafon @langchain/core
```

---

## 🔑 Configuration

To use this package, you need a Tzafon API Key.

1.  Sign up or log in at **[tzafon.ai](https://tzafon.ai)** to get your API key.
2.  Set it as an environment variable (recommended):

```bash
export TZAFON_API_KEY="your_api_key_here"
```

Alternatively, you can pass the API key directly when initializing the loader.

---

## 📖 Usage

### ChatTzafon - Chat Completions

```typescript
import { ChatTzafon } from "@tzafon/langchain-tzafon";

const chat = new ChatTzafon({ model: "tzafon.sm-1" });
const response = await chat.invoke("Hello!");
console.log(response.content);
```

### ChatTzafon - Streaming

```typescript
import { ChatTzafon } from "@tzafon/langchain-tzafon";

const chat = new ChatTzafon({ temperature: 0.8 });
for await (const chunk of await chat.stream("Write a haiku")) {
  process.stdout.write(chunk.content as string);
}
```

### ChatTzafon - With Messages

```typescript
import { ChatTzafon } from "@tzafon/langchain-tzafon";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const chat = new ChatTzafon();
const response = await chat.invoke([
  new SystemMessage("You are a helpful assistant."),
  new HumanMessage("What is the capital of France?"),
]);
console.log(response.content);
```

### TzafonLoader - Text Extraction

```typescript
import { TzafonLoader } from "@tzafon/langchain-tzafon";

const loader = new TzafonLoader(["https://example.com"]);
const documents = await loader.load();

for (const doc of documents) {
  console.log(`Content from ${doc.metadata.url}:`);
  console.log(doc.pageContent.slice(0, 200));
}
```

---

## 🛠️ API Reference

### `ChatTzafon`

| Option | Type | Description |
| :--- | :--- | :--- |
| `model` | `string` | Model ID. Defaults to `"tzafon.sm-1"`. |
| `temperature` | `number` | Sampling temperature (0-1). Defaults to `0.7`. |
| `maxTokens` | `number` | Maximum tokens to generate. |
| `stop` | `string[]` | Stop sequences. |
| `apiKey` | `string` | Tzafon API key. Defaults to `TZAFON_API_KEY` env var. |

### `TzafonLoader`

| Argument | Type | Description |
| :--- | :--- | :--- |
| `urls` | `string \| string[]` | A single URL or an array of URLs to load. |
| `options.apiKey` | `string` | Your Tzafon API key. Defaults to `TZAFON_API_KEY` env var. |
| `options.kind` | `"browser" \| "desktop"` | The type of environment. Defaults to `"browser"`. |
| `options.textContent` | `boolean` | If `true` (default), extracts text. If `false`, returns HTML. |

---

## 📄 License

This project is licensed under the MIT License.
