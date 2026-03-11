from tzafon import Computer


def check_batch_actions(client: Computer):
    with client.create(kind="browser") as computer:
        result = client.computers.execute_batch(
            computer.id,
            actions=[
                {"type": "go_to_url", "url": "https://wikipedia.org"},
                {"type": "wait", "ms": 2000},
                {"type": "click", "x": 540, "y": 280},
                {"type": "type", "text": "Python programming"},
                {"type": "keypress", "keys": ["Enter"]},
                {"type": "wait", "ms": 2000},
                {"type": "screenshot"},
            ],
        )
    print(result)


def check_batch_actions_stops_on_first_error(client: Computer):
    with client.create(kind="browser") as computer:
        result = client.computers.execute_batch(
            computer.id,
            actions=[
                {"type": "go_to_url", "url": "https://wikipedia.org"},
                {"type": "wait", "ms": 2000},
                {"type": "clik", "x": 540, "y": 280},  # intentional error
                {"type": "type", "text": "Python programming"},
                {"type": "keypress", "keys": ["Enter"]},
                {"type": "wait", "ms": 2000},
                {"type": "screenshot"},
            ],
        )
    print(result)
