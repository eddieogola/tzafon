import dotenv from "dotenv";
import Computer from "tzafon";

dotenv.config({ path: ".env" });

import {
  changeWikipediaLanguageAndRightClick,
  nyTimesScrollToBottom,
  nyTimesCheckRobotsTxt,
  bnbSearchForHomes,
  githubSearchForTzafon,
  searchForSfAndDrag,
  listTabsExecutionAction,
  multiTabOpen,
  multiTabPlaywrightOnWikipedia,
} from "@/automations";

const client: Computer = new Computer();

// changeWikipediaLanguageAndRightClick(client);
// nyTimesScrollToBottom(client);
// nyTimesCheckRobotsTxt(client);
// bnbSearchForHomes(client);
// githubSearchForTzafon(client);
// searchForSfAndDrag(client);
// listTabsExecutionAction(client);
// multiTabOpen(client);
// multiTabPlaywrightOnWikipedia(client);
