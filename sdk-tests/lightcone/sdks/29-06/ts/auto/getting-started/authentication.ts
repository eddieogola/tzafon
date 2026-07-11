import Lightcone from "@tzafon/lightcone/index.js";
import { Colors } from "@/utils/term";

/** Set the environment variable — SDK reads TZAFON_API_KEY automatically. */
async function fromEnvironment(): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Authentication: From Environment Variable ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/authentication/#set-the-environment-variable${Colors.RESET}\n`,
  );

  try {
    const client = new Lightcone(); // reads TZAFON_API_KEY from environment
    console.log(
      `Client base URL : ${Colors.GREEN}${client.baseURL}${Colors.RESET}`,
    );
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in fromEnvironment: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

/** Pass the key explicitly instead of relying on the environment variable. */
async function passKeyExplicitly(): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Authentication: Pass Key Explicitly ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/authentication/#pass-the-key-explicitly${Colors.RESET}\n`,
  );

  try {
    const client = new Lightcone({ apiKey: process.env.TZAFON_API_KEY! });
    console.log(
      `Client base URL : ${Colors.GREEN}${client.baseURL}${Colors.RESET}`,
    );
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in passKeyExplicitly: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

/** Base URL — override for custom deployments or self-hosted instances. */
async function customBaseUrl(): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Authentication: Custom Base URL ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/authentication/#base-url${Colors.RESET}\n`,
  );

  try {
    const client = new Lightcone({
      baseURL: "https://your-deployment.example.com",
    });
    console.log(
      `Client base URL : ${Colors.GREEN}${client.baseURL}${Colors.RESET}`,
    );
  } catch (e) {
    console.log(`\n${Colors.RED}Error in customBaseUrl: ${e}${Colors.RESET}\n`);
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

/** Configure timeouts and retries — both SDKs retry on connection errors and 5xx responses. */
async function timeoutsAndRetries(): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Authentication: Timeouts and Retries ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/authentication/#configure-timeouts-and-retries${Colors.RESET}\n`,
  );

  try {
    const client = new Lightcone({
      timeout: 30000, // milliseconds
      maxRetries: 3,
    });
    console.log(
      `Client base URL : ${Colors.GREEN}${client.baseURL}${Colors.RESET}`,
    );
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in timeoutsAndRetries: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

export default async function authenticationGuide(): Promise<void> {
  await fromEnvironment();
  await passKeyExplicitly();
  await customBaseUrl();
  await timeoutsAndRetries();
}
