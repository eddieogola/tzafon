import dotenv from "dotenv";
import Computer from "tzafon";

dotenv.config({ path: ".env" });

import {
  searchForLasagna,
  changeWikipediaLanguage,
  openInNewTab,
  scrollToBottom,
  searchForBnBs,
  searchForSF,
  useTzafonAIdocs,
} from "@/automations";

const client: Computer = new Computer();

// searchForLasagna(client);
// changeWikipediaLanguage(client);
// openInNewTab(client);
// scrollToBottom(client);
// searchForBnBs(client);
// searchForSF(client);
// useTzafonAIdocs(client);

async function runBrowser(id: number) {
  try {
    searchForSF(client);
  } catch (error) {
    console.error(`Browser ${id}: ${error}`);
  }
}

await Promise.all(Array.from({ length: 100 }, (_, i) => runBrowser(i)));
