import os

from tzafon import Computer
from auto.regression_test import (
    check_create_method,
    check_execute_action_method,
    check_modifier_keys_shift,
    check_modifier_keys_control,
    check_modifier_keys_alt,
    check_mouse_down_up,
)
from auto.new_features import (
    check_batch_actions,
    check_batch_actions_stops_on_first_error,
)
from auto.compatibility import check_open_ai_compatibility

client = Computer(
    api_key=os.getenv("TZAFON_API_KEY"),
)

# Un-comment the test you want to run

"""
Task 1: Regression Testing

"""

# === 1.1 SDK Regression - Python ===

# *** Test A: create() method works (was broken in v2.12-2.14) ***
# check_create_method(client)

# *** Test B: execute_action via direct API ***
# check_execute_action_method(client)

# === 1.2 Low-Level Input Actions ===

# *** Test A: Modifier keys (Shift, Control, Alt) ***
# check_modifier_keys_shift(client)
# check_modifier_keys_control(client)
# check_modifier_keys_alt(client)

# *** Test B: mouse_down / mouse_up ***
# check_mouse_down_up(client)


"""
Task 2: New Features - Computers API 

"""

# === 2.4 Batch Actions ===
# check_batch_actions(client)
# check_batch_actions_stops_on_first_error(client)

"""
Task 4: New Features - Computers API 

"""
# check_open_ai_compatibility()
