#!/usr/bin/env python3
"""
Advanced Lightcone Agent with enhanced features:
- Structured logging
- Screenshot capture
- Task pause/resume
- Message injection
- Multiple execution modes
"""

import os
import sys
import json
import time
import logging
from pathlib import Path
from typing import Optional, List, Dict, Any
from datetime import datetime
from tzafon import Lightcone
from dotenv import load_dotenv


# Load environment variables from .env file
load_dotenv()

# Configure logging
Path("logs").mkdir(exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(
            f'logs/lightcone_agent_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'
        ),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)

DEFAULT_INSTRUCTIONS_FILE = "instructions/home_completions.md"


class AdvancedLightconeAgent:
    """
    Advanced Lightcone agent with comprehensive features for desktop automation
    """

    def __init__(
        self,
        instructions_file: str = DEFAULT_INSTRUCTIONS_FILE,
        save_screenshots: bool = False,
        screenshot_dir: str = "screenshots",
    ):
        """
        Initialize the advanced Lightcone agent

        Args:
            instructions_file: Path to the markdown file containing instructions
            save_screenshots: Whether to save screenshots during execution
            screenshot_dir: Directory to save screenshots
        """
        self.instructions_file = Path(instructions_file)
        self.client = Lightcone()
        self.save_screenshots = save_screenshots
        self.screenshot_dir = Path(screenshot_dir)
        self.current_task_id: Optional[str] = None
        self.event_history: List[Dict[str, Any]] = []
        self.expected_screenshot_path: Optional[Path] = None
        self.completion_message: Optional[str] = None
        self.results_dir = Path("results")
        self.results_dir.mkdir(exist_ok=True)

        # Derive expected screenshot path from instructions file
        self._set_expected_screenshot_path()

        if self.save_screenshots:
            self.screenshot_dir.mkdir(exist_ok=True)
            logger.info(f"Screenshots will be saved to: {self.screenshot_dir}")

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
            logger.info(f"Expected screenshot path: {self.expected_screenshot_path}")
            if self.expected_screenshot_path.exists():
                logger.info("✅ Expected screenshot found")
            else:
                logger.warning(
                    f"⚠️  Expected screenshot not found at: {self.expected_screenshot_path}"
                )

    def read_instructions(self) -> str:
        """
        Read and parse instructions from the markdown file

        Returns:
            Parsed instruction string ready for Northstar
        """
        if not self.instructions_file.exists():
            logger.error(f"Instructions file not found: {self.instructions_file}")
            raise FileNotFoundError(
                f"Instructions file not found: {self.instructions_file}"
            )

        logger.info(f"Reading instructions from: {self.instructions_file}")

        with open(self.instructions_file, "r") as f:
            content = f.read()

        # Parse the markdown content
        lines = content.strip().split("\n")
        instructions = []

        for line in lines:
            line = line.strip()
            if line and not line.startswith("#"):
                # Remove line numbers if present
                if "→" in line:
                    line = line.split("→", 1)[1].strip()
                instructions.append(line)

        instruction = " ".join(instructions)
        logger.info(f"Parsed instruction: {instruction}")

        # Append verification instruction if expected screenshot exists
        if self.expected_screenshot_path and self.expected_screenshot_path.exists():
            verification_instruction = (
                f" After completing the above task, open the file at {self.expected_screenshot_path} "
                f"and visually compare it to the current screen state. "
                f"Report whether the current screen matches the expected screenshot, "
                f"noting any significant differences if they don't match."
            )
            instruction += verification_instruction
            logger.info(
                f"✅ Added verification against: {self.expected_screenshot_path}"
            )

        return instruction

    def execute_with_streaming(
        self,
        instruction: Optional[str] = None,
        kind: str = "desktop",
        model: str = "tzafon.northstar-cua-fast",
        max_steps: int = 50,
        temperature: float = 0.2,
    ):
        """
        Execute a task with streaming and comprehensive event logging

        Args:
            instruction: Task instruction (if None, reads from file)
            kind: Type of environment ("desktop" or "browser")
            model: Model to use for execution
            max_steps: Maximum number of actions
            temperature: Model temperature for creativity
        """
        if instruction is None:
            instruction = self.read_instructions()

        logger.info("=" * 80)
        logger.info("Starting task execution with streaming")
        logger.info(f"Instruction: {instruction}")
        logger.info(f"Model: {model}")
        logger.info(f"Environment: {kind}")
        logger.info(f"Max steps: {max_steps}")
        logger.info(f"Temperature: {temperature}")
        logger.info("=" * 80)

        try:
            event_count = 0
            start_time = time.time()

            for event in self.client.agent.tasks.start_stream(
                instruction=instruction,
                kind=kind,
                model=model,
                max_steps=max_steps,
                temperature=temperature,
            ):
                event_count += 1
                self._process_and_log_event(event, event_count)
                if event.get("type") == "completed":
                    # Capture the completion message
                    self.completion_message = event.get("result", "")
                    break

            elapsed_time = time.time() - start_time
            logger.info(f"✅ Task completed in {elapsed_time:.2f} seconds")
            logger.info(f"📊 Total events processed: {event_count}")

            return {
                "status": "completed",
                "event_count": event_count,
                "elapsed_time": elapsed_time,
                "events": self.event_history,
            }

        except KeyboardInterrupt:
            logger.warning("Task interrupted by user")
            return {"status": "interrupted"}
        except Exception as e:
            logger.error(f"Error during task execution: {e}", exc_info=True)
            raise

    def execute_with_polling(
        self,
        instruction: Optional[str] = None,
        kind: str = "desktop",
        model: str = "tzafon.northstar-cua-fast",
        max_steps: int = 50,
        poll_interval: int = 2,
    ):
        """
        Execute a task asynchronously with status polling

        Args:
            instruction: Task instruction
            kind: Environment type
            model: Model to use
            max_steps: Maximum actions
            poll_interval: Seconds between status checks
        """
        if instruction is None:
            instruction = self.read_instructions()

        logger.info("Starting task execution with polling mode")
        logger.info(f"Instruction: {instruction}")

        try:
            # Start the task
            task = self.client.agent.tasks.start(
                instruction=instruction,
                kind=kind,
                model=model,
                max_steps=max_steps,
            )

            self.current_task_id = task.task_id
            logger.info(f"✅ Task started with ID: {task.task_id}")

            # Poll for completion
            poll_count = 0
            start_time = time.time()

            while True:
                status = self.client.agent.tasks.retrieve_status(task.task_id)
                poll_count += 1

                logger.info(f"[Poll {poll_count}] Status: {status.status}")

                if status.status in ("completed", "failed", "cancelled"):
                    elapsed_time = time.time() - start_time
                    logger.info(f"🏁 Task finished with status: {status.status}")
                    logger.info(f"⏱️  Elapsed time: {elapsed_time:.2f} seconds")

                    if hasattr(status, "exit_code"):
                        logger.info(f"Exit code: {status.exit_code}")

                    return {
                        "status": status.status,
                        "task_id": task.task_id,
                        "polls": poll_count,
                        "elapsed_time": elapsed_time,
                    }

                time.sleep(poll_interval)

        except KeyboardInterrupt:
            logger.warning("Task monitoring interrupted by user")
            return {"status": "interrupted", "task_id": self.current_task_id}
        except Exception as e:
            logger.error(f"Error during task execution: {e}", exc_info=True)
            raise

    def pause_task(self, task_id: Optional[str] = None):
        """Pause a running task"""
        tid = task_id or self.current_task_id
        if not tid:
            logger.error("No task ID available to pause")
            return

        logger.info(f"Pausing task: {tid}")
        self.client.agent.tasks.pause(tid)
        logger.info("✅ Task paused")

    def resume_task(self, task_id: Optional[str] = None):
        """Resume a paused task"""
        tid = task_id or self.current_task_id
        if not tid:
            logger.error("No task ID available to resume")
            return

        logger.info(f"Resuming task: {tid}")
        self.client.agent.tasks.resume(tid)
        logger.info("✅ Task resumed")

    def inject_message(self, message: str, task_id: Optional[str] = None):
        """
        Inject a message into a running task to redirect it

        Args:
            message: Message to inject
            task_id: Task ID (uses current if not provided)
        """
        tid = task_id or self.current_task_id
        if not tid:
            logger.error("No task ID available for message injection")
            return

        logger.info(f"Injecting message into task {tid}: {message}")
        self.client.agent.tasks.inject_message(tid, message=message)
        logger.info("✅ Message injected successfully")

    def _process_and_log_event(self, event, event_number: int):
        """
        Process and log a single event with comprehensive details

        Args:
            event: Event object from Lightcone
            event_number: Sequential event number
        """
        event_data = {
            "event_number": event_number,
            "timestamp": datetime.now().isoformat(),
            "raw_event": str(event),
        }

        # Log to console
        logger.info(f"\n{'='*60}")
        logger.info(f"Event #{event_number}")
        logger.info(f"{'='*60}")

        try:
            # Try to extract structured information
            if hasattr(event, "__dict__"):
                event_dict = event.__dict__
                event_data.update(event_dict)

                for key, value in event_dict.items():
                    logger.info(f"  {key}: {value}")

            else:
                logger.info(f"  Event: {event}")

        except Exception as e:
            logger.warning(f"Could not parse event structure: {e}")
            logger.info(f"  Raw event: {event}")

        # Store in history
        self.event_history.append(event_data)

    def save_event_history(self, filename: Optional[str] = None):
        """
        Save event history to a JSON file

        Args:
            filename: Output filename (auto-generated if not provided)
        """
        if not filename:
            filename = f"event_history_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        filepath = Path(filename)
        logger.info(f"Saving event history to: {filepath}")

        with open(filepath, "w") as f:
            json.dump(self.event_history, f, indent=2, default=str)

        logger.info(f"✅ Event history saved ({len(self.event_history)} events)")


