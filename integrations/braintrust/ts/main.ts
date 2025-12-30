import * as braintrust from "braintrust";
import dotenv from "dotenv";
import Computer from "tzafon";
import { z } from "zod";

dotenv.config();

const TZAFON_API_KEY = process.env.TZAFON_API_KEY;

const client = new Computer({
  apiKey: TZAFON_API_KEY,
});

// Load page from the internet
async function loadPage({ url }: { url: string }) {
  const browser = await client.create({ kind: "browser" });

  try {
    browser.navigate(url);
    browser.wait(2);
    const html = browser.getHTML();

    return { page: html };
  } finally {
    await browser.terminate();
  }
}

// Create a new project and tool in Braintrust
const project = braintrust.projects.create({
  name: "TZAFON API Tool - TypeScript",
});

project.tools.create({
  handler: loadPage,
  parameters: z.object({
    url: z.string(),
  }),
  returns: z.object({
    page: z.string(),
  }),
  name: "Load page",
  slug: "load-page",
  description: "Load a page from the internet",
  ifExists: "replace",
});
