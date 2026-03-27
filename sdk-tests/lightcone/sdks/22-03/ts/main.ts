import Lightcone from "@tzafon/lightcone";
import createBrowserSession from "@/auto/getting-started/browserSession";
import buildPriceTracker from "@/auto/tutorials/priceTracker";
import scrapeBehinLogin from "@/auto/tutorials/loginScrape";
import automateFormWithAi from "@/auto/tutorials/automateForm";
import computers from "@/auto/environments/computers";
import operateAComputer from "@/auto/environments/operate";
import executeShell from "@/auto/environments/executeShell";

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
// scrapeBehinLogin(client);
// automateFormWithAi(client);

/*
 * Core Concepts
 * https://docs.lightcone.ai/guides/computers/
 */

// computers(client);

/*
 * Core Concepts
 * https://docs.lightcone.ai/guides/operate-a-computer/
 */

// operateAComputer(client);

/*
 * Environments
 * https://docs.lightcone.ai/guides/shell-commands/
 */

executeShell(client);
