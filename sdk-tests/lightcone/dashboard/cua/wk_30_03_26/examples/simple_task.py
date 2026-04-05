#!/usr/bin/env python3
"""
Simple example: Execute a single task with streaming
"""

from tzafon import Lightcone


def main():
    # Initialize the Lightcone client
    client = Lightcone()

    # Define a simple task
    instruction = """
    Open Firefox, go to https://lightcone.ai/dashboard,
    login with email edwineogola@gmail.com,
    and click on the Completions card
    """

    print("🚀 Starting task execution...")
    print(f"📋 Task: {instruction}\n")

    # Execute with streaming
    for event in client.agent.tasks.start_stream(
        instruction=instruction,
        kind="desktop",
        model="tzafon.northstar-cua-fast",
        max_steps=30,
    ):
        print(f"Event: {event}")

    print("\n✅ Task completed!")


if __name__ == "__main__":
    main()
