# Lightcone SDK Tests (11-03)

End-to-end tests for both the TypeScript and Python Lightcone SDKs.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) (v10+)
- [Python](https://www.python.org/) (3.12+)
- [uv](https://docs.astral.sh/uv/)
- [Make](https://www.gnu.org/software/make/)

## Setup

### 1. Environment variables

Copy the example env file and fill in your API key:

```bash
cp .env.example .env
```

Edit `.env` and set your `TZAFON_API_KEY`.

### 2. Install dependencies

Install both TypeScript and Python dependencies:

```bash
make install
```

Or install them individually:

```bash
make install-ts   # pnpm install in ts/
make install-py   # uv sync in py/
```

## Running the tests

Run both SDK tests sequentially (Python first, then TypeScript):

```bash
make test
```

Each SDK displays a colored banner with the SDK name and installed package version before running.

Run only one SDK:

```bash
make test-py   # Python SDK  (uv run main.py)
make test-ts   # TypeScript SDK  (pnpm dev / tsx main.ts)
```

## Project structure

```
.
├── .env              # API keys (not committed)
├── .env.example      # Template for .env
├── Makefile          # Task runner
├── ts/               # TypeScript SDK tests
│   ├── main.ts       # Entry point
│   ├── auto/         # Test modules
│   └── package.json
└── py/               # Python SDK tests
    ├── main.py       # Entry point
    ├── auto/         # Test modules
    └── pyproject.toml
```
