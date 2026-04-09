from time import time

from utils.term import Colors


def move_data_between_web_app_and_spreadsheet(client):
    try:
        start_time = time()
        print(
            f"{Colors.YELLOW}*** Move Data Between a Web App and a Spreadsheet ***{Colors.RESET}\n"
        )
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/use-cases/cross-app-workflows/#move-data-between-a-web-app-and-a-spreadsheet{Colors.RESET}\n"
        )
        for event in client.agent.tasks.start_stream(
            instruction=(
                "Open Firefox and go to https://crm.example.com. Log in with 'ops@example.com' / 'ops123'. "
                "Navigate to the Contacts page. Find the contact 'Acme Corp'. "
                "Note their email address, phone number, and account status. "
                "Then open LibreOffice Calc. "
                "Enter the headers 'Company', 'Email', 'Phone', 'Status' in row 1. "
                "Enter the Acme Corp data in row 2. "
                "Save the file as /tmp/acme-export.csv."
            ),
            kind="desktop",
            max_steps=40,
        ):
            print(event)

    except Exception as e:
        print(f"\n{Colors.RED}Error moving data between apps: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def process_batch_across_systems(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Process a Batch Across Systems ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/use-cases/cross-app-workflows/#process-a-batch-across-systems{Colors.RESET}\n"
        )

        records = [
            {"name": "Acme Corp", "action": "renew"},
            {"name": "Globex Inc", "action": "upgrade"},
            {"name": "Initech LLC", "action": "cancel"},
        ]

        for record in records:
            print(f"Processing {record['name']}...")
            for event in client.agent.tasks.start_stream(
                instruction=(
                    f"Open Firefox and go to https://portal.example.com. "
                    f"Search for '{record['name']}'. "
                    "Click on their account. "
                    f"Click the '{record['action'].title()}' button. "
                    "Confirm the action. "
                    "Report whether it succeeded."
                ),
                kind="desktop",
                max_steps=20,
            ):
                print(f"  {event}")

    except Exception as e:
        print(
            f"\n{Colors.RED}Error processing batch across systems: {e}{Colors.RESET}\n"
        )
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def use_persistent_state_for_multi_session_workflows(client):
    saved_id = None
    try:
        start_time = time()
        print(
            f"{Colors.YELLOW}*** Use Persistent State for Multi-session Workflows ***{Colors.RESET}\n"
        )
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/use-cases/cross-app-workflows/#use-persistent-state-for-multi-session-workflows{Colors.RESET}\n"
        )

        with client.computer.create(kind="desktop", persistent=True) as computer:
            client.computers.exec.sync(
                computer.id,
                command="apt-get install -y libreoffice",
            )
            saved_id = computer.id
            print(f"Environment ready: {Colors.YELLOW}{saved_id}{Colors.RESET}")

        if saved_id:
            for event in client.agent.tasks.start_stream(
                instruction=(
                    "Open LibreOffice Calc, load /tmp/data.csv, and add a 'Total' "
                    "column that sums columns B through D"
                ),
                kind="desktop",
                environment_id=saved_id,
            ):
                print(event)

    except Exception as e:
        print(
            f"\n{Colors.RED}Error using persistent state workflow: {e}{Colors.RESET}\n"
        )
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def cross_app_workflows(client):
    print(
        f"{Colors.YELLOW}*** Cross-Application Workflows Use Cases ***{Colors.RESET}\n"
    )
    move_data_between_web_app_and_spreadsheet(client)
    process_batch_across_systems(client)
    use_persistent_state_for_multi_session_workflows(client)
