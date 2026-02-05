# Code Style: Shell Scripts

> Part of [Code Style Standards](../CODE_STYLE_STANDARDS.md)

> **See also**: [Shell Script Standards](../SHELL_SCRIPT_STANDARDS.md) for comprehensive guide.

---

## Header Template

```bash
#!/usr/bin/env bash

################################################################################
# ProjectName <Script Purpose>
################################################################################
# PURPOSE: <One sentence description>
#
# USAGE:
#   ./<script-name> [options]
#
# EXAMPLES:
#   ./<script-name> --option value
#
# DEPENDENCIES:
#   - Tool 1 (install command)
################################################################################

# Source common library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"
init_script

# Script-specific variables
readonly SCRIPT_NAME="$(basename "$0")"
readonly REPO_ROOT="$(get_repo_root)"
```

---

## Logging Functions

```bash
# ✅ Good - Use common library functions
log_info "Starting deployment"
log_success "Deployment complete"
log_warning "No .env file found"
log_error "Deployment failed"
die "AWS credentials not found"

# ❌ Bad - Raw echo
echo "Starting deployment"
echo -e "\033[0;32m✓\033[0m Deployment complete"
```

---

## Variable Naming

```bash
# ✅ Good
readonly SCRIPT_NAME="deploy.sh"     # Constants: UPPERCASE
readonly MAX_RETRIES=3               # Constants: UPPERCASE
BUILD_MODE="debug"                   # Config: UPPERCASE
local build_output="/tmp/build"      # Local: lowercase

# ❌ Bad
script_name="deploy.sh"              # Constants should be UPPERCASE
Max_Retries=3                        # Inconsistent
buildMode="debug"                    # Should be UPPERCASE
local BUILD_OUTPUT="/tmp/build"      # Local should be lowercase
```

---

## Error Handling

```bash
# ✅ Good - Fail fast with clear messages
if ! aws s3 ls "s3://$BUCKET" &> /dev/null; then
    die "S3 bucket not found: $BUCKET"
fi

# ❌ Bad - Silent failures
aws s3 ls "s3://$BUCKET" || true
```

---

## Tools

```bash
# Formatting (shfmt)
shfmt -i 4 -w scripts/*.sh

# Linting (shellcheck)
shellcheck scripts/*.sh
```

---

## Validation Checklist

- [ ] Uses `source lib/common.sh`
- [ ] Uses `log_*` functions (not raw `echo`)
- [ ] Has `--help` flag
- [ ] Works from any directory

