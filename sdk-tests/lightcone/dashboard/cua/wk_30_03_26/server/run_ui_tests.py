#!/usr/bin/env python3
"""
Simple UI test runner for Lightcone Dashboard

Usage:
    python run_ui_tests.py                    # Run home_completions test
    python run_ui_tests.py --dry-run          # Analyze expected screenshot only
    python run_ui_tests.py --max-steps 30     # Limit execution steps
"""

import os
import sys
from pathlib import Path


def load_env():
    """Load environment variables from .env file"""
    env_file = Path(".env")
    if env_file.exists():
        with open(env_file) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    os.environ[key] = value


def main():
    import argparse
    from server.ui_test_framework import UITestCase, UITestFramework, UITestComparator

    parser = argparse.ArgumentParser(description="Run UI tests for Lightcone Dashboard")
    parser.add_argument(
        "--test-name",
        default="home_completions",
        help="Test name (default: home_completions)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Only analyze expected screenshot, don't execute test",
    )
    parser.add_argument(
        "--max-steps",
        type=int,
        default=50,
        help="Maximum steps for test execution (default: 50)",
    )

    args = parser.parse_args()

    # Load environment
    load_env()

    # Check API key
    if not os.getenv("TZAFON_API_KEY"):
        print("❌ Error: TZAFON_API_KEY environment variable not set")
        print("   Please set it in .env or export it")
        return 1

    print("=" * 80)
    print("🧪 Lightcone Dashboard UI Test Runner")
    print("=" * 80)

    # Define test case
    test_case = UITestCase(
        name=args.test_name,
        instructions_file=f"{args.test_name}.md",
        expected_screenshot=f"expected/{args.test_name}.png",
    )

    print(f"\n📋 Test: {test_case.name}")
    print(f"📄 Instructions: {test_case.instructions_file}")
    print(f"🖼️  Expected: {test_case.expected_screenshot}")

    if args.dry_run:
        print("\n🔍 DRY RUN MODE - Analyzing expected screenshot only...")
        print("-" * 80)

        comparator = UITestComparator()
        analysis = comparator.analyze_screenshot(
            test_case.expected_screenshot, test_case.name
        )

        print("\n📊 Analysis Results:")
        print("-" * 80)

        if "page" in analysis:
            print(f"\nPage: {analysis['page']}")

        if "elements" in analysis:
            print(f"\nUI Elements ({len(analysis['elements'])}):")
            for elem in analysis["elements"]:
                print(f"  - {elem.get('name', 'Unknown')}")
                if elem.get("type"):
                    print(f"    Type: {elem['type']}")
                if elem.get("value"):
                    print(f"    Value: {elem['value']}")
                if elem.get("selected") is not None:
                    print(f"    Selected: {elem['selected']}")

        if "text_content" in analysis:
            print(f"\nExpected Text ({len(analysis['text_content'])} items):")
            for text in analysis["text_content"][:10]:  # Show first 10
                print(f"  - {text}")

        print("\n✅ Dry run completed!")
        return 0

    # Run full test
    print("\n🚀 Running full UI test...")
    print("-" * 80)

    framework = UITestFramework()
    result = framework.run_test(test_case, max_steps=args.max_steps)

    print("\n" + "=" * 80)
    print("📊 Test Results")
    print("=" * 80)

    status_icon = "✅" if result["status"] == "completed" else "❌"
    print(f"\n{status_icon} Status: {result['status'].upper()}")
    print(f"📄 Report: {result['report']}")

    # Show summary of comparison if available
    if "comparison" in result and "analysis" in result["comparison"]:
        analysis = result["comparison"]["analysis"]
        if "elements" in analysis:
            print(f"\n📋 UI Elements Checked: {len(analysis['elements'])}")

    print("\n" + "=" * 80)
    print("✨ Test execution completed!")
    print("=" * 80)
    print(f"\n💡 Check the report for detailed results: {result['report']}")

    return 0 if result["status"] == "completed" else 1


if __name__ == "__main__":
    sys.exit(main())
