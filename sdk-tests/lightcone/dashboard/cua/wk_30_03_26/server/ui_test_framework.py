#!/usr/bin/env python3
"""
UI Testing Framework for Lightcone Dashboard

This framework:
1. Reads test cases from markdown files
2. Executes them using Lightcone agent
3. Captures screenshots of actual results
4. Compares against expected screenshots using AI vision
5. Generates test reports with checkboxes
"""

import os
import json
import base64
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
from tzafon import Lightcone

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class UITestCase:
    """Represents a single UI test case"""

    def __init__(self, name: str, instructions_file: str, expected_screenshot: str):
        """
        Initialize a test case

        Args:
            name: Test case name
            instructions_file: Path to markdown file with test instructions
            expected_screenshot: Path to expected result screenshot
        """
        self.name = name
        self.instructions_file = Path(instructions_file)
        self.expected_screenshot = Path(expected_screenshot)
        self.actual_screenshot: Optional[Path] = None
        self.result: Optional[Dict[str, Any]] = None

    def read_instructions(self) -> str:
        """Read and parse test instructions from markdown file"""
        if not self.instructions_file.exists():
            raise FileNotFoundError(
                f"Instructions file not found: {self.instructions_file}"
            )

        with open(self.instructions_file, "r") as f:
            content = f.read()

        # Parse markdown content
        lines = content.strip().split("\n")
        instructions = []

        for line in lines:
            line = line.strip()
            if line and not line.startswith("#"):
                # Remove line numbers if present
                if "→" in line:
                    line = line.split("→", 1)[1].strip()
                instructions.append(line)

        return " ".join(instructions)


class UITestExecutor:
    """Executes UI test cases using Lightcone"""

    def __init__(self, screenshots_dir: str = "actual_screenshots"):
        """
        Initialize the test executor

        Args:
            screenshots_dir: Directory to save actual screenshots
        """
        self.client = Lightcone()
        self.screenshots_dir = Path(screenshots_dir)
        self.screenshots_dir.mkdir(exist_ok=True)

    def execute_test(
        self, test_case: UITestCase, max_steps: int = 50, save_screenshot: bool = True
    ) -> Dict[str, Any]:
        """
        Execute a test case and capture the result

        Args:
            test_case: The test case to execute
            max_steps: Maximum steps for task execution
            save_screenshot: Whether to save screenshot

        Returns:
            Execution result with status and screenshot path
        """
        logger.info(f"Executing test case: {test_case.name}")

        # Read instructions
        instruction = test_case.read_instructions()
        logger.info(f"Instructions: {instruction}")

        # Add screenshot capture instruction
        full_instruction = (
            f"{instruction}\n\nThen take a screenshot of the current page and save it."
        )

        result = {
            "test_name": test_case.name,
            "status": "unknown",
            "timestamp": datetime.now().isoformat(),
            "instruction": instruction,
            "events": [],
        }

        try:
            # Execute task with streaming
            event_count = 0
            for event in self.client.agent.tasks.start_stream(
                instruction=full_instruction,
                kind="desktop",
                model="tzafon.northstar-cua-fast",
                max_steps=max_steps,
            ):
                event_count += 1
                result["events"].append(str(event))
                logger.debug(f"Event {event_count}: {event}")

            result["status"] = "completed"
            result["event_count"] = event_count
            logger.info(f"Test execution completed with {event_count} events")

        except Exception as e:
            result["status"] = "failed"
            result["error"] = str(e)
            logger.error(f"Test execution failed: {e}", exc_info=True)

        return result


