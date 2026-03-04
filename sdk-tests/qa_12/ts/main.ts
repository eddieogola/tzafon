import dotenv from "dotenv";
import Computer from "@tzafon/computer";
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

const client: Computer = new Computer();

// changeWikipediaLanguageAndRightClick(client);
// nyTimesScrollToBottom(client);
// bnbSearchForHomes(client);
// githubSearchForTzafon(client);
// searchForSfAndDrag(client);
// listTabsExecutionAction(client);
// multiTabOpen(client);
// multiTabPlaywrightOnWikipedia(client);
// persistentBrowserSession(client);
persistentDesktopSession(client);