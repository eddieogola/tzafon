import pytest
from unittest.mock import MagicMock, patch
from crewai_tzafon.tools import TzafonLoadTool


@pytest.fixture
def mock_settings():
    """Mock the Settings configuration."""
    with patch("crewai_tzafon.tools.config") as mock_config:
        mock_config.api_base_url = "http://mock-api"
        mock_config.api_key.get_secret_value.return_value = "default_key"
        yield mock_config


@pytest.fixture
def mock_client():
    """Mock the TzafonClient."""
    with patch("crewai_tzafon.tools.TzafonClient") as MockClient:
        mock_instance = MockClient.return_value
        mock_computer = MagicMock()
        mock_computer.id = "computer-123"
        mock_instance.initialize.return_value = mock_computer
        yield MockClient


@pytest.fixture
def mock_sync_playwright():
    """Mock the sync_playwright context manager."""
    with patch("crewai_tzafon.tools.sync_playwright") as mock_pw:
        yield mock_pw


def test_initialization_with_api_key(mock_settings):
    """Test tool initialization with explicit API key."""
    tool = TzafonLoadTool(api_key="test_key")
    assert tool.api_key == "test_key"
    assert tool.name == "tzafon_load_tool"
    assert "headless browser" in tool.description.lower()


def test_initialization_without_api_key(mock_settings):
    """Test tool initialization using environment variable."""
    tool = TzafonLoadTool()
    assert tool.api_key == "default_key"


def test_initialization_missing_api_key():
    """Test that initialization fails without API key."""
    with patch("crewai_tzafon.tools.config") as mock_config:
        mock_config.api_key.get_secret_value.return_value = ""
        with pytest.raises(ValueError, match="Tzafon API key is required"):
            TzafonLoadTool()


def test_run_extracts_text_content(mock_settings, mock_client, mock_sync_playwright):
    """Test that _run extracts text content by default."""
    # Setup Playwright mocks
    mock_pw_context = mock_sync_playwright.return_value.__enter__.return_value
    mock_browser = mock_pw_context.chromium.connect_over_cdp.return_value
    mock_browser.contexts = []
    mock_context = mock_browser.new_context.return_value
    mock_page = mock_context.new_page.return_value

    # Setup Page behavior
    mock_page.inner_text.return_value = "Mock Page Content"

    # Execute
    tool = TzafonLoadTool(api_key="test_key")
    result = tool._run(url="http://example.com", text_content=True)

    # Assertions
    assert result == "Mock Page Content"

    # Verify Playwright calls
    mock_pw_context.chromium.connect_over_cdp.assert_called_with(
        "http://mock-api/computers/computer-123/cdp?token=test_key"
    )
    mock_page.goto.assert_called_with("http://example.com")
    mock_page.inner_text.assert_called_with("body")
    mock_page.close.assert_called()
    mock_browser.close.assert_called()
    mock_client.return_value.initialize.return_value.terminate.assert_called()


def test_run_extracts_html_content(mock_settings, mock_client, mock_sync_playwright):
    """Test that _run can extract raw HTML."""
    mock_pw_context = mock_sync_playwright.return_value.__enter__.return_value
    mock_browser = mock_pw_context.chromium.connect_over_cdp.return_value
    mock_browser.contexts = []
    mock_context = mock_browser.new_context.return_value
    mock_page = mock_context.new_page.return_value

    mock_page.content.return_value = "<html><body>Mock HTML</body></html>"

    tool = TzafonLoadTool(api_key="test_key")
    result = tool._run(url="http://example.com", text_content=False)

    assert result == "<html><body>Mock HTML</body></html>"
    mock_page.content.assert_called()


def test_run_handles_existing_context(mock_settings, mock_client, mock_sync_playwright):
    """Test that _run uses existing browser context if available."""
    mock_pw_context = mock_sync_playwright.return_value.__enter__.return_value
    mock_browser = mock_pw_context.chromium.connect_over_cdp.return_value

    # Mock existing context
    mock_existing_context = MagicMock()
    mock_browser.contexts = [mock_existing_context]
    mock_page = mock_existing_context.new_page.return_value
    mock_page.inner_text.return_value = "Content"

    tool = TzafonLoadTool(api_key="test_key")
    tool._run(url="http://example.com")

    # Should use existing context, not create new one
    mock_browser.new_context.assert_not_called()
    mock_existing_context.new_page.assert_called()


def test_run_error_handling(mock_settings, mock_client, mock_sync_playwright):
    """Test that _run properly handles errors and cleans up."""
    mock_pw_context = mock_sync_playwright.return_value.__enter__.return_value
    mock_browser = mock_pw_context.chromium.connect_over_cdp.return_value
    mock_browser.contexts = []
    mock_context = mock_browser.new_context.return_value
    mock_page = mock_context.new_page.return_value

    # Simulate an error during page load
    mock_page.goto.side_effect = Exception("Connection timeout")

    tool = TzafonLoadTool(api_key="test_key")

    with pytest.raises(Exception, match="Connection timeout"):
        tool._run(url="http://example.com")

    # Verify cleanup still happens
    mock_page.close.assert_called()
    mock_client.return_value.initialize.return_value.terminate.assert_called()


def test_tool_schema():
    """Test that the tool has proper input schema."""
    with patch("crewai_tzafon.tools.config") as mock_config:
        mock_config.api_key.get_secret_value.return_value = "test_key"
        tool = TzafonLoadTool()

        # Check that args_schema is properly defined
        assert hasattr(tool, 'args_schema')
        schema = tool.args_schema.model_json_schema()

        # Verify required fields
        assert 'url' in schema['properties']
        assert 'text_content' in schema['properties']
        assert 'url' in schema['required']
