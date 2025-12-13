import os
import threading

from tzafon import Computer
from dotenv import load_dotenv
load_dotenv()

from automations.auto import (
    search_for_lasagna_and_right_click,
    change_wikipedia_language,
    open_in_new_tab_with_execute,
    open_in_new_tab_with_execute_action,
    ny_times_scroll_to_bottom,
    ny_times_check_robots_txt,
    bnb_search_for_experiences,
    bnb_search_for_homes,
    search_for_sf_and_drag, 
    use_tzafon_ai_docs
)
    

API_KEY = os.environ.get("TZAFON_API_KEY")

from tzafon import Computer

client = Computer(api_key=API_KEY)

# search_for_lasagna_and_right_click(client)
# change_wikipedia_language(client)
# open_in_new_tab_with_execute(client)
# open_in_new_tab_with_execute_action(client)
# ny_times_scroll_to_bottom(client)
# ny_times_check_robots_txt(client)
# bnb_search_for_homes(client)
# bnb_search_for_experiences(client)
# search_for_sf_and_drag(client)
# use_tzafon_ai_docs(client)

def run_browser():
    use_tzafon_ai_docs(client)


threads = [threading.Thread(target=run_browser) for _ in range(1)]

for t in threads:
    t.start()
for t in threads:
    t.join()
