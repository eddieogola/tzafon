# Quick Start Guide

## Setup (One-time)

```bash
# 1. Create .env file with your credentials
# 2. Install dependencies
make install

# 3. Verify setup
make check-env
```

## Running Tests

```bash
# Run all tests
make test-all

# Run specific test suite
make test-home
make test-completions

# Run a single test
make test-file FILE=home/home_api_ref.md
```

## Common Commands

| Command | Description |
|---------|-------------|
| `make help` | Show all available commands |
| `make test-home` | Run home dashboard tests |
| `make test-file FILE=...` | Run single test |
| `make clean` | Clean all generated files |
| `make show-results` | Display results summary |

For full documentation, see **TESTING_GUIDE.md**
