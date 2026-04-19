# Contributing to crewai-tzafon

Thank you for your interest in contributing to crewai-tzafon! This document provides guidelines for contributing to this project.

## Development Setup

### Prerequisites

- Python 3.10 or higher
- UV package manager (recommended) or pip

### Setting Up Your Development Environment

1. Clone the repository:
```bash
git clone https://github.com/tzafon/tzafon.git
cd integrations/crew-ai/crewai-tzafon
```

2. Create a virtual environment:
```bash
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install dependencies:
```bash
uv pip install -e ".[dev]"
```

4. Set up your API key:
```bash
export TZAFON_API_KEY="your_api_key_here"
```

## Running Tests

Run the test suite:
```bash
pytest
```

Run tests with coverage:
```bash
pytest --cov=crewai_tzafon --cov-report=html
```

## Code Style

This project follows PEP 8 guidelines. Before submitting a PR:

1. Format your code (if using ruff):
```bash
ruff format .
```

2. Check for linting issues:
```bash
ruff check .
```

## Making Changes

1. Create a new branch for your feature or bugfix:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and add tests

3. Ensure all tests pass:
```bash
pytest
```

4. Commit your changes with a clear message:
```bash
git commit -m "Add: Description of your changes"
```

5. Push to your fork and submit a pull request

## Pull Request Guidelines

- Provide a clear description of the changes
- Include tests for new features
- Update documentation as needed
- Ensure all tests pass
- Follow the existing code style

## Reporting Issues

When reporting issues, please include:
- Python version
- crewai-tzafon version
- Steps to reproduce
- Expected vs actual behavior
- Error messages/stack traces

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
