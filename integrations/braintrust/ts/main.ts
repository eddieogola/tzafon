import * as braintrust from "braintrust";
import dotenv from "dotenv";
import Computer from "tzafon";
import { z } from "zod";

dotenv.config();

const TZAFON_API_KEY = process.env.TZAFON_API_KEY;

async function loadPage({ url }: { url: string }) {
  const client = new Computer({
    apiKey: TZAFON_API_KEY,
  });
  const browser = await client.create({ kind: "browser" });

  try {
    await browser.navigate(url);
    await browser.wait(1);
    const result = await browser.getHTML();
    const htmlContent = result.result?.html_content;

    return { page: htmlContent };
  } finally {
    await browser.terminate();
  }
}

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
