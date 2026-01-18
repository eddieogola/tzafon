import dotenv from "dotenv";
import Computer from "tzafon";
import {
  changeWikipediaLanguageAndRightClick,
  bnbSearchForHomes,
  githubSearchForTzafon,
  nyTimesScrollToBottom,
  searchForSfAndDrag,
  listTabsExecutionAction,
  multiTabOpen,
  multiTabPlaywrightOnWikipedia,
} from "./automations/index.js";

dotenv.config({ path: ".env" });

const client: Computer = new Computer();

// changeWikipediaLanguageAndRightClick(client);
// nyTimesScrollToBottom(client);
// nyTimesCheckRobotsTxt(client);
// bnbSearchForHomes(client);
// githubSearchForTzafon(client);
// searchForSfAndDrag(client);
// listTabsExecutionAction(client);
// multiTabOpen(client);
multiTabPlaywrightOnWikipedia(client);

// async function runBrowser(id: number) {
//   try {
//     await githubSearchForTzafon(client);
//   } catch (error) {
//     console.error(`Browser ${id}: ${error}`);
//   }
// }

// await Promise.all(Array.from({ length: 100 }, (_, i) => runBrowser(i)));
