from tzafon import Computer
from time import sleep

def keep_alive(client: Computer):
    computer = client.create(kind="browser")
    computer.set_viewport(1920, 1080)
    while True:
        result = client.computers.keep_alive(computer.id)
        print(computer.id)
        print(result)
        sleep(10)
       
    