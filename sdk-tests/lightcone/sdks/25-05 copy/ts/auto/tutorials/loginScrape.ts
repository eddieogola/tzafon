import type Lightcone from "@tzafon/lightcone";
import { Colors } from "@/utils/term";

let sessionId: string | null = null;

async function navigateToLoginPage(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Navigating to Login Page ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/tutorials/scrape-behind-a-login/#step-1-navigate-to-the-login-page${Colors.RESET}\n`,
  );

  const computer = await client.computers.create({ kind: "browser" });
  const id = computer.id!;

  try {
    await client.computers.navigate(id, {
      url: "https://quotes.toscrape.com/login",
    });
    await new Promise((r) => setTimeout(r, 2000));

    const result = await client.computers.screenshot(id);
    console.log(
      `Login page: ${Colors.BLUE}${result.result?.screenshot_url}${Colors.RESET}`,
    );
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error navigating to login page: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function fillLoginForm(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(`${Colors.YELLOW}*** Filling Login Form ***${Colors.RESET}\n`);
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/tutorials/scrape-behind-a-login/#step-2-fill-in-the-login-form${Colors.RESET}\n`,
  );

  const computer = await client.computers.create({ kind: "browser" });
  const id = computer.id!;

  try {
    await client.computers.navigate(id, {
      url: "https://quotes.toscrape.com/login",
    });
    await new Promise((r) => setTimeout(r, 2000));

    // Fill in the username
    await client.computers.click(id, { x: 180, y: 165 }); // Username field
    await client.computers.type(id, { text: "scraper" });

    // Fill in the password
    await client.computers.click(id, { x: 180, y: 245 }); // Password field
    await client.computers.type(id, { text: "password" });

    // Submit
    await client.computers.click(id, { x: 85, y: 305 }); // Login button
    await new Promise((r) => setTimeout(r, 2000));

    // Verify login succeeded
    const screenshotResult = await client.computers.screenshot(id);
    console.log(
      `After login: ${Colors.BLUE}${screenshotResult.result?.screenshot_url}${Colors.RESET}`,
    );

    // Check the page HTML for confirmation
    const htmlResult = await client.computers.html(id);
    const content = htmlResult.result?.html_content as string;
    if (content.includes("Logout")) {
      console.log(`\n${Colors.GREEN}Login successful!${Colors.RESET}`);
    } else {
      console.log(
        `\n${Colors.RED}Login may have failed — check the screenshot${Colors.RESET}`,
      );
    }
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error filling login form: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function saveSession(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(`${Colors.YELLOW}*** Saving Session ***${Colors.RESET}\n`);
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/tutorials/scrape-behind-a-login/#step-3-save-the-session-for-reuse${Colors.RESET}\n`,
  );

  const computer = await client.computers.create({
    kind: "browser",
    persistent: true,
  });
  const id = computer.id!;

  try {
    await client.computers.navigate(id, {
      url: "https://quotes.toscrape.com/login",
    });
    await new Promise((r) => setTimeout(r, 2000));

    await client.computers.click(id, { x: 180, y: 165 });
    await client.computers.type(id, { text: "scraper" });
    await client.computers.click(id, { x: 180, y: 245 });
    await client.computers.type(id, { text: "password" });
    await client.computers.click(id, { x: 85, y: 305 });
    await new Promise((r) => setTimeout(r, 2000));

    // Verify login
    const htmlResult = await client.computers.html(id);
    const content = htmlResult.result?.html_content as string;
    if (!content.includes("Logout")) {
      throw new Error("Login failed");
    }

    sessionId = id;
    console.log(`Session saved: ${Colors.YELLOW}${sessionId}${Colors.RESET}`);
  } catch (e) {
    console.log(`\n${Colors.RED}Error saving session: ${e}${Colors.RESET}\n`);
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function restoreSessionAndScrape(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Restoring Session and Scraping ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/tutorials/scrape-behind-a-login/#step-4-restore-the-session-and-scrape${Colors.RESET}\n`,
  );

  if (!sessionId) {
    throw new Error("No session ID found. Run the saveSession step first.");
  }

  const computer = await client.computers.create({
    kind: "browser",
    environment_id: sessionId,
  });
  const id = computer.id!;

  try {
    // Go directly to an authenticated page
    await client.computers.navigate(id, {
      url: "https://quotes.toscrape.com",
    });
    await new Promise((r) => setTimeout(r, 2000));

    // Verify we're still logged in
    const htmlResult = await client.computers.html(id);
    const content = htmlResult.result?.html_content as string;

    if (!content.includes("Logout")) {
      console.log("Session expired — need to log in again");
    } else {
      // Extract quotes
      const quoteMatches = [
        ...content.matchAll(/class="text" itemprop="text">(.*?)</g),
      ];
      const authorMatches = [
        ...content.matchAll(/class="author" itemprop="author">(.*?)</g),
      ];

      for (let i = 0; i < quoteMatches.length; i++) {
        const quote = quoteMatches[i][1]
          .replace(/&#8220;/g, '"')
          .replace(/&#8221;/g, '"');
        const author = authorMatches[i]?.[1] ?? "Unknown";
        console.log(`${quote} — ${author}`);
      }
    }
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error restoring session and scraping: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function letAgentHandleLogin(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Letting an Agent Handle Login ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/tutorials/scrape-behind-a-login/#step-5-let-an-agent-handle-the-login${Colors.RESET}\n`,
  );

  try {
    const stream = await client.agent.tasks.startStream({
      instruction:
        "Go to https://quotes.toscrape.com/login. " +
        "Log in with username 'scraper' and password 'password'. " +
        "After logging in, extract all the quotes and their authors from the homepage. " +
        "Report each quote with its author.",
      kind: "browser",
      max_steps: 20,
    });

    for await (const event of stream) {
      console.log(event);
    }
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error letting agent handle login: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

export default async function scrapeBehinLogin(
  client: Lightcone,
): Promise<void> {
  await navigateToLoginPage(client);
  await fillLoginForm(client);
  await saveSession(client);
  await restoreSessionAndScrape(client);
  await letAgentHandleLogin(client);
}
