import Lightcone from "@tzafon/lightcone";

const client = new Lightcone();

console.log(process.env.LIGHTCONE_API_KEY ? "API key loaded successfully" : "API key not found. Please set the LIGHTCONE_API_KEY environment variable.");

/*
 * Getting Started
 */

import { createBrowserSession } from "./auto/getting-started/browserSession.js";

createBrowserSession(client);
