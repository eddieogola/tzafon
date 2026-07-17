from utils.example import example
from utils.term import Colors

PAGE = "use-cases/cross-app-workflows"


@example(
    PAGE,
    "move-data-between-a-web-app-and-a-spreadsheet",
    title="Move Data Between a Web App and a Spreadsheet",
)
def move_data_between_web_app_and_spreadsheet(client):
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


@example(PAGE, "process-a-batch-across-systems", title="Process a Batch Across Systems")
def process_batch_across_systems(client):
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


@example(
    PAGE,
    "use-persistent-state-for-multi-session-workflows",
    title="Use Persistent State for Multi-session Workflows",
)
def use_persistent_state_for_multi_session_workflows(client):
    saved_id = None

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


def cross_app_workflows(client):
    print(
        f"{Colors.YELLOW}*** Cross-Application Workflows Use Cases ***{Colors.RESET}\n"
    )
    move_data_between_web_app_and_spreadsheet(client)
    process_batch_across_systems(client)
    use_persistent_state_for_multi_session_workflows(client)
