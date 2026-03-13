from time import time

from utils.term import Colors


def navigate_to_login_page(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Navigating to Login Page ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/tutorials/scrape-behind-a-login/#step-1-navigate-to-the-login-page{Colors.RESET}\n"
        )
        # Your code to navigate to the login page goes here

    except Exception as e:
        print(f"\n{Colors.RED}Error navigating to login page: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def scrape_behind_login(client):
    navigate_to_login_page(client)
