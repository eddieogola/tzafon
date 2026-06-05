from tzafon import Computer, Lightcone


def handle_screenshot_result(computer, result, message="Screenshot"):
    if result.status.lower() == "success":
        url = computer.get_screenshot_url(result)
        print("-" * 20)
        print("Computer ID:", computer.id)
        print(f"{message}: {url}")
        print("-" * 20)
    else:
        print("-" * 20)
        print("Screenshot failed")
        print("Computer ID:", computer.id)
        print("Status:", result.status)
        print("Error Message:", result.error_message)
        print("Timestamp:", result.timestamp)
        print("-" * 20)


def change_wikipedia_language_and_right_click(client: Lightcone):
    with client.computer.create(kind="browser") as computer:
        computer.set_viewport(1920, 1080)
        computer.navigate("https://wikipedia.org")
        computer.click(1050, 150)
        computer.wait(1)
        computer.right_click(1300, 450)

        result = computer.screenshot()
        handle_screenshot_result(computer, result, "Screenshot after changing language")


def ny_times_scroll_to_bottom(client: Lightcone):
    with client.computer.create(kind="browser") as computer:
        computer.set_viewport(1920, 1080)
        computer.navigate("https://www.nytimes.com/")
        computer.wait(2)
        computer.scroll(0, 1000)
        computer.wait(4)

        result = computer.screenshot()
        handle_screenshot_result(computer, result, "Screenshot after scrolling")


def ny_times_check_robots_txt(client: Computer):
    with client.create(kind="browser") as computer:
        computer.set_viewport(1920, 1080)
        computer.navigate("https://www.nytimes.com/robots.txt")
        computer.scroll(0, 500)
        computer.wait(2)

        result = computer.screenshot()
        url = computer.get_screenshot_url(result)
        print(f"Screenshot: {url}")

        html_result = computer.html(auto_detect_encoding=True)
        html_content = computer.get_html_content(html_result)
        print(html_content)


def bnb_search_for_homes(client: Computer):
    with client.create(kind="browser") as computer:
        computer.set_viewport(1920, 1080)
        computer.navigate("https://www.airbnb.com")
        computer.wait(2)
        computer.click(600, 150)
        computer.wait(2)
        computer.click(650, 250)
        computer.wait(2)
        computer.click(750, 500)
        computer.click(1100, 550)
        computer.click(1300, 150)
        computer.wait(3)
        computer.click(920, 650)
        computer.wait(5)

        result = computer.screenshot()

        handle_screenshot_result(computer, result, "Screenshot")


def github_search_for_tzafon(client: Computer):
    with client.create(kind="browser") as computer:
        computer.set_viewport(1920, 1080)
        computer.navigate("https://github.com")
        computer.wait(1)
        # computer.click(1500, 20) # 1080p
        computer.click(1050, 20)  # 720p
        computer.wait(1)
        computer.type("org:tzafon")
        computer.wait(1)
        computer.hotkey("enter")
        computer.wait(1)

        result = computer.screenshot()
        handle_screenshot_result(computer, result, "Screenshot")


def search_for_sf_and_drag(client: Computer):
    with client.create(
        kind="browser",
    ) as computer:
        computer.set_viewport(1920, 1080)
        computer.navigate("https://www.openstreetmap.org/")
        computer.wait(1)
        computer.type("San Francisco")
        computer.hotkey("enter")
        computer.wait(1)
        computer.drag(1300, 600, 900, 600)
        computer.wait(1)

        result = computer.screenshot()
        handle_screenshot_result(computer, result, "Screenshot")


def checkout_at_target(client: Computer):
    with client.create(kind="browser") as computer:
        computer.set_viewport(1920, 1080)
        computer.navigate("https://www.target.com/checkout")
        computer.wait(1)
        computer.click(1700, 220)
        computer.type("9211624201@mailinator.com")
        computer.hotkey("enter")
        computer.wait(2)

        result = computer.screenshot()
        handle_screenshot_result(computer, result, "Screenshot")


def list_tabs_execution_action(client: Computer):
    with client.create(kind="browser") as computer:
        # METHOD 1: Use execute_action for tab-specific operations
        result = computer.set_viewport(1920, 1080)
        print("Set viewport result:", result)

        result = client.computers.execute(id=computer.id, action={"type": "list_tabs"})

        tabs = result.result["tabs"]
        for tab in tabs:
            print(f"Tab {tab['id']}: {tab['title']} - {tab['url']}")


def list_tabs_direct_api(client: Computer):
    with client.create(kind="browser") as computer:
        # METHOD 2: Use the direct API (via client.computers)
        computer.set_viewport(1920, 1080)
        result = client.computers.execute(id=computer.id, action={"type": "list_tabs"})

        tabs = result.result["tabs"]
        print("tabs results: ", tabs)
        print("-" * 20)
        for tab in tabs:
            print(f"Tab {tab['tab_id']}: is main {tab['is_main']} - {tab['url']}")


