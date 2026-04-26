# Test Structure

## Available Test Suites

### 1. Home Dashboard Tests (`make test-home`)
Located in: `instructions/home/`

| Test File | Expected Screenshot | Description |
|-----------|-------------------|-------------|
| api_ref.md | api_ref.png | API Reference navigation |
| completions.md | completions.png | Completions page navigation |
| computers.md | computers.png | Computers page navigation |
| environments.md | environments.png | Environments page navigation |
| quickstart.md | quickstart.png | Quickstart page navigation |

**Run with:**
```bash
make test-home                # Simple agent
make test-home-adv            # Advanced agent with logging
```

### 2. Completions Tests (`make test-completions`)
Located in: `instructions/completions/`

| Test File | Expected Screenshot | Description |
|-----------|-------------------|-------------|
| model_change.md | model_change.png | Change model to Northstar CUA Fast |

**Run with:**
```bash
make test-completions         # Simple agent
make test-completions-adv     # Advanced agent with logging
```

## Directory Structure

```
server/
├── instructions/
│   ├── home/                 # 5 test files
│   │   ├── api_ref.md
│   │   ├── completions.md
│   │   ├── computers.md
│   │   ├── environments.md
│   │   └── quickstart.md
│   └── completions/          # 1 test file
│       └── model_change.md
│
├── expected/
│   ├── home/                 # 5 screenshots
│   │   ├── api_ref.png
│   │   ├── completions.png
│   │   ├── computers.png
│   │   ├── environments.png
│   │   └── quickstart.png
│   └── completions/          # 1 screenshot
│       └── model_change.png
│
└── results/                  # Auto-generated test results
    ├── api_ref_summary.md
    ├── completions_summary.md
    ├── model_change_summary.md
    └── ...
```

## Make Commands Summary

| Command | Description |
|---------|-------------|
| `make test-all` | Run all 6 tests (home + completions) |
| `make test-home` | Run 5 home dashboard tests |
| `make test-completions` | Run 1 completions test |
| `make test-file FILE=home/api_ref.md` | Run single test |
| `make test-advanced` | Run all with advanced agent |
| `make clean` | Clean all generated files |
| `make show-results` | Show test results summary |

## Quick Examples

```bash
# Run all home tests
make test-home

# Run completions test
make test-completions

# Run everything
make test-all

# Run single test
make test-file FILE=completions/model_change.md

# View results
make show-results
```

---

**Total Tests:** 6 (5 home + 1 completions)

Last updated: 2026-04-19
