import dotenv from "dotenv";
import Lightcone from "@tzafon/lightcone";
import {
  changeWikipediaLanguageAndRightClick,
  bnbSearchForHomes,
  githubSearchForTzafon,
  nyTimesScrollToBottom,
  searchForSfAndDrag,
  listTabsExecutionAction,
  multiTabOpen,
  multiTabPlaywrightOnWikipedia,
  persistentBrowserSession,
  persistentDesktopSession,
} from "./automations/index.js";

dotenv.config();

const client: Lightcone = new Lightcone();

// changeWikipediaLanguageAndRightClick(client);
// nyTimesScrollToBottom(client);
// bnbSearchForHomes(client);
// githubSearchForTzafon(client);
// searchForSfAndDrag(client);
// listTabsExecutionAction(client);
// multiTabOpen(client);
// multiTabPlaywrightOnWikipedia(client);
// persistentBrowserSession(client);
// persistentDesktopSession(client);

async function runBrowser(id: number) {
  try {
    await changeWikipediaLanguageAndRightClick(client);
  } catch (error) {
    console.error(`Browser ${id}: ${error}`);
  }
}

await Promise.all(Array.from({ length: 10 }, (_, i) => runBrowser(i)));
