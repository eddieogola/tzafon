from time import time

from utils.term import Colors


def synchronous_execution(client):
	try:
		start_time = time()
		print(f"{Colors.YELLOW}*** Synchronous Execution ***{Colors.RESET}\n")
		print(
			f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/shell-commands/#synchronous-execution{Colors.RESET}\n"
		)
		with client.computer.create(kind="desktop") as computer:
			result = client.computers.exec.sync(
				computer.id,
				command="echo 'Hello from Lightcone OS!'",
			)
			print(f"stdout: {Colors.BLUE}{result.stdout}{Colors.RESET}")
			print(f"stderr: {Colors.YELLOW}{result.stderr}{Colors.RESET}")
			print(f"exit code: {Colors.GREEN}{result.exit_code}{Colors.RESET}")

	except Exception as e:
		print(f"\n{Colors.RED}Error in synchronous execution: {e}{Colors.RESET}\n")
	finally:
		end_time = time()
		print(
			f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
		)


def streaming_execution(client):
	try:
		start_time = time()
		print(f"{Colors.YELLOW}*** Streaming Execution ***{Colors.RESET}\n")
		print(
			f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/shell-commands/#streaming-execution{Colors.RESET}\n"
		)
		with client.computer.create(kind="desktop") as computer:
			stream = client.computers.exec.create(
				computer.id,
				command="printf 'line 1\\nline 2\\n'",
			)

			for line in stream:
				line_type = getattr(line, "type", None)
				if line_type == "stdout":
					print(getattr(line, "data", ""), end="")
				elif line_type == "stderr":
					print(f"ERR: {getattr(line, 'data', '')}", end="")
				elif line_type == "exit":
					print(
						f"\nExit code: {Colors.GREEN}{getattr(line, 'code', 'unknown')}{Colors.RESET}"
					)
				elif line_type == "error":
					print(
						f"\n{Colors.RED}Stream error: {getattr(line, 'message', 'unknown error')}{Colors.RESET}"
					)

	except Exception as e:
		print(f"\n{Colors.RED}Error in streaming execution: {e}{Colors.RESET}\n")
	finally:
		end_time = time()
		print(
			f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
		)


def working_directory_and_environment(client):
	try:
		start_time = time()
		print(
			f"{Colors.YELLOW}*** Working Directory and Environment ***{Colors.RESET}\n"
		)
		print(
			f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/shell-commands/#working-directory-and-environment{Colors.RESET}\n"
		)
		with client.computer.create(kind="desktop") as computer:
			client.computers.exec.sync(
				computer.id,
				command="mkdir -p /tmp/lightcone-shell-demo",
			)
			result = client.computers.exec.sync(
				computer.id,
				command="pwd && echo $APP_MODE",
				cwd="/tmp/lightcone-shell-demo",
				env={"APP_MODE": "production"},
			)
			print(f"stdout: {Colors.BLUE}{result.stdout}{Colors.RESET}")
			print(f"exit code: {Colors.GREEN}{result.exit_code}{Colors.RESET}")

	except Exception as e:
		print(
			f"\n{Colors.RED}Error in working directory and environment: {e}{Colors.RESET}\n"
		)
	finally:
		end_time = time()
		print(
			f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
		)


def timeouts(client):
	try:
		start_time = time()
		print(f"{Colors.YELLOW}*** Timeouts ***{Colors.RESET}\n")
		print(
			f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/shell-commands/#timeouts{Colors.RESET}\n"
		)
		with client.computer.create(kind="desktop") as computer:
			result = client.computers.exec.sync(
				computer.id,
				command="sleep 10",
				timeout_seconds=2,
			)
			print(f"stdout: {Colors.BLUE}{result.stdout}{Colors.RESET}")
			print(f"stderr: {Colors.YELLOW}{result.stderr}{Colors.RESET}")
			print(f"exit code: {Colors.GREEN}{result.exit_code}{Colors.RESET}")

	except Exception as e:
		print(f"\n{Colors.RED}Error in timeout example: {e}{Colors.RESET}\n")
	finally:
		end_time = time()
		print(
			f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
		)


def common_use_cases(client):
	try:
		start_time = time()
		print(f"{Colors.YELLOW}*** Common Use Cases ***{Colors.RESET}\n")
		print(
			f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/shell-commands/#common-use-cases{Colors.RESET}\n"
		)
		with client.computer.create(kind="desktop") as computer:
			python_result = client.computers.exec.sync(
				computer.id,
				command='python3 -c "import json; print(json.dumps({\"status\": \"ok\"}))"',
			)
			print(
				f"python output: {Colors.BLUE}{python_result.stdout.strip()}{Colors.RESET}"
			)

			process_result = client.computers.exec.sync(
				computer.id,
				command="ps aux | grep -m 1 python",
			)
			print(
				f"process sample: {Colors.YELLOW}{process_result.stdout.strip()}{Colors.RESET}"
			)

	except Exception as e:
		print(f"\n{Colors.RED}Error in common use cases: {e}{Colors.RESET}\n")
	finally:
		end_time = time()
		print(
			f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
		)


def execute_shell(client):
	print(f"{Colors.YELLOW}*** Environments: Execute Shell Commands ***{Colors.RESET}\n")
	synchronous_execution(client)
	streaming_execution(client)
	working_directory_and_environment(client)
	timeouts(client)
	common_use_cases(client)