def main():
    """Main entry point with CLI interface"""
    import argparse

    parser = argparse.ArgumentParser(
        description="Advanced Lightcone Agent for desktop automation"
    )
    parser.add_argument(
        "--file",
        default=DEFAULT_INSTRUCTIONS_FILE,
        help=f"Instructions file (default: {DEFAULT_INSTRUCTIONS_FILE})",
    )
    parser.add_argument(
        "--mode",
        choices=["stream", "poll"],
        default="stream",
        help="Execution mode (default: stream)",
    )
    parser.add_argument(
        "--max-steps", type=int, default=50, help="Maximum steps (default: 50)"
    )
    parser.add_argument(
        "--kind",
        choices=["desktop", "browser"],
        default="desktop",
        help="Environment type (default: desktop)",
    )
    parser.add_argument(
        "--save-screenshots",
        action="store_true",
        help="Save screenshots during execution",
    )
    parser.add_argument(
        "--save-events", action="store_true", help="Save event history to JSON file"
    )

    args = parser.parse_args()

    # Check API key
    if not os.getenv("TZAFON_API_KEY"):
        logger.error("TZAFON_API_KEY environment variable not set")
        sys.exit(1)

    # Initialize agent
    agent = AdvancedLightconeAgent(
        instructions_file=args.file, save_screenshots=args.save_screenshots
    )

    # Execute based on mode
    if args.mode == "stream":
        result = agent.execute_with_streaming(kind=args.kind, max_steps=args.max_steps)
    else:
        result = agent.execute_with_polling(kind=args.kind, max_steps=args.max_steps)

    # Save event history if requested
    if args.save_events:
        agent.save_event_history()

    logger.info("✨ Agent execution completed!")
    # logger.info(f"Result: {result}")


if __name__ == "__main__":
    main()
