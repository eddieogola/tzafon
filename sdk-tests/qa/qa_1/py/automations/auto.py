from tzafon import Computer

def search_for_lasgna(client: Computer):
    with client.create(kind="browser") as computer:
        computer.navigate("https://wikipedia.com")
        computer.type("Lasagna")
        computer.hotkey("enter")
        computer.wait(1)

        result = computer.screenshot()
        url = computer.get_screenshot_url(result)
        print(f"Screenshot: {url}")

def change_wikipedia_language(client: Computer):
    with client.create(kind="browser") as computer:
        computer.set_viewport(1920, 1080)
        computer.navigate("https://wikipedia.org")
        computer.click(1050,150)
        computer.wait(3)

        result = computer.screenshot()
        url = computer.get_screenshot_url(result)
        print(f"Screenshot after changing language: {url}")

def open_in_new_tab(client: Computer):
    with client.create(kind="browser") as computer:
        computer.set_viewport(1920, 1080)
        computer.navigate("https://wikipedia.org")
        computer.scroll(0, 300)
        computer.click(300, 800)
        computer.wait(3)
        computer.hotkey("alt","tab") # not sure how to switch browser tabs

        result = computer.screenshot()
        screenshot_url = computer.get_screenshot_url(result)
        print(f"Screenshot of new tab: {screenshot_url}")

def scroll_to_bottom(client: Computer):
    with client.create(kind="browser") as computer:
        computer.set_viewport(1920, 1080)
        computer.navigate("https://www.nytimes.com/")
        computer.scroll(0, 500)
        computer.wait(2)

        result = computer.screenshot()
        url = computer.get_screenshot_url(result)
        print(f"Screenshot after login: {url}")

def log_into_nytimes(client: Computer):
    with client.create(kind="browser") as computer:
        computer.set_viewport(1920, 1080)
        computer.navigate("https://www.nytimes.com/")
        computer.wait(2)
    

        result = computer.screenshot()
        url = computer.get_screenshot_url(result)
        print(f"Screenshot after login: {url}")


def search_for_bnbs(client: Computer):
    with client.create(kind="browser") as computer:
        computer.set_viewport(1920, 1080)
        computer.navigate("https://www.airbnb.com")
        computer.wait(2)
        computer.click(600, 150)
        computer.wait(2) 
        computer.click(650, 250) 
        computer.wait(2)     
        computer.click(750,500)
        computer.click(1100,550)
        computer.click(1300,150)
        computer.wait(3)
   

        result = computer.screenshot()
        url = computer.get_screenshot_url(result)
        print(f"Screenshot: {url}")

def search_for_sf(client: Computer):
    with client.create(kind="browser") as computer:
        computer.set_viewport(1920, 1080)
        computer.navigate("https://www.openstreetmap.org/")
        computer.wait(2)
        computer.type("San Francisco")
        computer.hotkey("enter")
        computer.wait(2)

        result = computer.screenshot()
        url = computer.get_screenshot_url(result)
        print(f"Screenshot: {url}")


def use_tzafon_ai_docs(client: Computer):
    with client.create(kind="browser") as computer:
        computer.set_viewport(1920, 1080)
        computer.navigate("https://docs.tzafon.ai/overview")
        computer.wait(3)
        computer.click(900, 1020)
        computer.wait(3)
        computer.type("Explain the concept of Tzafon AI in simple terms.")
        computer.hotkey("enter")
        computer.wait(4)

        result = computer.screenshot()
        url = computer.get_screenshot_url(result)
        print(f"Screenshot: {url}")