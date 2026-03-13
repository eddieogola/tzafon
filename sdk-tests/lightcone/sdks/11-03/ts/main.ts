import Lightcone from "@tzafon/lightcone";
import createBrowserSession from "@/auto/getting-started/browserSession";
import buildPriceTracker from "@/auto/tutorials/priceTracker";
import scrapeBehinLogin from "@/auto/tutorials/loginScrape";

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

// buildPriceTracker(client);

/*
 * Tutorials
 * https://docs.lightcone.ai/tutorials/scrape-behind-a-login/
 */

scrapeBehinLogin(client);
