# 🦜 @tzafon/langchain-tzafon

An integration package connecting **[Tzafon](https://tzafon.ai)** and **[LangChain](https://www.langchain.com/)**.

`@tzafon/langchain-tzafon` allows you to seamlessly use Tzafon's headless browser infrastructure as a [Document Loader](https://js.langchain.com/docs/modules/data_connection/document_loaders/) in your LangChain applications. It handles complex web page rendering (including JavaScript) and extracts clean text or raw HTML for your LLM pipelines.

---

## ✨ Features

- **Headless Browser Rendering**: Power by Tzafon's cloud-based browser instances.
- **JavaScript Support**: Naturally handles SPAs and dynamically loaded content.
- **Lazy Loading Support**: Features `lazyLoad` for high-performance applications.
- **Raw HTML Extraction**: Choice between full source HTML or processed content.
- **Seamless Integration**: Fully compatible with LangChain's `BaseDocumentLoader` interface.

---

## 🚀 Installation

```bash
pnpm add @tzafon/langchain-tzafon @langchain/core tzafon
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

### Basic Usage (Text Extraction)

By default, `TzafonLoader` extracts the visible text from the page, which is ideal for LLM processing.

```typescript
import { TzafonLoader } from "@tzafon/langchain-tzafon";

// Initialize with one or more URLs
const loader = new TzafonLoader(["https://example.com"]);

// Load documents
const documents = await loader.load();

for (const doc of documents) {
  console.log(`Content from ${doc.metadata.url}:`);
  console.log(doc.pageContent.slice(0, 200));
}
```

### Loading Raw HTML

If you need the full HTML structure for custom parsing, set `textContent` to `false`.

```typescript
import { TzafonLoader } from "@tzafon/langchain-tzafon";

const loader = new TzafonLoader("https://example.com", {
  textContent: false
});
const documents = await loader.load();
```

### Lazy Loading

For better performance when handling multiple URLs, use the lazy loader:

```typescript
import { TzafonLoader } from "@tzafon/langchain-tzafon";

const loader = new TzafonLoader([
  "https://example.com",
  "https://tzafon.ai"
]);

for await (const doc of loader.lazyLoad()) {
  console.log(`Loaded ${doc.metadata.url}`);
}
```

### Advanced Configuration

You can specify the type of environment to use (e.g., "browser" or "desktop").

```typescript
const loader = new TzafonLoader("https://example.com", {
  kind: "browser",
  apiKey: "your_api_key_here"
});
const documents = await loader.load();
```

---

## 🛠️ API Reference

### `TzafonLoader`

| Argument | Type | Description |
| :--- | :--- | :--- |
| `urls` | `string \| string[]` | A single URL or an array of URLs to load. |
| `options.apiKey` | `string` | Your Tzafon API key. Defaults to `TZAFON_API_KEY` env var. |
| `options.kind` | `"browser" \| "desktop"` | The type of environment to use. Defaults to `"browser"`. |
| `options.textContent` | `boolean` | If `true` (default), extracts visible text. If `false`, returns raw HTML. |

---

## 📄 License

This project is licensed under the MIT License.
