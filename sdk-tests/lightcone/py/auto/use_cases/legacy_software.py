from time import time

from utils.term import Colors


def operate_legacy_web_application(client):
    try:
        start_time = time()
        print(
            f"{Colors.YELLOW}*** Operate a Legacy Web Application ***{Colors.RESET}\n"
        )
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/use-cases/legacy-software/#operate-a-legacy-web-application{Colors.RESET}\n"
        )
        for event in client.agent.tasks.start_stream(
            instruction=(
                "Open Firefox and go to https://crm.example.com. "
                "Log in with 'ops@example.com' / 'ops123'. "
                "Navigate to Contacts > New Contact. "
                "Fill in: First Name 'Jane', Last Name 'Smith', "
                "Email 'jane.smith@acme.com', Company 'Acme Corp'. "
                "Click Save. "
                "Verify the contact was created successfully."
            ),
            kind="desktop",
            max_steps=30,
        ):
            print(event)

    except Exception as e:
        print(
            f"\n{Colors.RED}Error operating legacy web application: {e}{Colors.RESET}\n"
        )
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def operate_desktop_application(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Operate a Desktop Application ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/use-cases/legacy-software/#operate-a-desktop-application{Colors.RESET}\n"
        )

        with client.computer.create(kind="desktop", persistent=True) as computer:
            client.computers.exec.sync(
                computer.id,
                command="apt-get install -y libreoffice",
            )

            for event in client.agent.tasks.start_stream(
                instruction=(
                    "Open LibreOffice Calc. "
                    "Create a new spreadsheet with columns: Date, Description, Amount, Category. "
                    "Enter 5 sample expense entries. "
                    "Add a SUM formula at the bottom of the Amount column. "
                    "Save the file as /tmp/expenses.xlsx."
                ),
                kind="desktop",
                environment_id=computer.id,
                max_steps=40,
            ):
                print(event)

    except Exception as e:
        print(f"\n{Colors.RED}Error operating desktop application: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def process_queue_of_records(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Process a Queue of Records ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/use-cases/legacy-software/#process-a-queue-of-records{Colors.RESET}\n"
        )

        records = [
            {"name": "Jane Smith", "email": "jane@acme.com", "role": "Manager"},
            {"name": "Bob Chen", "email": "bob@acme.com", "role": "Engineer"},
            {"name": "Sara Lee", "email": "sara@acme.com", "role": "Director"},
        ]

        for record in records:
            print(f"Creating user: {record['name']}")
            for event in client.agent.tasks.start_stream(
                instruction=(
                    f"Go to https://admin.example.com/users/new. "
                    f"Fill in Name: '{record['name']}', Email: '{record['email']}', Role: '{record['role']}'. "
                    "Click Create User. Verify the success message appears."
                ),
                kind="desktop",
                max_steps=15,
            ):
                print(f"  {event}")

    except Exception as e:
        print(f"\n{Colors.RED}Error processing queue of records: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def legacy_software(client):
    print(
        f"{Colors.YELLOW}*** Legacy Software Automation Use Cases ***{Colors.RESET}\n"
    )
    operate_legacy_web_application(client)
    operate_desktop_application(client)
    process_queue_of_records(client)
