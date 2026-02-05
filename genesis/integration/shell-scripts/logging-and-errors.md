# Shell Scripts: Logging & Error Handling

> Part of [Shell Script Standards](../SHELL_SCRIPT_STANDARDS.md)

---

## Logging Standards

### Use Standard Logging Functions

**Always use the common library functions** - never use raw `echo`:

```bash
# ✅ Good
log_info "Starting deployment"
log_success "Deployment complete"
log_warning "No .env file found, using defaults"
log_error "Deployment failed: bucket not found"

# ❌ Bad
echo "Starting deployment"
echo -e "\033[0;32m✓\033[0m Deployment complete"
echo "WARNING: No .env file found"
```

### Message Format

```bash
# Action in progress (present continuous)
log_info "Building iOS application..."

# Action complete (past tense)
log_success "iOS application built"

# Error messages (what failed + why)
log_error "Failed to build iOS application: Xcode not found"

# Debug messages (key-value pairs)
log_debug "build_config=release target=simulator version=1.0.0"
```

### Logging Levels

| Level | Function | When to Use |
|-------|----------|-------------|
| **INFO** | `log_info` | Normal progress updates, milestones |
| **SUCCESS** | `log_success` | Successful completion of operations |
| **WARNING** | `log_warning` | Non-critical issues, degraded functionality |
| **ERROR** | `log_error` | Errors that allow script to continue |
| **FATAL** | `die` | Unrecoverable errors that require exit |
| **DEBUG** | `log_debug` | Detailed info for troubleshooting (DEBUG=1 only) |

---

## Error Handling

### Required Error Handling

```bash
# At top of every script
set -euo pipefail
init_script  # Sets up ERR trap

# For critical operations
if ! aws s3 ls "s3://$BUCKET" &> /dev/null; then
    die "S3 bucket not found: $BUCKET"
fi

# For expected failures
if ! some_command 2> /dev/null; then
    log_warning "Optional operation failed, continuing"
fi
```

### Exit Codes

```bash
# Success
exit 0

# Generic failure
exit 1

# Custom error codes
readonly ERR_MISSING_DEPENDENCY=2
readonly ERR_BUILD_FAILED=3
readonly ERR_NETWORK_ERROR=4

if ! command -v flutter &> /dev/null; then
    log_error "Flutter not found"
    exit $ERR_MISSING_DEPENDENCY
fi
```

---

## Variable Naming

### Conventions

```bash
# Constants (readonly, uppercase with underscores)
readonly SCRIPT_NAME="deploy.sh"
readonly DEFAULT_REGION="us-west-2"
readonly MAX_RETRIES=3

# Configuration (uppercase)
BUILD_MODE="debug"
TARGET_PLATFORM="ios"
ENABLE_CACHE=true

# Local variables (lowercase with underscores)
local build_output="/tmp/build"
local retry_count=0
local user_input=""

# Paths (uppercase, end with _DIR or _FILE)
readonly SCRIPT_DIR="$(get_script_dir)"
readonly REPO_ROOT="$(get_repo_root)"
readonly BUILD_DIR="$REPO_ROOT/build"
readonly CONFIG_FILE="$REPO_ROOT/.env"
```

