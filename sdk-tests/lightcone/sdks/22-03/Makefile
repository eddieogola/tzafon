.PHONY: all install install-ts install-py test test-ts test-py check-env clean

# Colors
CYAN    := \033[1;36m
GREEN   := \033[1;32m
YELLOW  := \033[1;33m
MAGENTA := \033[1;35m
RESET   := \033[0m
BOLD    := \033[1m
DIM     := \033[2m

# Run SDK tests sequentially: Python first, then TypeScript
all: test

# Install dependencies for both SDKs
install: install-ts install-py

install-ts:
	cd ts && pnpm install

install-py:
	cd py && uv sync && uv run playwright install chromium

# Ensure .env exists before running tests
check-env:
	@test -f .env || (printf "$(YELLOW)✘ .env file not found. Copy .env.example and fill in your API key:\n  cp .env.example .env$(RESET)\n" && exit 1)

# Run Python SDK tests first, then TypeScript SDK tests
test: check-env test-py test-ts
	@echo ""
	@printf "$(GREEN)✔ All SDK tests completed.$(RESET)\n"

test-ts:
	@echo ""
	@printf "$(CYAN)$(BOLD)══════════════════════════════════════════════$(RESET)\n"
	@printf "$(CYAN)$(BOLD)  TypeScript SDK$(RESET)$(DIM) v$$(cd ts && node -p "JSON.parse(require('fs').readFileSync('node_modules/@tzafon/lightcone/package.json','utf8')).version" 2>/dev/null || echo 'unknown')$(RESET)\n"
	@printf "$(CYAN)$(BOLD)══════════════════════════════════════════════$(RESET)\n"
	@echo ""
	cd ts && pnpm dev

test-py:
	@echo ""
	@printf "$(MAGENTA)$(BOLD)══════════════════════════════════════════════$(RESET)\n"
	@printf "$(MAGENTA)$(BOLD)  Python SDK$(RESET)$(DIM) v$$(cd py && uv run python -c "import importlib.metadata; print(importlib.metadata.version('tzafon'))" 2>/dev/null || echo 'unknown')$(RESET)\n"
	@printf "$(MAGENTA)$(BOLD)══════════════════════════════════════════════$(RESET)\n"
	@echo ""
	cd py && uv run main.py

clean:
	rm -rf ts/node_modules py/.venv
