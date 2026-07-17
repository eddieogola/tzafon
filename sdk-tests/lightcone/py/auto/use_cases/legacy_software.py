from utils.example import example
from utils.term import Colors

PAGE = "use-cases/legacy-software"


@example(
    PAGE, "operate-a-legacy-web-application", title="Operate a Legacy Web Application"
)
def operate_legacy_web_application(client):
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


@example(PAGE, "operate-a-desktop-application", title="Operate a Desktop Application")
def operate_desktop_application(client):
    with client.computer.create(kind="desktop", persistent=True) as computer:
        # Install the software if needed
        client.computers.exec.sync(
            computer.id,
            command="apt-get install -y libreoffice",
        )
        saved_id = computer.id

    # The environment is released, but persists — the task resumes it by id.
    for event in client.agent.tasks.start_stream(
        instruction=(
            "Open LibreOffice Calc. "
            "Create a new spreadsheet with columns: Date, Description, Amount, Category. "
            "Enter 5 sample expense entries. "
            "Add a SUM formula at the bottom of the Amount column. "
            "Save the file as /tmp/expenses.xlsx."
        ),
        kind="desktop",
        environment_id=saved_id,  # reuse the environment with LibreOffice installed
        max_steps=40,
    ):
        print(event)


@example(PAGE, "process-a-queue-of-records", title="Process a Queue of Records")
def process_queue_of_records(client):
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


def legacy_software(client):
    print(
        f"{Colors.YELLOW}*** Legacy Software Automation Use Cases ***{Colors.RESET}\n"
    )
    operate_legacy_web_application(client)
    operate_desktop_application(client)
    process_queue_of_records(client)
