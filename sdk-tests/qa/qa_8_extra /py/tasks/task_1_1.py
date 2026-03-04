from tzafon import Computer
from .utils import handle_screenshot_result

def shift_click_selection(client: Computer):
    with client.create(kind="browser") as computer:

        computer.set_viewport(1920, 1080)
        computer.navigate("https://www.tldraw.com/")
        computer.wait(1)
        computer.type("d") # Switches Tldraw to drawing mode.
        computer.wait(1)

        #
        # The commented code below throws an AttributeError 'ComputerSession' object has no attribute 'execute_action'
        #
        # computer.execute_action({"type": "key_down", "key": "Shift"})
        # computer.click(430, 440)
        # computer.click(700, 520)
        # computer.execute_action({"type": "key_up", "key": "Shift"})

        client.computers.execute_action(id=computer.id, action={"type": "key_down", "key": "Shift"})
        computer.click(430, 440)
        computer.click(700, 520)
        client.computers.execute_action(id=computer.id, action={"type": "key_up", "key": "Shift"})

        result = computer.screenshot()
        handle_screenshot_result(computer, result)

def control_click_selection(client: Computer):
    with client.create(kind="browser") as computer:

        computer.set_viewport(1920, 1080)
        computer.navigate("https://www.tldraw.com/f/6O_RQhA2cilo3Yho9kr9X?d=v-109.-141.1684.1152.page")
        computer.wait(1)

        client.computers.execute_action(id=computer.id, action={"type": "key_down", "key": "Control"})
        computer.click(880, 700)
        client.computers.execute_action(id=computer.id, action={"type": "key_up", "key": "Control"})

        result = computer.screenshot()
        handle_screenshot_result(computer, result)

def alt_click_selection(client: Computer):
    with client.create(kind="browser") as computer:

        computer.set_viewport(1920, 1080)
        computer.navigate("https://www.tldraw.com/f/6O_RQhA2cilo3Yho9kr9X?d=v-109.-141.1684.1152.page")
        computer.wait(1)

        client.computers.execute_action(id=computer.id, action={"type": "key_down", "key": "Alt"})
        computer.click(880, 700)
        computer.click(1150, 700)
        client.computers.execute_action(id=computer.id, action={"type": "key_up", "key": "Alt"})

        result = computer.screenshot()
        handle_screenshot_result(computer, result)


def check_key_up_releases_key(client: Computer):
    with client.create(kind="browser") as computer:

        computer.set_viewport(1920, 1080)
        computer.navigate("https://keyboardsimulator.xyz/")
        computer.wait(1)

        client.computers.execute_action(id=computer.id, action={"type": "key_down", "key": "Shift"})
        # client.computers.execute_action(id=computer.id, action={"type": "key_up", "key": "Shift"})

        result = computer.screenshot()
        handle_screenshot_result(computer, result)