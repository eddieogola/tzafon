import os

from tzafon import Lightcone
from utils.example import example
from utils.term import Colors

PAGE = "guides/authentication"


@example(PAGE, "set-the-environment-variable", title="Authentication: From Environment Variable")
def from_environment():
    """Set the environment variable — SDK reads TZAFON_API_KEY automatically."""
    client = Lightcone()  # reads TZAFON_API_KEY from environment
    print(f"Client base URL : {Colors.GREEN}{client.base_url}{Colors.RESET}")


@example(PAGE, "pass-the-key-explicitly", title="Authentication: Pass Key Explicitly")
def pass_key_explicitly():
    """Pass the key explicitly instead of relying on the environment variable."""
    client = Lightcone(api_key=os.environ["TZAFON_API_KEY"])
    print(f"Client base URL : {Colors.GREEN}{client.base_url}{Colors.RESET}")


@example(PAGE, "base-url", title="Authentication: Custom Base URL")
def custom_base_url():
    """Base URL — override for custom deployments or self-hosted instances."""
    client = Lightcone(base_url="https://your-deployment.example.com")
    print(f"Client base URL : {Colors.GREEN}{client.base_url}{Colors.RESET}")


@example(PAGE, "configure-timeouts-and-retries", title="Authentication: Timeouts and Retries")
def timeouts_and_retries():
    """Configure timeouts and retries — both SDKs retry on connection errors and 5xx responses."""
    client = Lightcone(
        timeout=30.0,  # seconds
        max_retries=3,
    )
    print(f"Client base URL : {Colors.GREEN}{client.base_url}{Colors.RESET}")
    print(f"Timeout         : {Colors.GREEN}{client.timeout}{Colors.RESET}")
    print(f"Max retries     : {Colors.GREEN}{client.max_retries}{Colors.RESET}")


def authentication_guide():
    from_environment()
    pass_key_explicitly()
    custom_base_url()
    timeouts_and_retries()
