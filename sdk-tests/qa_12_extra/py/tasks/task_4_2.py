
from tzafon import Computer

"""
Low-level Input Actions
"""
def mouse_down(client):
    with client.create(kind="browser") as computer:
        computer.execute_action({
            "type": "mouse_down",
            "x": 100,
            "y": 200
        })
    

def mouse_up(client):
    with client.create(kind="browser") as computer:
        computer.execute_action({
            "type": "mouse_up",
            "x": 100,
            "y": 200
        })

def key_down(client):
    with client.create(kind="browser") as computer:
        computer.execute_action({
            "type": "key_down",
            "key": "Shift"
        })

def key_up(client):
    with client.create(kind="browser") as computer:
        computer.execute_action({
            "type": "key_up",
            "key": "Shift"
        })