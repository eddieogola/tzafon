#!/usr/bin/env python3
"""
Test definitions with expected UI elements

Since vision API might not be available, we define expected UI elements manually
based on the expected screenshots.
"""

from typing import Dict, List, Any


# Test: home_completions
HOME_COMPLETIONS_EXPECTED = {
    "page": "Completions",
    "elements": [
        {
            "name": "Model dropdown",
            "type": "dropdown",
            "value": "Northstar CUA Fast 1.1 256k Alpha",
            "visible": True,
            "verified": False
        },
        {
            "name": "System prompt field",
            "type": "textarea",
            "placeholder": "Enter a system prompt to set the behavior of the model",
            "visible": True,
            "verified": False
        },
        {
            "name": "Preset section",
            "type": "section",
            "visible": True,
            "verified": False
        },
        {
            "name": "Preset - Creative button",
            "type": "button",
            "visible": True,
            "selected": False,
            "verified": False
        },
        {
            "name": "Preset - Balanced button",
            "type": "button",
            "visible": True,
            "selected": True,
            "verified": False
        },
        {
            "name": "Preset - Precise button",
            "type": "button",
            "visible": True,
            "selected": False,
            "verified": False
        },
        {
            "name": "Preset description",
            "type": "text",
            "value": "Good for general tasks (temp: 0.7, max: 1024)",
            "visible": True,
            "verified": False
        },
        {
            "name": "Code dropdown",
            "type": "dropdown",
            "visible": True,
            "verified": False
        },
        {
            "name": "Chat interface",
            "type": "panel",
            "visible": True,
            "verified": False
        },
        {
            "name": "Chat placeholder",
            "type": "text",
            "value": "Your conversation will appear here",
            "visible": True,
            "verified": False
        },
        {
            "name": "Chat input",
            "type": "textfield",
            "placeholder": "Chat with your prompt",
            "visible": True,
            "verified": False
        }
    ],
    "text_content": [
        "Lightcone's now in open beta.",
        "Model",
        "Northstar CUA Fast 1.1 256k Alpha",
        "System prompt",
        "Enter a system prompt to set the behavior of the model",
        "Preset",
        "Creative",
        "Balanced",
        "Precise",
        "Good for general tasks (temp: 0.7, max: 1024)",
        "Code",
        "Your conversation will appear here",
        "Chat with your prompt"
    ],
    "layout": "Left sidebar with navigation, main content area with model configuration on left, chat interface on right",
    "navigation": {
        "sidebar_items": [
            "Home",
            "API playground",
            "Completions",
            "Computers",
            "Agent",
            "Environments",
            "Usage",
            "Billing",
            "API keys",
            "Team settings",
            "Examples",
            "Docs"
        ],
        "active_item": "Completions"
    }
}


# Registry of test definitions
TEST_DEFINITIONS = {
    "home_completions": HOME_COMPLETIONS_EXPECTED
}


def get_test_definition(test_name: str) -> Dict[str, Any]:
    """
    Get test definition by name

    Args:
        test_name: Name of the test

    Returns:
        Test definition dictionary

    Raises:
        KeyError: If test definition not found
    """
    if test_name not in TEST_DEFINITIONS:
        raise KeyError(f"Test definition not found: {test_name}")

    return TEST_DEFINITIONS[test_name]


def list_available_tests() -> List[str]:
    """Get list of available test names"""
    return list(TEST_DEFINITIONS.keys())
