from .utils import handle_screenshot_result


def draw_line(client):
    with client.create({"kind": "browser"}) as computer:
        computer.set_viewport(1920, 1080)
        computer.navigate("https://tldraw.com/")
        computer.wait(1)

        computer.type("d")
        client.computers.execute_action(id=computer.id, action={"type": "mouse_down", "x": 1000, "y": 440})
        client.computers.execute_action(id=computer.id, action={"type": "mouse_up", "x": 700, "y": 520})

        result = computer.screenshot()
        handle_screenshot_result(computer, result)