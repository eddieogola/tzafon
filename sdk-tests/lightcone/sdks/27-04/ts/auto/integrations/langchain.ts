import Lightcone from "@tzafon/lightcone";
import { Colors } from "@/utils/term";

// TzafonLoader manages its own connection internally
async function documentLoader(_client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** LangChain: Document Loader ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/integrations/langchain/#document-loader${Colors.RESET}\n`,
  );
  try {
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
  } catch (e) {
    console.error(
      `\n${Colors.RED}Error in document loader example: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

export default async function langchainIntegration(
  client: Lightcone,
): Promise<void> {
  await documentLoader(client);
}
