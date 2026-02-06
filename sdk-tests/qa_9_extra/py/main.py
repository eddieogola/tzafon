import os

from dotenv import load_dotenv
from tzafon import Computer, AsyncComputer

from tasks.task_1_1 import (
    shift_click_selection,
    control_click_selection,
    alt_click_selection,
    check_key_up_releases_key,
)
from tasks.task_1_2 import draw_line
from tasks.task_2_1 import basic_batch_execution
from tasks.task_2_2 import batch_error_handling
from tasks.task_3_1 import keep_alive
from tasks.task_3_2 import event_streaming
from tasks.task_3_3 import event_screencast
from tasks.task_4_1 import (
    browser_automation_example,
    desktop_automation_example,
    session_configuration_example,
    page_context_api_example,
    chat_completion_example,
    versioning_example,
)
from tasks.task_4_2 import mouse_up, mouse_down, key_down, key_up

load_dotenv()

client = Computer(api_key=os.getenv("TZAFON_API_KEY"))

aclient = AsyncComputer(api_key=os.getenv("TZAFON_API_KEY"))


"""
Task 1: Low-Level Input Actions

"""
"""
# Task 1.1 Shift-click selection
"""

# shift_click_selection(client)
# control_click_selection(client)
# alt_click_selection(client)
# check_key_up_releases_key(client)

"""
# Task 1.2 Fine-Grained Drag (mouse_down/mouse_up)
"""

# draw_line(client)

"""
Task 2: Batch Actions

"""
"""
# Task 2.1:  Basic Batch Execution
"""

# basic_batch_execution(client)

"""
# Task 2.2:  Batch Error Handling
"""

# batch_error_handling(client)

"""
Task 3: Streaming & Session Management [~60 min]
"""

"""
3.1 Keep Alive
"""

# keep_alive(client)

"""
3.2 Event Streaming (Optional/Advanced)
"""

# event_streaming(client)

"""
3.3 Event Screencast (Optional/Advanced)
"""

# event_screencast(client)

"""
Task 4: Documentation Review
"""

"""
4.1 README Files
"""
# browser_automation_example(client)
# desktop_automation_example(client)
# session_configuration_example(client)
# page_context_api_example(client)
# chat_completion_example()
# versioning_example()

"""
4.2 Documentation Pages
"""

# Low-level Input Actions https://docs.tzafon.ai/core-concepts/actions#low-level-input-actions

# mouse_up(client)
# mouse_down(client)
# key_down(client)
# key_up(client)
