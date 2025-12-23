
import os

from dotenv import load_dotenv
from tzafon import Computer

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

load_dotenv()

client = Computer(api_key=os.getenv("TZAFON_API_KEY"))

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

event_streaming(client)
