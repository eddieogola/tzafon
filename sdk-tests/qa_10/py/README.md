# Tzafon Python SDK Examples

This project contains a collection of browser automation examples using the [Tzafon Python SDK](https://pypi.org/project/tzafon/). These examples demonstrate various capabilities of the Tzafon AI Computer, including navigation, interaction, screenshot handling, and multi-tab management.

## Prerequisites

- **Python**: version 3.11 or higher.
- **Tzafon API Key**: Obtain one from the [Tzafon Dashboard](https://tzafon.ai/dashboard).
- **uv**: It is recommended to use [uv](https://github.com/astral-sh/uv) for dependency management.

## Setup

1. **Clone the repository** (if you haven't already).
2. **Install dependencies**:
   ```bash
   uv sync
   ```
3. **Environment Configuration**:
   Create a `.env` file in the root directory and add your Tzafon API key:
   ```env
   TZAFON_API_KEY=your_api_key_here
   ```

## Project Structure

- `main.py`: The entry point for running basic Tzafon SDK examples.
- `auto.py`: Contains a variety of automation functions demonstrating different SDK features.
- `pw.py`: An example of using Playwright with Tzafon by connecting over CDP.
- `pyproject.toml`: Project configuration and dependencies.

## Examples in `auto.py`

- `change_wikipedia_language_and_right_click`: Navigates to Wikipedia, changes language, and performs a right-click.
- `ny_times_scroll_to_bottom`: Demonstrates scrolling on the NY Times website.
- `ny_times_check_robots_txt`: Navigates to robots.txt and extracts HTML content.
- `bnb_search_for_homes`: Performs a complex search on Airbnb.
- `github_search_for_tzafon`: Searches for "tzafon" on GitHub.
- `search_for_sf_and_drag`: Demonstrates drag-and-drop on OpenStreetMap.
- `checkout_at_target`: Automates a checkout flow on Target.com.
- `list_tabs_execution_action`: Shows how to list browser tabs using `execute_action`.
- `list_tabs_direct_api`: Shows how to list browser tabs using the direct SDK API.
- `multi_tab_open`: Demonstrates managing and interacting with multiple browser tabs.
- `multi_tab_playwright_on_wikipedia`: Shows multi-tab interaction specifically tailored for a Playwright-like flow.

## Running the Examples

### Basic SDK Examples

To run the SDK examples in `main.py`:

```bash
uv run main.py
```

_(Note: You'll need to uncomment the specific function you want to run in `main.py`.)_

### Playwright with Tzafon

To run the Playwright example:

```bash
uv run pw.py
```

## Learn More

For more information about Tzafon AI and its capabilities, visit [tzafon.ai/computer](https://www.tzafon.ai/computer).
