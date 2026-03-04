from tzafon import Computer

def search_for_lasagna_and_right_click(client: Computer):
    with client.create(kind="browser") as computer:
        computer.set_viewport(1920, 1080)    
        computer.navigate("https://wikipedia.org")
        computer.type("Lasagna")
        computer.hotkey("enter")
        computer.wait(1)
        computer.right_click(1300,450)

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

def open_in_new_tab_with_execute(client):
    with client.create(kind="browser") as computer:
        computer.set_viewport(1920, 1080)
        nav_result = computer.navigate("https://wikipedia.org")
        tab_id = nav_result.executed_tab_id

        computer.execute({
        "type": "navigate",
        "url": "https://wikipedia.org",
        "tab_id": tab_id
        })

def open_in_new_tab_with_execute_action(client):
    with client.create(kind="browser") as computer:
        computer.set_viewport(1920, 1080)
        nav_result = computer.navigate("https://wikipedia.org")
        tab_id = nav_result.executed_tab_id

        computer.execute_action({
        "type": "navigate",
        "url": "https://wikipedia.org",
        "tab_id": tab_id
        })


def ny_times_scroll_to_bottom(client: Computer):
    with client.create(kind="browser") as computer:
        computer.set_viewport(1920, 1080)
        computer.navigate("https://www.nytimes.com/")
        computer.scroll(0, 500)
        computer.wait(2)

        result = computer.screenshot()
        url = computer.get_screenshot_url(result)
        print(f"Screenshot: {url}")

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
        computer.click(750,500)
        computer.click(1100,550)
        computer.click(1300,150)
        computer.wait(3)
        computer.click(920,650)
        computer.wait(5)
        
        result = computer.screenshot()
        url = computer.get_screenshot_url(result)
        print(f"Screenshot: {url}")

def bnb_search_for_experiences(client: Computer):
    with client.create(kind="browser") as computer:
        computer.set_viewport(1920, 1080)
        computer.navigate("https://www.airbnb.com")
        computer.wait(2)
        computer.click(950, 30)
        computer.wait(2)
        computer.click(950, 400)
        computer.wait(3)
        computer.click(920,680)
        computer.wait(2)
        computer.click(100,400)
        computer.wait(5)

        tabs_result =  client.computers.execute_action(id=computer.id, action={
            "type": "list_tabs",
            "include_context":True
        
        })

        print(f"Number of tabs: {len(tabs_result.result.get('tabs', []))}\n")
        print(f"First tab: {tabs_result.result.get('tabs', [])[0]}\n")

        result = computer.screenshot()
        url = computer.get_screenshot_url(result)
        print(f"Screenshot: {url}")

def search_for_sf_and_drag(client: Computer):
    with client.create(kind="browser") as computer:
        computer.set_viewport(1920, 1080)
        computer.navigate("https://www.openstreetmap.org/")
        computer.wait(2)
        computer.type("San Francisco")
        computer.hotkey("enter")
        computer.wait(2)
        computer.drag(1300,600, 900,600)
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
        computer.type("How do I open multiple browser tabs")
        computer.hotkey("enter")
        computer.wait(10)

        result = computer.screenshot()
        url = computer.get_screenshot_url(result)
        print(f"Screenshot: {url}")
