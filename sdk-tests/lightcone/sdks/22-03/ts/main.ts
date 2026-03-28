import Lightcone from "@tzafon/lightcone";
import createBrowserSession from "@/auto/getting-started/browserSession";
import buildPriceTracker from "@/auto/tutorials/priceTracker";
import scrapeBehinLogin from "@/auto/tutorials/loginScrape";
import automateFormWithAi from "@/auto/tutorials/automateForm";
import computers from "@/auto/environments/computers";
import operateAComputer from "@/auto/environments/operate";
import executeShell from "@/auto/environments/executeShell";
import manageBrowserTabs from "@/auto/environments/manageBrowserTabs";
import lightconeOs from "@/auto/environments/lightconeOs";
import softwareTesting from "@/auto/use_cases/softwareTesting";
import legacySoftware from "@/auto/use_cases/legacySoftware";
import crossAppWorkflows from "@/auto/use_cases/crossAppWorkflows";

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
 * Environments
 * https://docs.lightcone.ai/guides/operate-a-computer/
 */

// operateAComputer(client);

/*
 * Environments
 * https://docs.lightcone.ai/guides/shell-commands/
 */

// executeShell(client);

/*
 * Environments
 * https://docs.lightcone.ai/guides/browser-tabs/
 */

// manageBrowserTabs(client);

/*
 * Environments
 * https://docs.lightcone.ai/guides/lightcone-os/
 */

// lightconeOs(client);

/*
 * Use Cases
 * https://docs.lightcone.ai/use-cases/software-testing/
 */

softwareTesting(client);

/*
 * Use Cases
 * https://docs.lightcone.ai/use-cases/legacy-software/
 */

// legacySoftware(client);

/*
 * Use Cases
 * https://docs.lightcone.ai/use-cases/cross-app-workflows/
 */

// crossAppWorkflows(client);
