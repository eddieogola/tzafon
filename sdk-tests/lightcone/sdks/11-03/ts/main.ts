import Lightcone from "@tzafon/lightcone";
import { createBrowserSession } from "./auto/getting-started/browserSession";

const client = new Lightcone({
  apiKey: process.env.LIGHTCONE_API_KEY!,
  timeout: 30000, // milliseconds
  maxRetries: 3,
});

/*
 * Getting Started
 * https://docs.lightcone.ai/guides/quickstart/
 */

// createBrowserSession(client);

/*
 * Tutorials
 * https://docs.lightcone.ai/tutorials/build-a-price-tracker/
 */
