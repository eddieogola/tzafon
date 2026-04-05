#!/usr/bin/env python3
"""
Test script for the Lightcone agent
Tests both basic and advanced agents with home.md instructions
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
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value


def check_prerequisites():
    """Check if all prerequisites are met"""
    print("🔍 Checking prerequisites...")

    # Check Python version
    if sys.version_info < (3, 12):
        print("❌ Python 3.12 or higher is required")
        return False

    # Check API key
    if not os.getenv("TZAFON_API_KEY"):
        print("❌ TZAFON_API_KEY environment variable not set")
        print("   Please set it in .env or export it")
        return False

    # Check home.md exists
    if not Path("home.md").exists():
        print("❌ home.md file not found")
        return False

    # Check if tzafon is installed
    try:
        import tzafon
        print(f"✅ Tzafon SDK installed (version: {tzafon.__version__ if hasattr(tzafon, '__version__') else 'unknown'})")
    except ImportError:
        print("❌ Tzafon SDK not installed")
        print("   Run: uv sync")
        return False

    print("✅ All prerequisites met\n")
    return True


def test_basic_agent():
    """Test the basic agent"""
    print("=" * 80)
    print("Testing Basic Agent (lightcone_agent.py)")
    print("=" * 80)

    try:
        from lightcone_agent import LightconeAgent

        # Create agent instance
        agent = LightconeAgent("home.md")

        # Read instructions (don't execute yet)
        print("\n📖 Reading instructions from home.md...")
        instruction = agent.read_instructions()
        print(f"✅ Instruction parsed: {instruction[:100]}...")

        print("\n✅ Basic agent test passed!")
        return True

    except Exception as e:
        print(f"\n❌ Basic agent test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_advanced_agent():
    """Test the advanced agent"""
    print("\n" + "=" * 80)
    print("Testing Advanced Agent (advanced_agent.py)")
    print("=" * 80)

    try:
        from advanced_agent import AdvancedLightconeAgent

        # Create agent instance
        agent = AdvancedLightconeAgent("home.md", save_screenshots=False)

        # Read instructions
        print("\n📖 Reading instructions from home.md...")
        instruction = agent.read_instructions()
        print(f"✅ Instruction parsed: {instruction[:100]}...")

        print("\n✅ Advanced agent test passed!")
        return True

    except Exception as e:
        print(f"\n❌ Advanced agent test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_instruction_parsing():
    """Test instruction parsing logic"""
    print("\n" + "=" * 80)
    print("Testing Instruction Parsing")
    print("=" * 80)

    test_content = """Go to https://lightcone.ai/dashboard, login with email: edwineogola@gmail.com
password:

If firefox shows a save login popup, click on the key icon that is on the address bar to the right of the lock icon

Click on the Completions card
"""

    expected_keywords = ["lightcone.ai/dashboard", "login", "email", "Completions"]

    # Test parsing logic
    lines = test_content.strip().split('\n')
    instructions = []

    for line in lines:
        line = line.strip()
        if line and not line.startswith('#'):
            if '→' in line:
                line = line.split('→', 1)[1].strip()
            instructions.append(line)

    parsed = ' '.join(instructions)

    print(f"\n📝 Original content length: {len(test_content)} chars")
    print(f"📝 Parsed instruction length: {len(parsed)} chars")
    print(f"📝 Parsed: {parsed[:150]}...")

    # Check if all keywords present
    all_present = all(keyword in parsed for keyword in expected_keywords)

    if all_present:
        print("\n✅ Instruction parsing test passed!")
        return True
    else:
        print("\n❌ Instruction parsing test failed - missing keywords")
        return False


def run_live_test():
    """
    Run a live test with the actual Lightcone API
    WARNING: This will execute the task on a real desktop environment!
    """
    print("\n" + "=" * 80)
    print("⚠️  LIVE TEST WARNING")
    print("=" * 80)
    print("\nThis will execute the home.md instructions on a REAL desktop environment.")
    print("This may incur API costs and will perform actual actions.")
    print("\nThe task is:")
    print("  - Login to https://lightcone.ai/dashboard")
    print("  - Click on the Completions card")

    response = input("\nDo you want to proceed? (yes/no): ").strip().lower()

    if response != "yes":
        print("❌ Live test cancelled")
        return False

    try:
        print("\n🚀 Running live test...")
        from lightcone_agent import LightconeAgent

        agent = LightconeAgent("home.md")

        # Execute with limited steps for safety
        print("\n⚠️  Executing with max_steps=30 for safety...")
        agent.execute_task_streaming(max_steps=30)

        print("\n✅ Live test completed!")
        return True

    except KeyboardInterrupt:
        print("\n⚠️  Live test interrupted by user")
        return False
    except Exception as e:
        print(f"\n❌ Live test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests"""
    print("🧪 Lightcone Agent Test Suite")
    print("=" * 80)

    # Load environment variables
    load_env()

    # Check prerequisites
    if not check_prerequisites():
        print("\n❌ Prerequisites check failed. Please fix the issues above.")
        sys.exit(1)

    # Run tests
    results = {
        "Prerequisites": True,
        "Instruction Parsing": test_instruction_parsing(),
        "Basic Agent": test_basic_agent(),
        "Advanced Agent": test_advanced_agent(),
    }

    # Summary
    print("\n" + "=" * 80)
    print("📊 Test Results Summary")
    print("=" * 80)

    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name:.<50} {status}")

    all_passed = all(results.values())

    print("\n" + "=" * 80)
    if all_passed:
        print("🎉 All tests passed!")

        # Offer to run live test
        print("\n" + "=" * 80)
        print("Optional: Live API Test")
        print("=" * 80)
        response = input("\nWould you like to run a live test with the actual API? (yes/no): ").strip().lower()

        if response == "yes":
            run_live_test()
    else:
        print("❌ Some tests failed. Please review the errors above.")
        sys.exit(1)


if __name__ == "__main__":
    main()
