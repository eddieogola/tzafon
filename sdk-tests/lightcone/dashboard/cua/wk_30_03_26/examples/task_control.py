#!/usr/bin/env python3
"""
Example: Task control - pause, resume, and message injection
"""

import time
from tzafon import Lightcone


def main():
    client = Lightcone()

    instruction = "Research the latest developments in AI and large language models"

    print("🚀 Starting task...")

    # Start the task
    task = client.agent.tasks.start(
        instruction=instruction,
        kind="desktop",
        max_steps=50,
    )

    task_id = task.task_id
    print(f"✅ Task ID: {task_id}\n")

    # Let it run for a bit
    print("⏳ Letting task run for 10 seconds...")
    time.sleep(10)

    # Inject a new message to redirect the task
    print("\n💬 Injecting message to redirect focus...")
    client.agent.tasks.inject_message(
        task_id,
        message="Actually, focus specifically on Claude and Anthropic's models"
    )

    # Let it run more
    print("⏳ Running for another 5 seconds...")
    time.sleep(5)

    # Pause the task
    print("\n⏸️  Pausing task...")
    client.agent.tasks.pause(task_id)
    print("✅ Task paused")

    # Wait a bit
    print("⏳ Waiting 3 seconds...")
    time.sleep(3)

    # Resume the task
    print("\n▶️  Resuming task...")
    client.agent.tasks.resume(task_id)
    print("✅ Task resumed")

    # Monitor to completion
    print("\n📡 Monitoring until completion...\n")
    while True:
        status = client.agent.tasks.retrieve_status(task_id)
        print(f"Status: {status.status}")

        if status.status in ("completed", "failed", "cancelled"):
            print(f"\n🏁 Task finished: {status.status}")
            break

        time.sleep(2)


if __name__ == "__main__":
    main()
