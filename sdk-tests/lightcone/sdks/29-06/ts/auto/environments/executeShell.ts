import type Lightcone from "@tzafon/lightcone/index.js";
import { Colors } from "@/utils/term";

async function synchronousExecution(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(`${Colors.YELLOW}*** Synchronous Execution ***${Colors.RESET}\n`);
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/shell-commands/#synchronous-execution${Colors.RESET}\n`,
  );

  const computer = await client.computers.create({ kind: "desktop" });
  const id = computer.id!;

  try {
    const result = await client.computers.exec.sync(id, {
      command: "echo 'Hello from Lightcone OS!'",
    });

    console.log(`stdout: ${Colors.BLUE}${result.stdout}${Colors.RESET}`);
    console.log(`stderr: ${Colors.YELLOW}${result.stderr}${Colors.RESET}`);
    console.log(`exit code: ${Colors.GREEN}${result.exit_code}${Colors.RESET}`);
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in synchronous execution: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function streamingExecution(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(`${Colors.YELLOW}*** Streaming Execution ***${Colors.RESET}\n`);
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/shell-commands/#streaming-execution${Colors.RESET}\n`,
  );

  const computer = await client.computers.create({ kind: "desktop" });
  const id = computer.id!;

  try {
    const stream = await client.computers.exec.create(id, {
      command: "printf 'line 1\\nline 2\\n'",
    });

    for await (const line of stream) {
      if (line.type === "stdout") {
        process.stdout.write(line.data ?? "");
      } else if (line.type === "stderr") {
        process.stderr.write(line.data ?? "");
      } else if (line.type === "exit") {
        console.log(`\nExit code: ${Colors.GREEN}${line.code}${Colors.RESET}`);
      } else if (line.type === "error") {
        console.log(
          `\n${Colors.RED}Stream error: ${line.message}${Colors.RESET}`,
        );
      }
    }
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in streaming execution: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function workingDirectoryAndEnvironment(
  client: Lightcone,
): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Working Directory and Environment ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/shell-commands/#working-directory-and-environment${Colors.RESET}\n`,
  );

  const computer = await client.computers.create({ kind: "desktop" });
  const id = computer.id!;

  try {
    await client.computers.exec.sync(id, {
      command: "mkdir -p /tmp/lightcone-shell-demo",
    });

    const result = await client.computers.exec.sync(id, {
      command: "pwd && echo $APP_MODE",
      cwd: "/tmp/lightcone-shell-demo",
      env: {
        APP_MODE: "production",
      },
    });

    console.log(`stdout: ${Colors.BLUE}${result.stdout}${Colors.RESET}`);
    console.log(`exit code: ${Colors.GREEN}${result.exit_code}${Colors.RESET}`);
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in working directory and environment: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function timeouts(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(`${Colors.YELLOW}*** Timeouts ***${Colors.RESET}\n`);
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/shell-commands/#timeouts${Colors.RESET}\n`,
  );

  const computer = await client.computers.create({ kind: "desktop" });
  const id = computer.id!;

  try {
    const result = await client.computers.exec.sync(id, {
      command: "sleep 10",
      timeout_seconds: 2,
    });

    console.log(`stdout: ${Colors.BLUE}${result.stdout}${Colors.RESET}`);
    console.log(`stderr: ${Colors.YELLOW}${result.stderr}${Colors.RESET}`);
    console.log(`exit code: ${Colors.GREEN}${result.exit_code}${Colors.RESET}`);
  } catch (e) {
    console.log(`\n${Colors.RED}Error in timeouts: ${e}${Colors.RESET}\n`);
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function commonUseCases(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(`${Colors.YELLOW}*** Common Use Cases ***${Colors.RESET}\n`);
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/shell-commands/#common-use-cases${Colors.RESET}\n`,
  );

  const computer = await client.computers.create({ kind: "desktop" });
  const id = computer.id!;

  try {
    const pythonResult = await client.computers.exec.sync(id, {
      command: `python3 -c "import json; print(json.dumps({'status': 'ok'}))"`,
    });
    console.log(
      `python output: ${Colors.BLUE}${(pythonResult.stdout ?? "").trim()}${Colors.RESET}`,
    );

    const processResult = await client.computers.exec.sync(id, {
      command: "ps aux | grep -m 1 python",
    });
    console.log(
      `process sample: ${Colors.YELLOW}${(processResult.stdout ?? "").trim()}${Colors.RESET}`,
    );
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in common use cases: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

export default async function executeShell(client: Lightcone): Promise<void> {
  console.log(
    `${Colors.YELLOW}*** Environments: Execute Shell Commands ***${Colors.RESET}\n`,
  );
  await synchronousExecution(client);
  await streamingExecution(client);
  await workingDirectoryAndEnvironment(client);
  await timeouts(client);
  await commonUseCases(client);
}
