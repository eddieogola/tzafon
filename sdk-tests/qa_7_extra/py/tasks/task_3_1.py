from tzafon import Computer


# Write a script that:
# Creates a session
# Waits 30+ seconds without actions
# Calls keepAlive() / keep_alive()
# Performs an action to verify session is still active


def keep_alive(client: Computer):
    with client.create(kind="browser") as computer:
        computer.set_viewport(1920, 1080)
        result = client.computers.keep_alive(computer.id)
        print(result)
       
    