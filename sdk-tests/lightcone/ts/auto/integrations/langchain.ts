import type Lightcone from "@tzafon/lightcone/index.js";
import { example } from "@/utils/example";

const PAGE = "integrations/langchain";

// TzafonLoader manages its own connection internally
const documentLoader = example(
  { page: PAGE, anchor: "document-loader", title: "LangChain: Document Loader" },
  async (): Promise<void> => {
    const { TzafonLoader } = await import("@langchain/tzafon");

    const loader = new TzafonLoader({
      urls: ["https://example.com", "https://example.com/about"],
      kind: "browser",
    });

    const documents = await loader.load();
    for (const doc of documents) {
      console.log(doc.pageContent.slice(0, 200));
      console.log(doc.metadata.url);
    }
  },
);

export default async function langchainIntegration(
  _client: Lightcone,
): Promise<void> {
  await documentLoader();
}
