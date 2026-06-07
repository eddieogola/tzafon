import os
import threading


from dotenv import load_dotenv

from auto import (
    bnb_search_for_homes,
    change_wikipedia_language_and_right_click,
    github_search_for_tzafon,
    ny_times_scroll_to_bottom,
    search_for_sf_and_drag,
    list_tabs_direct_api,
    multi_tab_open,
    persistent_browser_session,
    persistent_desktop_session,
    test_desktop_session,
)

load_dotenv()
API_KEY = os.getenv("TZAFON_API_KEY")

from tzafon import Lightcone

client = Lightcone(api_key=API_KEY)

# change_wikipedia_language_and_right_click(client)
# ny_times_scroll_to_bottom(client)
# bnb_search_for_homes(client)
# github_search_for_tzafon(client)
# search_for_sf_and_drag(client)
# list_tabs_direct_api(client)
# multi_tab_open(client)
# persistent_browser_session(client)
# persistent_desktop_session(client)
test_desktop_session(client)

# def run_browser():
#     search_for_sf_and_drag(client)


# threads = [threading.Thread(target=run_browser) for _ in range(100)]

# for t in threads:
#     t.start()
# for t in threads:
#     t.join()
