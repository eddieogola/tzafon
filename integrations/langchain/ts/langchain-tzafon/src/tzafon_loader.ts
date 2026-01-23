import {
  BaseDocumentLoader,
  type DocumentLoader,
} from "@langchain/core/document_loaders/base";
import { Document, type DocumentInterface } from "@langchain/core/documents";
import Computer from "tzafon";

/**
 * Options for the TzafonLoader.
 */
export interface TzafonLoaderOptions {
  /**
   * Tzafon API key. If not provided, it will look for TZAFON_API_KEY in environment variables.
   */
  apiKey?: string;
  /**
   * The kind of computer to create. Defaults to "browser".
   */
  kind?: "browser" | "desktop";
}

/**
 * Document loader that uses the Tzafon SDK to load web pages.
 * Tzafon provides a virtual browser/computer that can navigate to URLs and extract content.
 *
 * @example
 * ```typescript
 * const loader = new TzafonLoader(["https://example.com"]);
 * const docs = await loader.load();
 * ```
 */
export class TzafonLoader extends BaseDocumentLoader implements DocumentLoader {
  urls: string[] | string;
  options: TzafonLoaderOptions;
  computer: Computer;

  /**
   * Creates a new instance of TzafonLoader.
   * @param urls - A single URL or an array of URLs to load.
   * @param options - Options for the loader.
   */
  constructor(urls: string[] | string, options: TzafonLoaderOptions = {}) {
    super();

    if (typeof urls === "string") {
      this.urls = [urls];
    } else {
      this.urls = urls;
    }
    this.options = options;

    const apiKey = options.apiKey ?? process.env.TZAFON_API_KEY;

    if (!apiKey) {
      throw new Error(
        "Tzafon API key is required. Read here on how to get your api key: https://docs.tzafon.ai/quickstart#get-your-api-key"
      );
    }

    this.computer = new Computer({ apiKey });
  }

  /**
   * Loads documents from the specified URLs.
   * @returns A promise that resolves to an array of Documents.
   */
  async load(): Promise<DocumentInterface[]> {
    const documents: DocumentInterface[] = [];
    for await (const doc of this.lazyLoad()) {
      documents.push(doc);
    }

    return documents;
  }

  /**
   * Lazily loads documents from the specified URLs.
   * This is useful for loading a large number of pages without holding them all in memory.
   * @returns An async generator that yields Documents.
   */
  async *lazyLoad() {
    const browser = await this.computer.create({
      kind: this.options.kind ?? "browser",
    });

    try {
      for (const url of this.urls) {
        await browser.navigate(url);
        const result = await browser.getHTML();

        const htmlContent = result.result?.html_content;

        yield new Document({
          pageContent: htmlContent || "",
          metadata: {
            url,
          },
        });
      }
    } finally {
      await browser.terminate();
    }
  }
}
