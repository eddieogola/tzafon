import os
from time import time

from tzafon import Lightcone
from utils.term import Colors


def from_environment():
    """Set the environment variable — SDK reads TZAFON_API_KEY automatically."""
    try:
        start_time = time()
        print(
            f"{Colors.YELLOW}*** Authentication: From Environment Variable ***{Colors.RESET}\n"
        )
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/authentication/#set-the-environment-variable{Colors.RESET}\n"
        )

        client = Lightcone()  # reads TZAFON_API_KEY from environment
        print(f"Client base URL : {Colors.GREEN}{client.base_url}{Colors.RESET}")

    except Exception as e:
        print(f"\n{Colors.RED}Error in from_environment: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def pass_key_explicitly():
    """Pass the key explicitly instead of relying on the environment variable."""
    try:
        start_time = time()
        print(
            f"{Colors.YELLOW}*** Authentication: Pass Key Explicitly ***{Colors.RESET}\n"
        )
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/authentication/#pass-the-key-explicitly{Colors.RESET}\n"
        )

        client = Lightcone(api_key=os.environ["TZAFON_API_KEY"])
        print(f"Client base URL : {Colors.GREEN}{client.base_url}{Colors.RESET}")

    except Exception as e:
        print(f"\n{Colors.RED}Error in pass_key_explicitly: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def custom_base_url():
    """Base URL — override for custom deployments or self-hosted instances."""
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Authentication: Custom Base URL ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/authentication/#base-url{Colors.RESET}\n"
        )

        client = Lightcone(base_url="https://your-deployment.example.com")
        print(f"Client base URL : {Colors.GREEN}{client.base_url}{Colors.RESET}")

    except Exception as e:
        print(f"\n{Colors.RED}Error in custom_base_url: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def timeouts_and_retries():
    """Configure timeouts and retries — both SDKs retry on connection errors and 5xx responses."""
    try:
        start_time = time()
        print(
            f"{Colors.YELLOW}*** Authentication: Timeouts and Retries ***{Colors.RESET}\n"
        )
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/guides/authentication/#configure-timeouts-and-retries{Colors.RESET}\n"
        )

        client = Lightcone(
            timeout=30.0,  # seconds
            max_retries=3,
        )
        print(f"Client base URL : {Colors.GREEN}{client.base_url}{Colors.RESET}")
        print(f"Timeout         : {Colors.GREEN}{client.timeout}{Colors.RESET}")
        print(f"Max retries     : {Colors.GREEN}{client.max_retries}{Colors.RESET}")

    except Exception as e:
        print(f"\n{Colors.RED}Error in timeouts_and_retries: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def authentication_guide():
    from_environment()
    pass_key_explicitly()
    custom_base_url()
    timeouts_and_retries()
