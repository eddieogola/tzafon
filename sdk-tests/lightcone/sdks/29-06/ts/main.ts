import Lightcone from "@tzafon/lightcone/index.js";
import quickstartGuide from "@/auto/getting-started/quickstart";
import authenticationGuide from "@/auto/getting-started/authentication";
import howLightconeWorksGuide from "@/auto/getting-started/howLightconeWorks";
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
import tasksGuide from "@/auto/using-northstar/tasks";
import runATaskGuide from "@/auto/using-northstar/runATask";
import responsesApiGuide from "@/auto/using-northstar/responsesApi";
import cuaProtocolGuide from "@/auto/using-northstar/cuaProtocol";
import coordinatesGuide from "@/auto/using-northstar/coordinates";
import chatCompletionsGuide from "@/auto/using-northstar/chatCompletions";
import langchainIntegration from "@/auto/integrations/langchain";
import vercelAiIntegration from "@/auto/integrations/vercelAi";
import playwrightIntegration from "@/auto/integrations/playwright";
import mastraIntegration from "@/auto/integrations/mastra";
import kernelIntegration from "@/auto/integrations/kernel";

const client = new Lightcone({
  apiKey: process.env.LIGHTCONE_API_KEY!,
  timeout: 30000, // milliseconds
  maxRetries: 3,
});

const availableExamples = {
  quickstartGuide,
  authenticationGuide,
  howLightconeWorksGuide,
  buildPriceTracker,
  scrapeBehinLogin,
  automateFormWithAi,
  computers,
  operateAComputer,
  executeShell,
  manageBrowserTabs,
  lightconeOs,
  softwareTesting,
  legacySoftware,
  crossAppWorkflows,
  tasksGuide,
  runATaskGuide,
  responsesApiGuide,
  cuaProtocolGuide,
  coordinatesGuide,
  chatCompletionsGuide,
  langchainIntegration,
  vercelAiIntegration,
  playwrightIntegration,
  mastraIntegration,
  kernelIntegration,
};
void availableExamples;

async function main() {
  /*
   * Getting Started
   * https://docs.lightcone.ai/guides/quickstart/
   */
  // await quickstartGuide(client);
  // await authenticationGuide();
  // await howLightconeWorksGuide(client);
  /*
   * Using Northstar
   * https://docs.lightcone.ai/guides/tasks/
   */
  // await tasksGuide(client);
  // await runATaskGuide(client);
  // await responsesApiGuide(client);
  // await cuaProtocolGuide(client);
  // await coordinatesGuide(client);
  // await chatCompletionsGuide(client);
  /*
   * Environments
   * https://docs.lightcone.ai/guides/computers/
   */
  // await computers(client);
  // await operateAComputer(client);
  // await executeShell(client);
  // await manageBrowserTabs(client);
  // await lightconeOs(client);
  /*
   * Tutorials
   * https://docs.lightcone.ai/tutorials/build-a-price-tracker/
   */
  // await buildPriceTracker(client);
  // await scrapeBehinLogin(client);
  // await automateFormWithAi(client);
  /*
   * Integrations
   * https://docs.lightcone.ai/integrations/playwright/
   */
  // await playwrightIntegration(client);
  // These are examples reliant on LLMs, hence commented out by default to avoid unnecessary API calls. Uncomment to run.
  /*
   * Use Cases
   * https://docs.lightcone.ai/use-cases/software-testing/
   */
  // await softwareTesting(client);
  // await legacySoftware(client);
  // await crossAppWorkflows(client);
  /*
   * Integrations
   * https://docs.lightcone.ai/integrations/langchain/
   */
  // await langchainIntegration(client);
  // await vercelAiIntegration(client);
  await mastraIntegration(client);
  // await kernelIntegration(client);
}

main();
