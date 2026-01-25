/**
 * Document loader demo using TzafonLoader.
 */

import { TzafonLoader } from "@tzafon/langchain-tzafon";
import "dotenv/config";

async function main() {
  const loader = new TzafonLoader(["https://tzafon.ai"]);
  const documents = await loader.load();

  for (const doc of documents) {
    console.log(`Content from ${doc.metadata.url}:`);
    console.log(doc.pageContent.slice(0, 200));
  }
}

main().catch(console.error);
