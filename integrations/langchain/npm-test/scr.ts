import { TzafonLoader } from "@tzafon/langchain-tzafon";

async function run() {
  try {
    const loader = new TzafonLoader("https://example.com", {
      apiKey: "sk_QD2ukT3xDpJ8ZPqO3HbSSear0KVN0Tj"
    });
    console.log("✅ Package loaded and initialized successfully!");
    console.log("Loader options:", loader.options);
    const documents = await loader.load();
    console.log("Documents loaded:", documents.length);
    console.log("Documents:", documents);
  } catch (e) {
    console.error("❌ Failed to initialize:", e.message);
  }
}

run();