from tzafon import Computer

client = Computer(api_key="sk_live_7qWbfmBCwCIfkUH5qcIHfuACA3qR0H")

"""
GITHUB AUTOMATION
"""
# with client.create(kind="browser") as computer:
#     computer.set_viewport(1920, 1080)

#     computer.navigate("https://www.github.com")
#     computer.wait(1)
#     computer.click(1526, 34)
#     computer.wait(1)
#     computer.type("o")
#     computer.type("r")
#     computer.type("g")
#     computer.type(":")
#     computer.type("t")
#     computer.type("z")
#     computer.type("a")
#     computer.type("f")
#     computer.type("o")
#     computer.type("n")
#     computer.hotkey("Enter")
    
#     result = computer.screenshot()
#     url = computer.get_screenshot_url(result)
#     if result.status.lower() == "success":
#         url = computer.get_screenshot_url(result)
#         print(f"Screenshot: {url}")
#     else:
#         print("-"*20)
#         print("Screenshot failed")
#         print("Status:", result.status)
#         print("Error Message:", result.error_message)
#         print("Timestamp:", result.timestamp)
#         print("-"*20)



from tzafon import Computer

client = Computer(api_key="sk_live_7qWbfmBCwCIfkUH5qcIHfuACA3qR0H")
with client.create(kind="browser") as computer:
    computer.set_viewport(1920, 1080)

    computer.navigate("http://www.faqs.org/rfcs/rfc1918.html")
    computer.wait(1)
    computer.navigate("https://www.tldraw.com/")
    computer.wait(1)
    computer.click(590, 285)
    computer.wait(1)
    computer.hotkey("Meta", "c")
    computer.click(753, 654)
    computer.wait(1)
    computer.hotkey("Meta", "v")

    result = computer.screenshot()
    url = computer.get_screenshot_url(result)
    if result.status.lower() == "success":
        url = computer.get_screenshot_url(result)
        print(f"Screenshot: {url}")
    else:
        print("-"*20)
        print("Screenshot failed")
        print("Status:", result.status)
        print("Error Message:", result.error_message)
        print("Timestamp:", result.timestamp)
        print("-"*20)