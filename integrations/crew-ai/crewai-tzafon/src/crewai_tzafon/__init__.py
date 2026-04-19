"""
crewai-tzafon - CrewAI integration for Tzafon's headless browser infrastructure.

This package provides a CrewAI tool for loading web pages using Tzafon's
cloud-based headless browser service.
"""

from crewai_tzafon.tools import TzafonLoadTool

__all__ = [
    "TzafonLoadTool",
]

__version__ = "1.0.0"
