# Makefile for Lightcone CUA Testing Automation
#
# This Makefile provides convenient commands to run automated UI tests
# for the Lightcone dashboard using the Northstar CUA agent.

.PHONY: help test-all test-home test-completions test-advanced test-home-adv test-completions-adv test-file clean clean-results clean-logs show-results quick-test install check-env

# Default target - show help
help:
	@echo "============================================================"
	@echo "Lightcone CUA Testing Automation"
	@echo "============================================================"
	@echo ""
	@echo "Available targets:"
	@echo ""
	@echo "  make test-all             - Run all test suites"
	@echo "  make test-home            - Run home dashboard tests"
	@echo "  make test-completions     - Run completions tests"
	@echo "  make test-file FILE=...   - Run a single test file"
	@echo ""
	@echo "  make test-advanced        - Run all tests with advanced agent"
	@echo "  make test-home-adv        - Run home tests with advanced agent"
	@echo "  make test-completions-adv - Run completions tests with advanced agent"
	@echo ""
	@echo "  make clean                - Clean all generated files"
	@echo "  make clean-results        - Clean only results directory"
	@echo "  make clean-logs           - Clean only logs directory"
	@echo "  make show-results         - Show test results summary"
	@echo ""
	@echo "  make quick-test           - Quick test (first home test)"
	@echo "  make check-env            - Check environment configuration"
	@echo "  make install              - Install dependencies"
	@echo ""
	@echo "Environment variables required:"
	@echo "  TZAFON_API_KEY         - API key for Tzafon/Lightcone"
	@echo "  LIGHTCONE_EMAIL        - Email for login"
	@echo "  LIGHTCONE_PASSWORD     - Password for login"
	@echo ""
	@echo "============================================================"

# Check environment variables
check-env:
	@echo "Checking environment configuration..."
	@if [ -z "$$TZAFON_API_KEY" ]; then \
		echo "❌ Error: TZAFON_API_KEY is not set"; \
		exit 1; \
	else \
		echo "✅ TZAFON_API_KEY is set"; \
	fi
	@if [ -z "$$LIGHTCONE_EMAIL" ]; then \
		echo "⚠️  Warning: LIGHTCONE_EMAIL is not set"; \
	else \
		echo "✅ LIGHTCONE_EMAIL is set"; \
	fi
	@if [ -z "$$LIGHTCONE_PASSWORD" ]; then \
		echo "⚠️  Warning: LIGHTCONE_PASSWORD is not set"; \
	else \
		echo "✅ LIGHTCONE_PASSWORD is set"; \
	fi
	@echo ""
	@echo "✨ Environment check complete"

# Install dependencies
install:
	@echo "Installing Python dependencies..."
	@if command -v uv >/dev/null 2>&1; then \
		uv sync; \
	else \
		echo "❌ Error: uv is not installed"; \
		echo "Install uv first: curl -LsSf https://astral.sh/uv/install.sh | sh"; \
		exit 1; \
	fi
	@echo "✅ Dependencies installed"

# Run all tests
test-all: check-env
	@echo "🚀 Running all test suites..."
	uv run python lightcone_agent.py

# Run home dashboard tests
test-home: check-env
	@echo "🏠 Running home dashboard tests..."
	uv run python lightcone_agent.py --suite home

# Run completions tests
test-completions: check-env
	@echo "📝 Running completions tests..."
	uv run python lightcone_agent.py --suite completions

# Run all tests with advanced agent
test-advanced: check-env
	@echo "🚀 Running all tests with advanced agent..."
	uv run python advanced_agent.py

# Run home tests with advanced agent
test-home-adv: check-env
	@echo "🏠 Running home tests with advanced agent..."
	uv run python advanced_agent.py --suite home

# Run completions tests with advanced agent
test-completions-adv: check-env
	@echo "📝 Running completions tests with advanced agent..."
	uv run python advanced_agent.py --suite completions

# Run a single test file
# Usage: make test-file FILE=home/home_api_ref.md
test-file: check-env
	@if [ -z "$(FILE)" ]; then \
		echo "❌ Error: FILE parameter is required"; \
		echo "Usage: make test-file FILE=home/home_api_ref.md"; \
		exit 1; \
	fi
	@echo "📄 Running single test: $(FILE)"
	uv run python lightcone_agent.py --file $(FILE)

# Clean all generated files
clean: clean-results clean-logs
	@echo "✅ All generated files cleaned"

# Clean results directory
clean-results:
	@echo "Cleaning results directory..."
	@if [ -d "results" ]; then \
		rm -rf results/*; \
		echo "✅ Results directory cleaned"; \
	else \
		echo "⚠️  Results directory does not exist"; \
	fi

# Clean logs directory
clean-logs:
	@echo "Cleaning logs directory..."
	@if [ -d "logs" ]; then \
		rm -rf logs/*; \
		echo "✅ Logs directory cleaned"; \
	else \
		echo "⚠️  Logs directory does not exist"; \
	fi

# Show test results
show-results:
	@echo "📊 Test Results:"
	@echo "================"
	@if [ -d "results" ]; then \
		for file in results/*.md; do \
			if [ -f "$$file" ]; then \
				echo ""; \
				echo "File: $$file"; \
				echo "----------------"; \
				grep -A 1 "Status:" "$$file" 2>/dev/null || echo "No status found"; \
			fi; \
		done; \
	else \
		echo "No results directory found"; \
	fi

# Quick test - run single test for development
quick-test: check-env
	@echo "⚡ Quick test - running first home test..."
	uv run python lightcone_agent.py --file home/home_completions.md
