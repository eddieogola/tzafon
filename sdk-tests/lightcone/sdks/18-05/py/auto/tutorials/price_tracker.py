import re
import os
import json
from time import time

from utils.term import Colors

PRICE_FILE = "prices.json"
URL = "https://books.toscrape.com/catalogue/sapiens-a-brief-history-of-humankind_996/index.html"


def create_browser_and_visit_page(client):
    try:
        start_time = time()
        print(
            f"{Colors.YELLOW}*** Creating Browser and Visiting Page ***{Colors.RESET}\n"
        )
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/tutorials/build-a-price-tracker/#step-1-create-a-browser-and-visit-a-page{Colors.RESET}\n"
        )
        with client.computer.create(kind="browser") as computer:
            computer.navigate(URL)
            # Take a screenshot to see the page
            result = computer.screenshot()
            print(
                f"Screenshot URL: {Colors.BLUE}{computer.get_screenshot_url(result)}{Colors.RESET}\n"
            )

    except Exception as e:
        print(f"\n{Colors.RED}Error building price tracker: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def extract_price_from_page(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Extracting Price from Page ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/tutorials/build-a-price-tracker/#step-2-extract-the-price-from-the-page{Colors.RESET}\n"
        )
        with client.computer.create(kind="browser") as computer:
            computer.navigate(URL)
            # Get the page HTML
            html_result = computer.html()
            html_content = computer.get_html_content(html_result)

            # Extract the price using a simple regex
            match = re.search(r'price_color">£([\d.]+)<', html_content)

        price = float(match.group(1))
        print(f"Current price: {Colors.YELLOW}£{price}{Colors.RESET}\n")

    except Exception as e:
        print(f"\n{Colors.RED}Error building price tracker: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def save_prices_and_detect_changes(client):
    try:
        start_time = time()
        print(
            f"{Colors.YELLOW}*** Saving Prices and Detecting Changes ***{Colors.RESET}\n"
        )
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/tutorials/build-a-price-tracker/#step-3-save-prices-and-detect-changes{Colors.RESET}\n"
        )

        def load_prices():
            if os.path.exists(PRICE_FILE):
                with open(PRICE_FILE) as f:
                    return json.load(f)
            return []

        def save_price(price, screenshot_url):
            prices = load_prices()
            prices.append(
                {
                    "price": price,
                    "screenshot": screenshot_url,
                    "timestamp": __import__("datetime").datetime.now().isoformat(),
                }
            )
            with open(PRICE_FILE, "w") as f:
                json.dump(prices, f, indent=2)
            return prices

        def check_price():
            with client.computer.create(kind="browser") as computer:
                computer.navigate(URL)
                computer.wait(2)

                # Extract price
                html_result = computer.html()
                html_content = computer.get_html_content(html_result)
                match = re.search(r'price_color">£([\d.]+)<', html_content)
                price = float(match.group(1)) if match else None

                # Take a screenshot as proof
                result = computer.screenshot()
                screenshot_url = computer.get_screenshot_url(result)

                return price, screenshot_url

        # Run the check
        price, screenshot = check_price()
        prices = save_price(price, screenshot)

        print(f"Current price: {Colors.YELLOW}£{price}{Colors.RESET}\n")
        print(f"Screenshot URL: {Colors.BLUE}{screenshot}{Colors.RESET}\n")

        # Compare with previous price
        if len(prices) > 1:
            previous = prices[-2]["price"]
            if price < previous:
                print(
                    f"PRICE DROP! {Colors.GREEN}£{previous} → £{price}{Colors.RESET} (save £{previous - price:.2f})"
                )
            elif price > previous:
                print(
                    f"Price increased: {Colors.RED}£{previous} → £{price}{Colors.RESET}"
                )
            else:
                print(f"Price unchanged: {Colors.YELLOW}£{price}{Colors.RESET}")
        else:
            print("First check — will compare on next run")
    except Exception as e:
        print(f"\n{Colors.RED}Error building price tracker: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def use_persistent_session_for_faster_checks(client):
    try:
        start_time = time()
        print(f"{Colors.YELLOW}*** Using Persistent Session ***{Colors.RESET}\n")
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/tutorials/build-a-price-tracker/#step-4-use-a-persistent-session-for-faster-checks{Colors.RESET}\n"
        )

        # First run: create and save the session
        with client.computer.create(kind="browser", persistent=True) as computer:
            computer.navigate(URL)
            computer.wait(2)
            session_id = computer.id
            print(f"Session saved: {Colors.YELLOW}{session_id}{Colors.RESET}\n")

        # Subsequent runs: reuse the session
        with client.computer.create(
            kind="browser",
            environment_id=session_id,
        ) as computer:
            computer.navigate(URL)
            computer.wait(1)  # Faster — browser state is warm

            html_result = computer.html()
            html_content = computer.get_html_content(html_result)
            # ... extract price as before
            match = re.search(r'price_color">£([\d.]+)<', html_content)

            price = float(match.group(1))
            print(f"Current price: {Colors.YELLOW}£{price}{Colors.RESET}")

    except Exception as e:
        print(f"\n{Colors.RED}Error building price tracker: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def build_price_tracker(client):
    print(f"{Colors.YELLOW}*** Building Price Tracker ***{Colors.RESET}\n")
    create_browser_and_visit_page(client)
    extract_price_from_page(client)
    save_prices_and_detect_changes(client)
    use_persistent_session_for_faster_checks(client)
