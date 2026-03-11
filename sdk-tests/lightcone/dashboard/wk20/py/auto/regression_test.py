from tzafon import Computer


def check_create_method(client: Computer):
    with client.create(kind="browser") as computer:
        computer.navigate("https://example.com")
        computer.wait(2)
        result = computer.screenshot()
        print(f"Success! Screenshot: {computer.get_screenshot_url(result)}")


def check_execute_action_method(client: Computer):
    with client.create(kind="browser") as computer:
        computer.navigate("https://example.com")
        computer.wait(2)

        # Use direct API for execute_action
        client.computers.execute_action(
            computer.id, action={"type": "key_down", "key": "Shift"}
        )
        client.computers.execute_action(
            computer.id, action={"type": "key_up", "key": "Shift"}
        )
        result = computer.screenshot()
        print(f"Success! Screenshot: {computer.get_screenshot_url(result)}")


def check_modifier_keys_shift(client: Computer):
    with client.create(
        kind="browser", display={"width": 1920, "height": 1080, "scale": 1.0}
    ) as computer:
        computer.navigate("https://www.keyboardtester.com/")
        computer.wait(3)
        computer.click(800, 380)
        computer.wait(3)
        client.computers.execute_action(
            computer.id, action={"type": "key_down", "key": "Shift"}
        )
        result = computer.screenshot()
        print(f"Shift DOWN: {computer.get_screenshot_url(result)}")

        # Release
        client.computers.execute_action(
            computer.id, action={"type": "key_up", "key": "Shift"}
        )
        result = computer.screenshot()
        print(f"Shift UP: {computer.get_screenshot_url(result)}")


def check_modifier_keys_control(client: Computer):
    with client.create(
        kind="browser", display={"width": 1920, "height": 1080, "scale": 1.0}
    ) as computer:
        computer.navigate("https://www.keyboardtester.com/")
        computer.wait(3)
        computer.click(800, 380)
        computer.wait(3)
        client.computers.execute_action(
            computer.id, action={"type": "key_down", "key": "Control"}
        )
        result = computer.screenshot()
        print(f"Control DOWN: {computer.get_screenshot_url(result)}")

        # Release
        client.computers.execute_action(
            computer.id, action={"type": "key_up", "key": "Control"}
        )
        result = computer.screenshot()
        print(f"Control UP: {computer.get_screenshot_url(result)}")


def check_modifier_keys_alt(client: Computer):
    with client.create(
        kind="browser", display={"width": 1920, "height": 1080, "scale": 1.0}
    ) as computer:
        computer.navigate("https://www.keyboardtester.com/")
        computer.wait(3)
        computer.click(800, 380)
        computer.wait(3)
        client.computers.execute_action(
            computer.id, action={"type": "key_down", "key": "Alt"}
        )
        result = computer.screenshot()
        print(f"Alt DOWN: {computer.get_screenshot_url(result)}")

        # Release
        client.computers.execute_action(
            computer.id, action={"type": "key_up", "key": "Alt"}
        )
        result = computer.screenshot()
        print(f"Alt UP: {computer.get_screenshot_url(result)}")


def check_mouse_down_up(client: Computer):
    with client.create(
        kind="browser", display={"width": 1920, "height": 1080, "scale": 1.0}
    ) as computer:
        computer.navigate("https://kleki.com")
        computer.wait(4)

        # Draw a line using mouse_down -> mouse_up
        client.computers.execute_action(
            computer.id, action={"type": "mouse_down", "x": 400, "y": 400}
        )
        computer.wait(0.3)
        client.computers.execute_action(
            computer.id, action={"type": "mouse_up", "x": 600, "y": 500}
        )

        result = computer.screenshot()
        print(f"Drawing result: {computer.get_screenshot_url(result)}")
