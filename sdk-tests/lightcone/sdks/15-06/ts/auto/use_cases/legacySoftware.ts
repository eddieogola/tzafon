import type Lightcone from "@tzafon/lightcone/index.js";
import { Colors } from "@/utils/term";

async function operateLegacyWebApplication(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Operate a Legacy Web Application ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/use-cases/legacy-software/#operate-a-legacy-web-application${Colors.RESET}\n`,
  );

  try {
    const stream = await client.agent.tasks.startStream({
      instruction:
        "Open Firefox and go to https://crm.example.com. " +
        "Log in with 'ops@example.com' / 'ops123'. " +
        "Navigate to Contacts > New Contact. " +
        "Fill in: First Name 'Jane', Last Name 'Smith', " +
        "Email 'jane.smith@acme.com', Company 'Acme Corp'. " +
        "Click Save. " +
        "Verify the contact was created successfully.",
      kind: "desktop",
      max_steps: 30,
    });

    for await (const event of stream) {
      console.log(event);
    }
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error operating legacy web application: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function operateDesktopApplication(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Operate a Desktop Application ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/use-cases/legacy-software/#operate-a-desktop-application${Colors.RESET}\n`,
  );

  const computer = await client.computers.create({
    kind: "desktop",
    persistent: true,
  });
  const id = computer.id!;

  try {
    await client.computers.exec.sync(id, {
      command: "apt-get install -y libreoffice",
    });

    const stream = await client.agent.tasks.startStream({
      instruction:
        "Open LibreOffice Calc. " +
        "Create a new spreadsheet with columns: Date, Description, Amount, Category. " +
        "Enter 5 sample expense entries. " +
        "Add a SUM formula at the bottom of the Amount column. " +
        "Save the file as /tmp/expenses.xlsx.",
      kind: "desktop",
      environment_id: id,
      max_steps: 40,
    });

    for await (const event of stream) {
      console.log(event);
    }
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error operating desktop application: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function processQueueOfRecords(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Process a Queue of Records ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/use-cases/legacy-software/#process-a-queue-of-records${Colors.RESET}\n`,
  );

  const records = [
    { name: "Jane Smith", email: "jane@acme.com", role: "Manager" },
    { name: "Bob Chen", email: "bob@acme.com", role: "Engineer" },
    { name: "Sara Lee", email: "sara@acme.com", role: "Director" },
  ];

  try {
    for (const record of records) {
      console.log(`Creating user: ${record.name}`);

      const stream = await client.agent.tasks.startStream({
        instruction:
          `Go to https://admin.example.com/users/new. ` +
          `Fill in Name: '${record.name}', Email: '${record.email}', Role: '${record.role}'. ` +
          "Click Create User. Verify the success message appears.",
        kind: "desktop",
        max_steps: 15,
      });

      for await (const event of stream) {
        console.log(`  ${JSON.stringify(event)}`);
      }
    }
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error processing queue of records: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

export default async function legacySoftware(client: Lightcone): Promise<void> {
  console.log(
    `${Colors.YELLOW}*** Legacy Software Automation Use Cases ***${Colors.RESET}\n`,
  );
  await operateLegacyWebApplication(client);
  await operateDesktopApplication(client);
  await processQueueOfRecords(client);
}
