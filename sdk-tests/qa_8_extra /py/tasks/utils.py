def handle_screenshot_result(computer, result):
    if result.status.lower() == "success":
        url = computer.get_screenshot_url(result)
        print(f"Screenshot: {url}")
    else:
        print("-" * 20)
        print("Screenshot failed")
        print("Computer ID: ", computer.id)
        print("Status:", result.status)
        print("Error Message:", result.error_message)
        print("Timestamp:", result.timestamp)
        print("-" * 20)

def handle_batch_result(computer, result):
    result_list = result.get("results", [])
    print("-" * 20)
    print("Batch Execution Result: ", result.get("executed"), " out of ", len(result_list), " actions")
    print("-" * 20)
    for action_result in result_list:
        if action_result.get("status").lower() == "success":
            print(action_result)
        else:
            print("-" * 20)
            print("Action failed")
            print("Computer ID: ", computer.id)
            print("Status:", action_result.get("status"))
            print("Error Message:", action_result.get("error_message"))
            print("Timestamp:", action_result.get("timestamp"))
            print("-" * 20)