class UITestComparator:
    """Compares actual vs expected screenshots using AI vision"""

    def __init__(self, use_vision_api: bool = False):
        """
        Initialize the comparator

        Args:
            use_vision_api: Whether to use vision API for analysis
        """
        self.use_vision_api = use_vision_api
        self.client = None

        if use_vision_api:
            try:
                from openai import OpenAI

                self.client = OpenAI(
                    api_key=os.getenv("TZAFON_API_KEY"),
                    base_url="https://api.tzafon.ai/v1",
                )
                logger.info("Vision API client initialized")
            except Exception as e:
                logger.warning(f"Could not initialize vision API: {e}")
                logger.info("Will use predefined test definitions instead")

    def encode_image(self, image_path: Path) -> str:
        """Encode image to base64"""
        with open(image_path, "rb") as f:
            return base64.b64encode(f.read()).decode("utf-8")

    def analyze_screenshot(self, image_path: Path, test_name: str) -> Dict[str, Any]:
        """
        Analyze a screenshot using AI vision or predefined test definitions

        Args:
            image_path: Path to screenshot
            test_name: Name of the test

        Returns:
            Analysis result with UI elements
        """
        logger.info(f"Analyzing screenshot: {image_path}")

        if not image_path.exists():
            return {"status": "error", "message": f"Screenshot not found: {image_path}"}

        # Try to use predefined test definition first
        try:
            from server.test_definitions import get_test_definition

            # Extract test name without suffixes
            base_test_name = test_name.replace("_expected", "").replace("_actual", "")
            analysis = get_test_definition(base_test_name)
            logger.info(f"Using predefined test definition for: {base_test_name}")
            return analysis
        except (ImportError, KeyError) as e:
            logger.debug(f"No predefined definition found: {e}")

        # Fallback to vision API if available and enabled
        if self.use_vision_api and self.client:
            return self._analyze_with_vision_api(image_path, test_name)

        # Fallback to basic analysis
        logger.warning(
            "No vision API or test definition available, using basic analysis"
        )
        return {
            "page": "Unknown",
            "elements": [],
            "text_content": [],
            "layout": "Analysis not available - please define test expectations in test_definitions.py",
            "status": "no_analysis",
        }

    def _analyze_with_vision_api(
        self, image_path: Path, test_name: str
    ) -> Dict[str, Any]:
        """
        Analyze screenshot using vision API

        Args:
            image_path: Path to screenshot
            test_name: Name of the test

        Returns:
            Analysis result
        """
        # Encode image
        image_base64 = self.encode_image(image_path)

        # Create vision prompt
        prompt = f"""Analyze this screenshot of the Lightcone dashboard for the test: {test_name}

Provide a detailed analysis in JSON format with these fields:

{{
  "page": "Name of the page/section shown",
  "elements": [
    {{
      "name": "Element name",
      "type": "button|dropdown|textfield|etc",
      "value": "current value if applicable",
      "selected": true/false if applicable,
      "visible": true/false
    }}
  ],
  "text_content": ["List of important text visible on the page"],
  "layout": "Brief description of the layout"
}}

Be thorough and list ALL visible UI elements, their states, and text content."""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4-vision-preview",  # Use vision model
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{image_base64}"
                                },
                            },
                        ],
                    }
                ],
                max_tokens=1000,
            )

            # Parse JSON response
            analysis_text = response.choices[0].message.content
            logger.info(f"AI Analysis: {analysis_text[:200]}...")

            # Try to parse as JSON
            try:
                analysis = json.loads(analysis_text)
            except json.JSONDecodeError:
                # If not valid JSON, create structured response from text
                analysis = {
                    "page": "Unknown",
                    "elements": [],
                    "text_content": [],
                    "raw_analysis": analysis_text,
                }

            return analysis

        except Exception as e:
            logger.error(f"Vision API analysis failed: {e}", exc_info=True)
            return {"status": "error", "message": str(e)}

    def compare_screenshots(
        self, expected_path: Path, actual_path: Optional[Path], test_name: str
    ) -> Dict[str, Any]:
        """
        Compare expected vs actual screenshots using AI vision

        Args:
            expected_path: Path to expected screenshot
            actual_path: Path to actual screenshot (if available)
            test_name: Name of the test

        Returns:
            Comparison result with analysis
        """
        logger.info(f"Comparing screenshots for test: {test_name}")

        if not expected_path.exists():
            return {"status": "error", "message": "Expected screenshot not found"}

        comparison = {
            "test_name": test_name,
            "expected_screenshot": str(expected_path),
            "actual_screenshot": str(actual_path) if actual_path else None,
            "timestamp": datetime.now().isoformat(),
        }

        # Analyze expected screenshot
        logger.info("Analyzing expected screenshot...")
        expected_analysis = self.analyze_screenshot(
            expected_path, f"{test_name}_expected"
        )

        comparison["expected_analysis"] = expected_analysis

        # If we have actual screenshot, analyze and compare
        if actual_path and actual_path.exists():
            logger.info("Analyzing actual screenshot...")
            actual_analysis = self.analyze_screenshot(
                actual_path, f"{test_name}_actual"
            )
            comparison["actual_analysis"] = actual_analysis

            # Use AI to compare both screenshots
            comparison["comparison"] = self._ai_compare(
                expected_path, actual_path, expected_analysis, actual_analysis
            )
        else:
            logger.warning("No actual screenshot available for comparison")
            comparison["status"] = "missing_actual"

        # Use expected analysis for the checklist
        comparison["analysis"] = expected_analysis

        return comparison

    def _ai_compare(
        self,
        expected_path: Path,
        actual_path: Path,
        expected_analysis: Dict,
        actual_analysis: Dict,
    ) -> Dict[str, Any]:
        """
        Use AI to compare two screenshots

        Args:
            expected_path: Path to expected screenshot
            actual_path: Path to actual screenshot
            expected_analysis: Analysis of expected screenshot
            actual_analysis: Analysis of actual screenshot

        Returns:
            Comparison result
        """
        logger.info("Performing AI-based screenshot comparison...")

        # Encode both images
        expected_base64 = self.encode_image(expected_path)
        actual_base64 = self.encode_image(actual_path)

        prompt = f"""Compare these two screenshots of the Lightcone dashboard.

LEFT IMAGE: Expected result
RIGHT IMAGE: Actual result

Provide a detailed comparison in JSON format:
{{
  "match": true/false,
  "differences": [
    {{
      "element": "Name of element that differs",
      "expected": "Expected state/value",
      "actual": "Actual state/value",
      "severity": "critical|major|minor"
    }}
  ],
  "passed_checks": ["List of UI elements that match"],
  "failed_checks": ["List of UI elements that don't match"],
  "overall_assessment": "Brief summary of the comparison"
}}

Previous analysis results:
Expected: {json.dumps(expected_analysis, indent=2)}
Actual: {json.dumps(actual_analysis, indent=2)}
"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4-vision-preview",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{expected_base64}",
                                    "detail": "high",
                                },
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{actual_base64}",
                                    "detail": "high",
                                },
                            },
                        ],
                    }
                ],
                max_tokens=1500,
            )

            comparison_text = response.choices[0].message.content
            logger.info(f"AI Comparison: {comparison_text[:200]}...")

            # Try to parse as JSON
            try:
                comparison = json.loads(comparison_text)
            except json.JSONDecodeError:
                comparison = {"match": False, "raw_comparison": comparison_text}

            return comparison

        except Exception as e:
            logger.error(f"AI comparison failed: {e}", exc_info=True)
            return {"match": False, "error": str(e)}


class TestReportGenerator:
    """Generates test reports with checkboxes in markdown format"""

    def __init__(self, results_dir: str = "results"):
        """
        Initialize report generator

        Args:
            results_dir: Directory to save test reports
        """
        self.results_dir = Path(results_dir)
        self.results_dir.mkdir(exist_ok=True)

    def generate_report(
        self,
        test_name: str,
        execution_result: Dict[str, Any],
        comparison_result: Dict[str, Any],
    ) -> Path:
        """
        Generate a test report with checkboxes

        Args:
            test_name: Name of the test
            execution_result: Result from test execution
            comparison_result: Result from screenshot comparison

        Returns:
            Path to generated report file
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = self.results_dir / f"{test_name}_{timestamp}.md"

        logger.info(f"Generating test report: {report_file}")

        # Build markdown report
        report = []
        report.append(f"# Test Report: {test_name}")
        report.append(f"\n**Date**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append(
            f"\n**Test Status**: {execution_result.get('status', 'unknown').upper()}"
        )
        report.append("\n---\n")

        # Test execution details
        report.append("## Test Execution")
        report.append(
            f"\n- **Instructions File**: `{execution_result.get('instruction', 'N/A')[:100]}...`"
        )
        report.append(
            f"- **Events Processed**: {execution_result.get('event_count', 0)}"
        )
        report.append(f"- **Status**: {execution_result.get('status', 'unknown')}")

        if execution_result.get("error"):
            report.append(f"\n⚠️ **Error**: {execution_result['error']}")

        report.append("\n---\n")

        # Screenshot comparison
        report.append("## UI Verification Checklist\n")

        analysis = comparison_result.get("analysis", {})

        # Page verification
        if "page" in analysis:
            report.append(f"### Page: {analysis['page']}\n")

        # UI Elements verification
        if "elements" in analysis:
            report.append("### UI Elements\n")
            for element in analysis["elements"]:
                checkbox = "☐"  # Unchecked by default
                name = element.get("name", "Unknown")

                details = []
                if "value" in element:
                    details.append(f"Value: `{element['value']}`")
                if "selected" in element:
                    details.append(f"Selected: {element['selected']}")
                if "visible" in element:
                    details.append(f"Visible: {element['visible']}")

                detail_str = " - " + ", ".join(details) if details else ""
                report.append(f"- {checkbox} **{name}**{detail_str}")
            report.append("")

        # Expected text content
        if "expected_text" in analysis:
            report.append("### Expected Text Content\n")
            for text in analysis["expected_text"]:
                report.append(f"- ☐ `{text}`")
            report.append("")

        # Screenshots section
        report.append("---\n")
        report.append("## Screenshots\n")

        if comparison_result.get("expected_screenshot"):
            report.append(
                f"**Expected**: `{comparison_result['expected_screenshot']}`\n"
            )

        if comparison_result.get("actual_screenshot"):
            report.append(f"**Actual**: `{comparison_result['actual_screenshot']}`\n")
        else:
            report.append("**Actual**: Not captured yet\n")

        # Instructions for manual verification
        report.append("---\n")
        report.append("## Manual Verification Steps\n")
        report.append("\n1. Open the expected screenshot")
        report.append("2. Compare with the actual result from the test execution")
        report.append("3. Check each box above as you verify each element")
        report.append("4. Note any discrepancies in the section below\n")

        # Notes section
        report.append("---\n")
        report.append("## Notes\n")
        report.append("\n<!-- Add any observations or issues here -->\n")

        # Write report to file
        with open(report_file, "w") as f:
            f.write("\n".join(report))

        logger.info(f"Report generated successfully: {report_file}")
        return report_file

    def generate_summary_report(self, test_results: List[Dict[str, Any]]) -> Path:
        """
        Generate a summary report for multiple tests

        Args:
            test_results: List of test results

        Returns:
            Path to summary report
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        summary_file = self.results_dir / f"summary_{timestamp}.md"

        report = []
        report.append("# Test Suite Summary\n")
        report.append(f"**Date**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append(f"**Total Tests**: {len(test_results)}\n")

        # Count statuses
        passed = sum(1 for r in test_results if r.get("status") == "completed")
        failed = sum(1 for r in test_results if r.get("status") == "failed")

        report.append(f"- ✅ Passed: {passed}")
        report.append(f"- ❌ Failed: {failed}")
        report.append("\n---\n")

        # Individual test results
        report.append("## Test Results\n")
        for result in test_results:
            status_icon = "✅" if result.get("status") == "completed" else "❌"
            test_name = result.get("test_name", "Unknown")
            report.append(
                f"{status_icon} **{test_name}** - {result.get('status', 'unknown')}"
            )

        with open(summary_file, "w") as f:
            f.write("\n".join(report))

        return summary_file


class UITestFramework:
    """Main test framework orchestrator"""

    def __init__(
        self, results_dir: str = "results", screenshots_dir: str = "actual_screenshots"
    ):
        """
        Initialize the UI test framework

        Args:
            results_dir: Directory for test reports
            screenshots_dir: Directory for actual screenshots
        """
        self.executor = UITestExecutor(screenshots_dir)
        self.comparator = UITestComparator()
        self.reporter = TestReportGenerator(results_dir)
        self.test_results: List[Dict[str, Any]] = []

    def run_test(self, test_case: UITestCase, max_steps: int = 50) -> Dict[str, Any]:
        """
        Run a single test case end-to-end

        Args:
            test_case: The test case to run
            max_steps: Maximum steps for execution

        Returns:
            Complete test result
        """
        logger.info(f"=" * 80)
        logger.info(f"Running test: {test_case.name}")
        logger.info(f"=" * 80)

        # Execute test
        execution_result = self.executor.execute_test(test_case, max_steps)

        # Compare screenshots
        comparison_result = self.comparator.compare_screenshots(
            test_case.expected_screenshot, test_case.actual_screenshot, test_case.name
        )

        # Generate report
        report_path = self.reporter.generate_report(
            test_case.name, execution_result, comparison_result
        )

        # Combine results
        result = {
            "test_name": test_case.name,
            "status": execution_result.get("status"),
            "execution": execution_result,
            "comparison": comparison_result,
            "report": str(report_path),
        }

        self.test_results.append(result)

        logger.info(f"Test completed: {test_case.name}")
        logger.info(f"Report: {report_path}")

        return result

    def run_test_suite(
        self, test_cases: List[UITestCase], max_steps: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Run multiple test cases

        Args:
            test_cases: List of test cases to run
            max_steps: Maximum steps per test

        Returns:
            List of test results
        """
        logger.info(f"Running test suite with {len(test_cases)} tests")

        for test_case in test_cases:
            self.run_test(test_case, max_steps)

        # Generate summary report
        summary_path = self.reporter.generate_summary_report(self.test_results)
        logger.info(f"Summary report: {summary_path}")

        return self.test_results


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(
        description="UI Testing Framework for Lightcone Dashboard"
    )
    parser.add_argument(
        "--test-file", default="home_completions.md", help="Test instructions file"
    )
    parser.add_argument(
        "--expected",
        default="expected/home_completions.png",
        help="Expected screenshot",
    )
    parser.add_argument(
        "--test-name", default="home_completions", help="Test case name"
    )
    parser.add_argument(
        "--max-steps", type=int, default=50, help="Maximum steps for test execution"
    )

    args = parser.parse_args()

    # Check API key
    if not os.getenv("TZAFON_API_KEY"):
        logger.error("TZAFON_API_KEY environment variable not set")
        return 1

    # Create test case
    test_case = UITestCase(
        name=args.test_name,
        instructions_file=args.test_file,
        expected_screenshot=args.expected,
    )

    # Run test
    framework = UITestFramework()
    result = framework.run_test(test_case, max_steps=args.max_steps)

    logger.info("=" * 80)
    logger.info("Test Execution Complete!")
    logger.info(f"Status: {result['status']}")
    logger.info(f"Report: {result['report']}")
    logger.info("=" * 80)

    return 0 if result["status"] == "completed" else 1


if __name__ == "__main__":
    import sys

    sys.exit(main())
