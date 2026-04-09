#!/usr/bin/env python3
"""
Lightcone Agent - Reads instructions from home.md and executes them on desktop
"""

import os
import sys
from pathlib import Path
from typing import Optional
from datetime import datetime
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
        self.expected_screenshot_path: Optional[Path] = None
        self.completion_message: Optional[str] = None
        self.results_dir = Path("results")
        self.results_dir.mkdir(exist_ok=True)

        # Derive expected screenshot path from instructions file
        self._set_expected_screenshot_path()

    def _set_expected_screenshot_path(self):
        """
        Derive the expected screenshot path from the instructions file
        Pattern: instructions/home_completions.md -> expected/home_completions.png
        """
        if self.instructions_file:
            # Get the base name without extension
            base_name = self.instructions_file.stem
            # Construct expected screenshot path
            self.expected_screenshot_path = (
                self.instructions_file.parent.parent / "expected" / f"{base_name}.png"
            )
            print(f"Expected screenshot: {self.expected_screenshot_path}")
            if self.expected_screenshot_path.exists():
                print("✅ Expected screenshot found")
            else:
                print(
                    f"⚠️  Expected screenshot not found at: {self.expected_screenshot_path}"
                )

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

        # Append verification instruction if expected screenshot exists
        if self.expected_screenshot_path and self.expected_screenshot_path.exists():
            verification_instruction = (
                f" After completing the above task, provide a detailed summary in the following format:\n"
                f"**Task Completion Summary:**\n"
                f"List each step you completed with checkmarks\n\n"
                f"**Screenshot Comparison:**\n"
                f"Note: The expected screenshot is at {self.expected_screenshot_path.name}. "
                f"If you cannot access this file, describe the current screen state in detail including: "
                f"page title, main sections visible, selected options, and any notable UI elements."
            )
            instruction += verification_instruction
            print(f"✅ Added verification reporting for: {self.expected_screenshot_path}")

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
                if event.get("type") == "completed":
                    self.completion_message = event.get("result", "")
                    print(f"  ✅ {self.completion_message}")
                    break

            # Save verification summary
            summary_path = self.save_verification_summary()
            print(f"\n📄 Summary saved to: {summary_path}")

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
        if event.get("type"):
            event_type = event.get("type")
            print(f"  Type: {event_type}")

            # Handle different event types
            if event_type == "started":
                if event.get("computer_id"):
                    print(
                        f"  🚀 Task started with computer ID: {event.get('computer_id')}"
                    )

            elif event_type == "thinking":
                if event.get("content"):
                    print(f"  💬 Message: {event.get('content')}")

            elif event_type == "progress_update":
                if event.get("state"):
                    status = event.get("state")
                    print(f"  ⚡ Status: {status}")

            elif event_type == "screenshot":
                if event.get("image"):
                    print(f"  🖼 Screenshot URL: {event.get('image')}")

            elif event_type == "executed":
                if event.get("action"):
                    print(f"  🖥 Executed action: {event.get('action')}")

            elif event_type == "error":
                if event.get("error"):
                    print(f"  ❌ Error: {event.get('error')}")
            elif event_type == "completed":
                pass
            else:
                raise ValueError(f"Unknown event type: {event_type}")
        else:
            raise ValueError(f"No type in event: {event}")

    def save_verification_summary(self) -> Path:
        """
        Save a markdown summary of the task execution and verification results

        Returns:
            Path to the saved summary file
        """
        # Generate filename from instructions file
        if self.instructions_file:
            base_name = self.instructions_file.stem
            summary_filename = f"{base_name}_summary.md"
        else:
            summary_filename = f"task_summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"

        summary_path = self.results_dir / summary_filename

        # Build the markdown content
        markdown_content = f"""# Task Execution Summary

**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Instructions File:** {self.instructions_file}
**Expected Screenshot:** {self.expected_screenshot_path if self.expected_screenshot_path else 'N/A'}

---

## Completion Message

{self.completion_message if self.completion_message else 'No completion message captured'}

---

## Notes

"""

        # Try to parse the completion message for structured information
        if self.completion_message:
            # Check if there's a task completion summary
            if "**Task Completion Summary:**" in self.completion_message:
                markdown_content += "\n### Task Steps Completed\n\n"
                markdown_content += "The agent reported completing the following steps:\n\n"
                # Extract the content after the summary marker
                parts = self.completion_message.split("**Task Completion Summary:**")
                if len(parts) > 1:
                    summary_part = parts[1].split("**Screenshot Comparison:**")[0] if "**Screenshot Comparison:**" in parts[1] else parts[1]
                    markdown_content += summary_part.strip() + "\n\n"

            # Check if there's a screenshot comparison section
            if "**Screenshot Comparison:**" in self.completion_message:
                markdown_content += "\n### Screenshot Verification\n\n"
                parts = self.completion_message.split("**Screenshot Comparison:**")
                if len(parts) > 1:
                    comparison_part = parts[1].strip()
                    markdown_content += comparison_part + "\n\n"

                    # Determine verification status
                    if "does not exist" in comparison_part.lower() or "cannot" in comparison_part.lower():
                        markdown_content += "\n**Status:** ⚠️ Could not verify - Expected screenshot not accessible to agent\n\n"
                    elif "match" in comparison_part.lower() and "do not match" not in comparison_part.lower():
                        markdown_content += "\n**Status:** ✅ Verification PASSED\n\n"
                    else:
                        markdown_content += "\n**Status:** ❌ Verification FAILED or Inconclusive\n\n"

        markdown_content += "\n---\n\n*Generated by LightconeAgent*\n"

        # Save the file
        with open(summary_path, "w") as f:
            f.write(markdown_content)

        print(f"✅ Verification summary saved to: {summary_path}")
        return summary_path

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
    agent = LightconeAgent("instructions/home_completions.md")

    # Execute task with streaming (recommended for real-time feedback)
    print("\n🔴 Executing task with STREAMING mode...\n")
    agent.execute_task_streaming()

    print("\n" + "=" * 80)
    print("✨ Task execution completed!")
    print("=" * 80)


if __name__ == "__main__":
    main()
