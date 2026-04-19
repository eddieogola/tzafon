"""
TzafonLoadTool - CrewAI tool for loading web pages using Tzafon's headless browser.

This module provides a CrewAI-compatible tool that uses Tzafon's cloud-based
headless browser infrastructure to load and extract content from web pages.
"""

from typing import Optional, Type
from pydantic import BaseModel, Field
from crewai.tools import BaseTool
from playwright.sync_api import sync_playwright

from .core import TzafonClient
from .utils import get_logger
from .constants import Settings

logger = get_logger(__name__)
config = Settings()


class TzafonLoadToolInput(BaseModel):
    """Input schema for TzafonLoadTool."""
    url: str = Field(..., description="The URL of the web page to load")
    text_content: bool = Field(
        default=True,
        description="If True, extracts text content. If False, extracts raw HTML."
    )


class TzafonLoadTool(BaseTool):
    """
    CrewAI tool for loading web pages using Tzafon's headless browser infrastructure.

    This tool uses Tzafon's cloud-based browser instances to render web pages,
    handling JavaScript execution and dynamic content loading. It's ideal for
    scraping modern web applications that rely heavily on client-side rendering.

    Features:
        - Cloud-based headless browser rendering
        - JavaScript execution support
        - Handles SPAs and dynamically loaded content
        - Text or HTML content extraction

    Example:
        >>> from crewai_tzafon import TzafonLoadTool
        >>> tool = TzafonLoadTool()
        >>> content = tool._run(url="https://example.com")
        >>> print(content)

    Attributes:
        name: The name of the tool ("tzafon_load_tool")
        description: Description of what the tool does
        args_schema: Pydantic model defining the input schema
        api_key: Optional Tzafon API key (falls back to TZAFON_API_KEY env var)
    """

    name: str = "tzafon_load_tool"
    description: str = (
        "Loads web pages using Tzafon's cloud-based headless browser. "
        "Handles JavaScript-heavy sites and SPAs by fully rendering the page "
        "before extracting content. Returns either text content or raw HTML."
    )
    args_schema: Type[BaseModel] = TzafonLoadToolInput
    api_key: Optional[str] = None

    def __init__(self, api_key: Optional[str] = None, **kwargs):
        """
        Initialize the TzafonLoadTool.

        Args:
            api_key: The Tzafon API key. If not provided, it will be retrieved
                    from the TZAFON_API_KEY environment variable.
            **kwargs: Additional keyword arguments passed to BaseTool.
        """
        super().__init__(**kwargs)
        self.api_key = api_key or config.api_key.get_secret_value()

        if not self.api_key:
            raise ValueError(
                "Tzafon API key is required. Pass api_key parameter or set "
                "TZAFON_API_KEY environment variable. "
                "Get your API key at https://docs.lightcone.ai/quickstart#get-your-api-key"
            )

    def _run(
        self,
        url: str,
        text_content: bool = True,
    ) -> str:
        """
        Load a web page and extract its content.

        This method connects to Tzafon's cloud browser, navigates to the specified
        URL, waits for the page to fully render, and extracts either text content
        or raw HTML.

        Args:
            url: The URL of the web page to load.
            text_content: If True, extracts visible text content. If False, returns
                         the raw HTML source. Defaults to True.

        Returns:
            str: The extracted page content (either text or HTML).

        Raises:
            ValueError: If the API key is missing.
            Exception: If there's an error loading the page.
        """
        client = TzafonClient(api_key=self.api_key)
        computer = client.initialize(kind="browser")
        cdp_url = f"{config.api_base_url}/computers/{computer.id}/cdp?token={self.api_key}"

        try:
            with sync_playwright() as playwright:
                browser = playwright.chromium.connect_over_cdp(cdp_url)
                # Use existing context if available, otherwise create one
                context = browser.contexts[0] if browser.contexts else browser.new_context()

                page = context.new_page()
                try:
                    logger.info(f"Loading URL: {url}")
                    page.goto(url)

                    if text_content:
                        content = page.inner_text("body")
                        logger.info(f"Extracted text content from {url} ({len(content)} chars)")
                    else:
                        content = page.content()
                        logger.info(f"Extracted HTML from {url} ({len(content)} chars)")

                    return str(content)
                finally:
                    page.close()
                    browser.close()
        except Exception as e:
            logger.error(f"Error loading page {url}: {e}")
            raise
        finally:
            computer.terminate()
            logger.info("Tzafon computer terminated")
