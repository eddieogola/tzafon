from utils.example import example
from utils.term import Colors

PAGE = "use-cases/software-testing"


@example(PAGE, "test-a-login-flow", title="Testing a Login Flow")
def test_login_flow(client):
    for event in client.agent.tasks.start_stream(
        instruction=(
            "Go to https://app.example.com/login. "
            "Enter username 'testuser@example.com' and password 'test123'. "
            "Click the login button. "
            "Verify that the dashboard loads and shows a welcome message. "
            "If login fails, report the error message you see."
        ),
        kind="desktop",
        max_steps=15,
    ):
        print(event)


@example(PAGE, "test-a-multi-step-workflow", title="Testing a Multi-step Workflow")
def test_multi_step_workflow(client):
    for event in client.agent.tasks.start_stream(
        instruction=(
            "Go to https://app.example.com. Log in with 'admin@example.com' / 'admin123'. "
            "Navigate to Settings > Billing. "
            "Verify that the current plan shows 'Pro'. "
            "Click 'Update Payment Method'. "
            "Verify that the payment form loads with credit card fields visible. "
            "Do NOT submit the form - just confirm the form is present and functional."
        ),
        kind="desktop",
        max_steps=30,
    ):
        print(event)


@example(
    PAGE,
    "visual-verification-with-the-responses-api",
    title="Visual Verification with Responses API",
)
def visual_verification_with_responses_api(client):
    with client.computer.create(kind="desktop") as computer:
        client.computers.exec.sync(
            computer.id,
            command="nohup firefox https://app.example.com > /dev/null 2>&1 & disown",
        )
        computer.wait(5)

        screenshot = computer.screenshot()
        screenshot_url = computer.get_screenshot_url(screenshot)
        print(f"Screenshot URL: {Colors.BLUE}{screenshot_url}{Colors.RESET}\n")

        response = client.responses.create(
            model="tzafon.northstar-cua-fast-1.6",
            input=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": (
                                "Does this page look correct? Check for: "
                                "1) Logo is visible "
                                "2) Navigation bar has Home, Products, About links "
                                "3) No error messages or broken images. "
                                "Report any issues."
                            ),
                        },
                        {
                            "type": "input_image",
                            "image_url": screenshot_url,
                            "detail": "auto",
                        },
                    ],
                }
            ],
        )

        for item in response.output or []:
            if item.type == "message":
                for block in item.content or []:
                    if hasattr(block, "text") and block.text:
                        print(block.text)


def software_testing(client):
    print(f"{Colors.YELLOW}*** Software Testing Use Cases ***{Colors.RESET}\n")
    # test_login_flow(client)
    # test_multi_step_workflow(client)
    visual_verification_with_responses_api(client)
