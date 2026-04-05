#!/usr/bin/env python3
"""
Example: Browser automation using kind="browser"
"""

from tzafon import Lightcone


def main():
    client = Lightcone()

    # Browser-specific task
    instruction = """
    Go to https://docs.lightcone.ai,
    navigate to the Quickstart guide,
    and take a screenshot of the installation instructions
    """

    print("🌐 Starting browser automation task...")
    print(f"📋 Task: {instruction}\n")

    # Execute with browser environment
    for event in client.agent.tasks.start_stream(
        instruction=instruction,
        kind="browser",  # Use browser instead of desktop
        model="tzafon.northstar-cua-fast",
        max_steps=25,
    ):
        print(f"Event: {event}")

    print("\n✅ Browser task completed!")


if __name__ == "__main__":
    main()
