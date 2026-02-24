import os
import threading


from dotenv import load_dotenv

from auto import (
    bnb_search_for_homes,
    change_wikipedia_language_and_right_click,
    github_search_for_tzafon,
    ny_times_scroll_to_bottom,
    search_for_sf_and_drag,
    checkout_at_target,
    list_tabs_execution_action,
    list_tabs_direct_api,
    multi_tab_open,
    persistent_browser_session,
    persistent_desktop_session,
    test_desktop_session
)

load_dotenv()
API_KEY = os.getenv("TZAFON_API_KEY")

from tzafon import Computer

client = Computer(api_key=API_KEY)

# change_wikipedia_language_and_right_click(client)
# ny_times_scroll_to_bottom(client)
# bnb_search_for_homes(client)
# github_search_for_tzafon(client)
# search_for_sf_and_drag(client)
# checkout_at_target(client)
# list_tabs_execution_action(client)
# list_tabs_direct_api(client)
# multi_tab_open(client)
# persistent_browser_session(client)
# persistent_desktop_session(client)
test_desktop_session(client)


# def run_browser():
#     persistent_browser_session(client)


# threads = [threading.Thread(target=run_browser) for _ in range(1)]

# for t in threads:
#     t.start()
# for t in threads:
#     t.join()
