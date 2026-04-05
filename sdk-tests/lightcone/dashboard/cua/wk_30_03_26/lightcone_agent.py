#!/usr/bin/env python3
"""
Lightcone Agent - Reads instructions from home.md and executes them on desktop
"""

import os
import sys
from pathlib import Path
from typing import Optional
from tzafon import Lightcone
from dotenv import load_dotenv


# Load environment variables from .env file
load_dotenv()


class LightconeAgent:
    """Agent that reads instructions from a markdown file and executes them using Lightcone/Northstar"""

    def __init__(self, instructions_file: str = "home.md"):
        """
        Initialize the Lightcone agent

        Args:
            instructions_file: Path to the markdown file containing instructions
        """
        self.instructions_file = Path(instructions_file)
        self.client = Lightcone()

    def read_instructions(self) -> str:
        """
        Read and parse instructions from the markdown file

        Returns:
            Parsed instruction string ready for Northstar
        """
        if not self.instructions_file.exists():
            raise FileNotFoundError(
                f"Instructions file not found: {self.instructions_file}"
            )

        with open(self.instructions_file, "r") as f:
            content = f.read()

        # Parse the markdown content and create a clear instruction
        lines = content.strip().split("\n")

        # Filter out empty lines and format into a clear instruction
        instructions = []
        for line in lines:
            line = line.strip()
            if line and not line.startswith("#"):
                # Remove line numbers if present (e.g., "1→" becomes just the text)
                if "→" in line:
                    line = line.split("→", 1)[1].strip()
                instructions.append(line)

        # Combine into a single instruction string
        instruction = " ".join(instructions)
        return instruction

    def execute_task_streaming(
        self,
        instruction: Optional[str] = None,
        kind: str = "desktop",
        model: str = "tzafon.northstar-cua-fast",
        max_steps: int = 50,
    ):
        """
        Execute a task with streaming (real-time event monitoring)

        Args:
            instruction: Task instruction (if None, reads from file)
            kind: Type of environment ("desktop" or "browser")
            model: Model to use for execution
            max_steps: Maximum number of actions to take
        """
        if instruction is None:
            instruction = self.read_instructions()

        print(f"📋 Instruction: {instruction}\n")
        print(f"🚀 Starting task execution with {model}...")
        print(f"📊 Max steps: {max_steps}")
        print(f"💻 Environment: {kind}")
        print("-" * 80)

        try:
            event_count = 0
            for event in self.client.agent.tasks.start_stream(
                instruction=instruction,
                kind=kind,
                model=model,
                max_steps=max_steps,
            ):
                event_count += 1
                self._process_event(event, event_count)

        except KeyboardInterrupt:
            print("\n⚠️  Task interrupted by user")
            sys.exit(0)
        except Exception as e:
            print(f"\n❌ Error during task execution: {e}")
            raise

    def _process_event(self, event, event_number: int):
        """
        Process and display a single event from the stream

        Args:
            event: Event object from Lightcone
            event_number: Sequential event number
        """
        print(f"\n[Event {event_number}]")

        # Check if event has a type attribute
        if hasattr(event, "type"):
            event_type = event.type
            print(f"  Type: {event_type}")

            # Handle different event types
            if event_type == "action":
                if hasattr(event, "action"):
                    action = event.action
                    print(f"  🎯 Action: {action.get('type', 'unknown')}")
                    if "details" in action:
                        print(f"  📝 Details: {action['details']}")

            elif event_type == "thinking":
                if hasattr(event, "thinking"):
                    print(f"  💬 Message: {event.thinking}")

            elif event_type == "status":
                if hasattr(event, "status"):
                    status = event.status
                    print(f"  ⚡ Status: {status}")

            elif event_type == "completion":
                if hasattr(event, "exit_code"):
                    print(f"  ✅ Completed with exit code: {event.exit_code}")

            elif event_type == "error":
                if hasattr(event, "error"):
                    print(f"  ❌ Error: {event.error}")
            else:
                raise ValueError(f"Unknown event type: {event_type}")

        # Fallback: print the entire event if structure is unknown
        else:
            print(f"  {event}")

    def execute_task_async(
        self,
        instruction: Optional[str] = None,
        kind: str = "desktop",
        model: str = "tzafon.northstar-cua-fast",
        max_steps: int = 50,
    ):
        """
        Execute a task asynchronously (fire and poll)

        Args:
            instruction: Task instruction (if None, reads from file)
            kind: Type of environment ("desktop" or "browser")
            model: Model to use for execution
            max_steps: Maximum number of actions to take
        """
        import time

        if instruction is None:
            instruction = self.read_instructions()

        print(f"📋 Instruction: {instruction}\n")
        print(f"🚀 Starting task execution with {model}...")
        print(f"📊 Max steps: {max_steps}")
        print(f"💻 Environment: {kind}")
        print("-" * 80)

        try:
            # Start the task
            task = self.client.agent.tasks.start(
                instruction=instruction,
                kind=kind,
                model=model,
                max_steps=max_steps,
            )

            print(f"✅ Task started: {task.task_id}")
            print("📡 Polling for status updates...")

            # Poll for completion
            poll_count = 0
            while True:
                status = self.client.agent.tasks.retrieve_status(task.task_id)
                poll_count += 1

                print(f"\n[Poll {poll_count}] Status: {status.status}")

                if status.status in ("completed", "failed", "cancelled"):
                    print(f"🏁 Task finished with status: {status.status}")
                    if hasattr(status, "exit_code"):
                        print(f"   Exit code: {status.exit_code}")
                    break

                time.sleep(2)

        except KeyboardInterrupt:
            print("\n⚠️  Task monitoring interrupted by user")
            sys.exit(0)
        except Exception as e:
            print(f"\n❌ Error during task execution: {e}")
            raise


def main():
    """Main entry point"""
    print("=" * 80)
    print("🤖 Lightcone Agent - Desktop Automation")
    print("=" * 80)

    # Check if API key is set
    if not os.getenv("TZAFON_API_KEY"):
        print("❌ Error: TZAFON_API_KEY environment variable not set")
        print("   Please set it using: export TZAFON_API_KEY=your_api_key")
        sys.exit(1)

    # Initialize agent
    agent = LightconeAgent("home_completions.md")

    # Execute task with streaming (recommended for real-time feedback)
    print("\n🔴 Executing task with STREAMING mode...\n")
    agent.execute_task_streaming()

    print("\n" + "=" * 80)
    print("✨ Task execution completed!")
    print("=" * 80)


if __name__ == "__main__":
    main()
