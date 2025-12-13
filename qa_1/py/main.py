import threading

from tzafon import Computer
from dotenv import load_dotenv
load_dotenv()

from py.automations.auto import (search_for_lasgna,search_for_bnbs, change_wikipedia_language, open_in_new_tab, log_into_nytimes, search_for_sf, use_tzafon_ai_docs)

client = Computer()


# def run_browser():
search_for_sf(client)


# threads = [threading.Thread(target=run_browser) for _ in range(1)]

# for t in threads:
#     t.start()
# for t in threads:
#     t.join()


