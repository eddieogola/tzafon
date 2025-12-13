import os
import threading


from dotenv import load_dotenv

from auto import bnb_search_for_homes, change_wikipedia_language_and_right_click, github_search_for_tzafon, github_search_for_tzafon, ny_times_check_robots_txt, ny_times_scroll_to_bottom, search_for_sf_and_drag

load_dotenv()
API_KEY = os.getenv("TZAFON_API_KEY")

from tzafon import Computer

client = Computer(api_key=API_KEY)

# change_wikipedia_language_and_right_click(client)
# ny_times_scroll_to_bottom(client)
# ny_times_check_robots_txt(client)
# bnb_search_for_homes(client)
# github_search_for_tzafon(client)
# search_for_sf_and_drag(client)

def run_browser():
    # Get the current date and time in UTC with timezone info
    search_for_sf_and_drag(client)



threads = [threading.Thread(target=run_browser) for _ in range(100)]

for t in threads:
    t.start()
for t in threads:
    t.join()
