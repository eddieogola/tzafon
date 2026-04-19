"""
Pytest configuration and fixtures for crewai-tzafon tests.
"""

import pytest


@pytest.fixture(autouse=True)
def reset_singleton():
    """
    Reset singleton instances between tests to ensure test isolation.
    """
    from crewai_tzafon.core import TzafonClient
    from crewai_tzafon.constants import Settings

    # Clear singleton instances
    if hasattr(TzafonClient, '__wrapped__'):
        TzafonClient.__wrapped__.__dict__.clear()
    if hasattr(Settings, '__wrapped__'):
        Settings.__wrapped__.__dict__.clear()

    yield

    # Cleanup after test
    if hasattr(TzafonClient, '__wrapped__'):
        TzafonClient.__wrapped__.__dict__.clear()
    if hasattr(Settings, '__wrapped__'):
        Settings.__wrapped__.__dict__.clear()