def multi_tab_open(client: Computer):
    with client.create(kind="browser") as computer:
        # Create first tab and navigate
        computer.navigate("https://wikipedia.org")
        computer.wait(2)

        # List tabs to get the main tab ID
        result = client.computers.execute(id=computer.id, action={"type": "list_tabs"})
        main_tab = result.result["tabs"][0]["tab_id"]

        # Create a second tab
        result = client.computers.execute(
            id=computer.id, action={"type": "new_tab", "url": "https://tzafon.ai/"}
        )

        second_tab = result.result.get("created_tab_id")

        print(f"Second tab ID: {second_tab}, result: {result}")

        # Work on second tab using execute_action
        client.computers.execute(
            id=computer.id,
            action={"type": "click", "x": 100, "y": 200, "tab_id": second_tab},
        )

        client.computers.execute(
            id=computer.id,
            action={"type": "type", "text": "search query", "tab_id": second_tab},
        )

        # Switch back to main tab
        client.computers.execute(
            id=computer.id, action={"type": "switch_tab", "tab_id": main_tab}
        )

        # Work on main tab
        client.computers.execute(
            id=computer.id,
            action={"type": "click", "x": 150, "y": 250, "tab_id": main_tab},
        )

        # Take screenshots of both tabs
        screenshot1 = client.computers.execute(
            id=computer.id, action={"type": "screenshot", "tab_id": main_tab}
        )
        screenshot2 = client.computers.execute(
            id=computer.id, action={"type": "screenshot", "tab_id": second_tab}
        )

        print(f"Tab 1: {screenshot1.result['screenshot_url']}")
        print(f"Tab 2: {screenshot2.result['screenshot_url']}")

        # Close the second tab
        client.computers.execute(
            id=computer.id, action={"type": "close_tab", "tab_id": second_tab}
        )

        result = client.computers.execute(id=computer.id, action={"type": "list_tabs"})
        number_of_tabs_left = len(result.result["tabs"])

        print(f"Number of tabs left after closing second tab: {number_of_tabs_left}")


def multi_tab_playwright_on_wikipedia(client: Computer):
    with client.create(kind="browser") as computer:
        computer.set_viewport(1920, 1080)
        client.computers.navigate(id=computer.id, url="https://wikipedia.org")
        computer.wait(2)

        # Open Playstore link this automaticaaly opens in a new tab
        client.computers.click(id=computer.id, x=250, y=920)
        computer.wait(2)

        # Open Appstore link which also opens in a new tab
        client.computers.click(id=computer.id, x=400, y=920)
        computer.wait(2)

        # get open tabs
        result = client.computers.execute(id=computer.id, action={"type": "list_tabs"})

        print("Number of open tabs:", len(result.result["tabs"]))

        result = computer.screenshot()
        url = computer.get_screenshot_url(result)

        print(f"Screenshot on Wikipedia main page: {url}")


def persistent_browser_session(client: Computer):
    print("*" * 20)
    session_id = None
    with client.create(kind="browser", persistent=True) as computer:
        computer.navigate("https://lingualeo.com/en")
        computer.wait(2)

        # Accept cookies if prompted
        computer.click(945, 645)
        computer.wait(1)

        # Click "Start Learning" / login button
        computer.click(1010, 35)
        computer.wait(1)

        # Click "I already have an account"
        computer.click(600, 600)
        computer.wait(1)

        # Enter credentials
        computer.click(600, 230)
        computer.type("9211624201@mailinator.com")

        computer.click(600, 300)
        computer.type("Mail@9211624201")

        computer.click(600, 380)
        computer.wait(10)

        result = computer.screenshot()
        handle_screenshot_result(computer, result, "Logged in")

        # Save for later
        session_id = computer.id
        print(f"Saved session: {session_id}")

    # === PART 2: Restore and verify ===
    print("\nRestoring session...")

    with client.create(kind="browser", environment_id=session_id) as computer:
        computer.navigate("https://lingualeo.com/en")
        computer.wait(5)

        result = computer.screenshot()
        print(f"Restored (should be logged in): {computer.get_screenshot_url(result)}")

    print("*" * 20)


def persistent_desktop_session(client: Computer):
    print("*" * 20)
    session_id = None
    # Create a persistent desktop session and set it up
    with client.create(kind="desktop", persistent=True) as computer:
        session_id = computer.id
        # Install software, configure the environment
        client.computers.exec.execute_sync(
            id=computer.id, command="mkdir -p ~/Desktop/project"
        )
        computer.wait(3)

        result = computer.screenshot()
        print(f"Setup complete: {computer.get_screenshot_url(result)}")
        print(f"Session ID (save this): {computer.id}")

    # Session ends - full VM snapshot is saved
    # Restore the desktop environment later — all installed software and files will be intact:
    with client.create(kind="desktop", environment_id=session_id) as computer:
        # nodejs is already installed, project directory exists
        client.computers.exec.execute_sync(
            id=computer.id, command="cd ~/Desktop/project && node --version"
        )
        computer.wait(2)

        result = computer.screenshot()
        print(f"Restored: {computer.get_screenshot_url(result)}")

    print("*" * 20)


def test_desktop_session(client: Computer):
    with client.create(kind="desktop") as computer:
        computer.execute({"command": "echo Hello, World! > ~/hello.txt"})
        computer.wait(2)

        result = computer.screenshot()
        print(f"Desktop session test: {computer.get_screenshot_url(result)}")
