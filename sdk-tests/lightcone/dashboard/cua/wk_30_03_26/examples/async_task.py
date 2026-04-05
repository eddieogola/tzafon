#!/usr/bin/env python3
"""
Example: Execute a task asynchronously and poll for status
"""

import time
from tzafon import Lightcone


def main():
    client = Lightcone()

    instruction = "Open the terminal and run 'uname -a' to check system information"

    print("🚀 Starting async task...")

    # Start the task
    task = client.agent.tasks.start(
        instruction=instruction,
        kind="desktop",
        model="tzafon.northstar-cua-fast",
        max_steps=20,
    )

    print(f"✅ Task started: {task.task_id}")
    print("📡 Polling for status...\n")

    # Poll for completion
    poll_count = 0
    while True:
        status = client.agent.tasks.retrieve_status(task.task_id)
        poll_count += 1

        print(f"[{poll_count}] Status: {status.status}")

        if status.status in ("completed", "failed"):
            print(f"\n🏁 Final status: {status.status}")
            if hasattr(status, 'exit_code'):
                print(f"Exit code: {status.exit_code}")
            break

        time.sleep(2)


if __name__ == "__main__":
    main()
