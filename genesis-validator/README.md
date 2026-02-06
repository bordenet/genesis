# Genesis Validator

A Go-based validation tool that ensures Genesis template consistency and completeness.

## Purpose

This tool performs comprehensive validation of the Genesis bootstrapping system to ensure:

1. **All template files are referenced** in documentation (no orphaned files)
2. **All referenced files exist** (no broken references)
3. **Documentation is consistent** between [START-HERE.md][start] and [CHECKLIST.md][checklist]
4. **Quality gates are enforced** before commits

[start]: https://github.com/bordenet/genesis/blob/main/genesis/START-HERE.md
[checklist]: https://github.com/bordenet/genesis/blob/main/genesis/CHECKLIST.md

## Quick Start

### Build

```bash
cd genesis-validator
go build -o bin/genesis-validator ./cmd/genesis-validator
```

### Run

```bash
# From the repository root
./genesis-validator/bin/genesis-validator

# With verbose output
./genesis-validator/bin/genesis-validator -verbose

# Without LLM prompt generation
./genesis-validator/bin/genesis-validator -no-prompt
```

### Test

```bash
cd genesis-validator
go test -v ./internal/validator/...
go test -cover ./internal/validator/...
```

### Lint

```bash
cd genesis-validator
golangci-lint run ./...
```

### Install as Pre-Commit Hook

```bash
# Install the validator as a git pre-commit hook
./genesis-validator/install-hook.sh

# The hook will run automatically on every commit
# To skip validation, use: git commit --no-verify
```

**What the hook does:**

- Runs the Genesis validator before every commit
- Ensures all templates are properly documented
- Prevents commits with orphaned or missing files
- Validates documentation consistency
- Provides clear error messages with fix suggestions

## What It Validates

### 1. Template File Inventory

- Scans `genesis/templates/` for all template files
- Identifies files matching patterns: `*-template*` or `*.template`

### 2. Documentation References

- Parses `genesis/START-HERE.md` for template references
- Parses `genesis/CHECKLIST.md` for template references
- Extracts references from multiple patterns:
  - `cp genesis/templates/...` (copy commands)
  - `` `templates/...` `` (backtick references)
  - `(from ...)`  (parenthetical references)
  - Direct mentions of `templates/...`

### 3. Orphaned Files

- Identifies template files that exist but are NOT referenced in documentation
- **Impact**: These files won't be deployed when Genesis is used

### 4. Missing Files

- Identifies files referenced in documentation but DON'T exist
- **Impact**: Broken instructions, deployment failures

### 5. Documentation Consistency

- Ensures START-HERE.md and CHECKLIST.md reference the same templates
- **Impact**: Inconsistent instructions confuse AI assistants

## Command-Line Options

| Flag | Description |
|------|-------------|
| `-verbose` | Enable verbose output (shows all files found) |
| `-no-prompt` | Disable LLM prompt generation |
| `-genesis-root` | Path to genesis directory (default: genesis) |
| `-help` | Show help message |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All checks passed |
| 1 | Critical errors found (orphaned/missing files) |
| 2 | Warnings found (inconsistencies) |

## Use Cases

### 1. Pre-Commit Hook

Run automatically before each commit to catch issues early:

```bash
./genesis-validator/bin/genesis-validator
```

### 2. CI/CD Pipeline

Add to GitHub Actions to enforce quality gates:

```yaml
- name: Validate Genesis
  run: ./genesis-validator/bin/genesis-validator
```

### 3. Periodic Self-Correction

Run periodically and use the generated LLM prompt to fix issues:

```bash
./genesis-validator/bin/genesis-validator > validation-report.txt
# Copy the LLM prompt section and paste into AI assistant
```

### 4. After Adding New Templates

Verify new templates are properly documented:

```bash
# Add new template file
touch genesis/templates/web-app/new-feature-template.js

# Run validator
./genesis-validator/bin/genesis-validator
# Will show: "Orphaned file: templates/web-app/new-feature-template.js"

# Add to documentation
# Re-run validator
./genesis-validator/bin/genesis-validator
# Should pass ✅
```

## Testing

The validator includes comprehensive tests:

| Test Suite | What It Tests |
|------------|---------------|
| Scanner tests | Template file detection |
| Parser tests | Reference extraction from documentation |
| Validator tests | End-to-end validation scenarios |

Run tests:

```bash
cd genesis-validator
go test -v ./internal/validator/...
go test -cover ./internal/validator/...
```

## Architecture

```text
genesis-validator/
├── cmd/
│   └── genesis-validator/
│       └── main.go              # CLI entry point
├── internal/
│   └── validator/
│       ├── types.go             # Core types and config
│       ├── scanner.go           # Template file scanner
│       ├── parser.go            # Documentation parser
│       ├── validator.go         # Validation logic
│       ├── prompt.go            # LLM prompt generator
│       ├── scanner_test.go      # Scanner tests
│       ├── parser_test.go       # Parser tests
│       └── validator_test.go    # Validator tests
├── bin/
│   └── genesis-validator        # Compiled binary
├── go.mod
├── go.sum
└── README.md
```

## Example Output

### Success

```text
✅ All checks passed! Found 46 template files, all referenced correctly.
```

### Failure

```text
📊 Validation Summary:
  Template files found: 46
  Orphaned files: 1
  Missing files: 2
  Inconsistencies: 5
  Errors: 0

[LLM PROMPT WITH DETAILED FIXES]
```

## Integration with Genesis

This validator is designed to be run as part of the Genesis quality gates:

1. **Pre-commit hook**: Prevents commits with validation errors
2. **CI/CD**: Blocks merges if validation fails
3. **Periodic audits**: Generates LLM prompts for self-correction

## Related

| Resource | Description |
|----------|-------------|
| [START-HERE.md][start] | Primary Genesis documentation |
| [CHECKLIST.md][checklist] | Execution checklist |
| [project-diff][diff] | Cross-project consistency checking |
| [BACKGROUND.md][bg] | Genesis ecosystem history and metrics |
| [CODE-CONSISTENCY-MANDATE.md][ccm] | File categorization and consistency rules |

[diff]: https://github.com/bordenet/genesis/tree/main/project-diff
[bg]: https://github.com/bordenet/genesis/blob/main/BACKGROUND.md
[ccm]: https://github.com/bordenet/genesis/blob/main/genesis/CODE-CONSISTENCY-MANDATE.md
