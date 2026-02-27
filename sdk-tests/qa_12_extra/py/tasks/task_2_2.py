from tzafon import Computer
from .utils import handle_batch_result

def batch_error_handling(client: Computer):
    with client.create(kind="browser") as computer:
        computer.set_viewport(1920, 1080)
        result = client.computers.execute_batch(computer.id, actions=[
            {"type": "go_to_url", "url": "https://wikipedia.org"},
            {"type": "wait", "ms": 2000},
            {"type": "click", "x": 900, "y": 500},
            {"type": "rype", "text": "Python programming"}, # Intentional error
            {"type": "wait", "ms": 2000},
            {"type": "keypress", "keys": ["enter"]},
            {"type": "wait", "ms": 3000},
            {"type": "screenshot"}
        ])

        handle_batch_result(computer, result)