import type Lightcone from "@tzafon/lightcone/index.js";
import { Colors } from "@/utils/term";

async function moveDataBetweenWebAppAndSpreadsheet(
  client: Lightcone,
): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Move Data Between a Web App and a Spreadsheet ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/use-cases/cross-app-workflows/#move-data-between-a-web-app-and-a-spreadsheet${Colors.RESET}\n`,
  );

  try {
    const stream = await client.agent.tasks.startStream({
      instruction:
        "Open Firefox and go to https://crm.example.com. Log in with 'ops@example.com' / 'ops123'. " +
        "Navigate to the Contacts page. Find the contact 'Acme Corp'. " +
        "Note their email address, phone number, and account status. " +
        "Then open LibreOffice Calc. " +
        "Enter the headers 'Company', 'Email', 'Phone', 'Status' in row 1. " +
        "Enter the Acme Corp data in row 2. " +
        "Save the file as /tmp/acme-export.csv.",
      kind: "desktop",
      max_steps: 40,
    });

    for await (const event of stream) {
      console.log(event);
    }
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error moving data between apps: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function processBatchAcrossSystems(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Process a Batch Across Systems ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/use-cases/cross-app-workflows/#process-a-batch-across-systems${Colors.RESET}\n`,
  );

  const records = [
    { name: "Acme Corp", action: "renew" },
    { name: "Globex Inc", action: "upgrade" },
    { name: "Initech LLC", action: "cancel" },
  ];

  try {
    for (const record of records) {
      console.log(`Processing ${record.name}...`);

      const stream = await client.agent.tasks.startStream({
        instruction:
          `Open Firefox and go to https://portal.example.com. ` +
          `Search for '${record.name}'. ` +
          `Click on their account. ` +
          `Click the '${record.action}' button. ` +
          `Confirm the action. ` +
          `Report whether it succeeded.`,
        kind: "desktop",
        max_steps: 20,
      });

      for await (const event of stream) {
        console.log(`  ${JSON.stringify(event)}`);
      }
    }
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error processing batch across systems: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function usePersistentStateForMultiSessionWorkflows(
  client: Lightcone,
): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Use Persistent State for Multi-session Workflows ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/use-cases/cross-app-workflows/#use-persistent-state-for-multi-session-workflows${Colors.RESET}\n`,
  );

  const computer = await client.computers.create({
    kind: "desktop",
    persistent: true,
  });
  const savedId = computer.id!;

  try {
    await client.computers.exec.sync(savedId, {
      command: "apt-get install -y libreoffice",
    });
    console.log(`Environment ready: ${Colors.YELLOW}${savedId}${Colors.RESET}`);

    const stream = await client.agent.tasks.startStream({
      instruction:
        "Open LibreOffice Calc, load /tmp/data.csv, and add a 'Total' column that sums columns B through D",
      kind: "desktop",
      environment_id: savedId,
    });

    for await (const event of stream) {
      console.log(event);
    }
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error using persistent state workflow: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await client.computers.delete(savedId);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

export default async function crossAppWorkflows(
  client: Lightcone,
): Promise<void> {
  console.log(
    `${Colors.YELLOW}*** Cross-Application Workflows Use Cases ***${Colors.RESET}\n`,
  );
  await moveDataBetweenWebAppAndSpreadsheet(client);
  await processBatchAcrossSystems(client);
  await usePersistentStateForMultiSessionWorkflows(client);
}
