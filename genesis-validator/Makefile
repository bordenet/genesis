.PHONY: build test lint clean install-hook run help

# Default target
all: build test lint

# Build the validator
build:
	@echo "🔨 Building genesis-validator..."
	@go build -o bin/genesis-validator ./cmd/genesis-validator
	@echo "✅ Build complete: bin/genesis-validator"

# Run tests
test:
	@echo "🧪 Running tests..."
	@go test -v ./internal/validator/...

# Run tests with coverage
test-coverage:
	@echo "🧪 Running tests with coverage..."
	@go test -cover ./internal/validator/...
	@go test -coverprofile=coverage.out ./internal/validator/...
	@go tool cover -html=coverage.out -o coverage.html
	@echo "✅ Coverage report: coverage.html"

# Run linter
lint:
	@echo "🔍 Running linter..."
	@golangci-lint run ./...
	@echo "✅ Linting passed"

# Clean build artifacts
clean:
	@echo "🧹 Cleaning..."
	@rm -rf bin/
	@rm -f coverage.out coverage.html
	@echo "✅ Clean complete"

# Install pre-commit hook
install-hook:
	@echo "🔗 Installing pre-commit hook..."
	@ln -sf ../../genesis-validator/scripts/pre-commit-hook.sh ../.git/hooks/pre-commit
	@chmod +x ../.git/hooks/pre-commit
	@echo "✅ Pre-commit hook installed"

# Run the validator
run:
	@./bin/genesis-validator

# Run the validator with verbose output
run-verbose:
	@./bin/genesis-validator -verbose

# Help
help:
	@echo "Genesis Validator - Makefile targets:"
	@echo ""
	@echo "  make build          - Build the validator binary"
	@echo "  make test           - Run tests"
	@echo "  make test-coverage  - Run tests with coverage report"
	@echo "  make lint           - Run linter"
	@echo "  make clean          - Clean build artifacts"
	@echo "  make install-hook   - Install pre-commit hook"
	@echo "  make run            - Run the validator"
	@echo "  make run-verbose    - Run the validator with verbose output"
	@echo "  make all            - Build, test, and lint (default)"
	@echo "  make help           - Show this help message"

