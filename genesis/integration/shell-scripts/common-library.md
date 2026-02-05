# Shell Scripts: Common Library

> Part of [Shell Script Standards](../SHELL_SCRIPT_STANDARDS.md)

---

## Installation

**Create `scripts/lib/common.sh`** (copy from starter-kit):

```bash
mkdir -p scripts/lib
cp starter-kit/common.sh scripts/lib/common.sh
chmod +x scripts/lib/common.sh
```

---

## Available Functions

### Logging

| Function | Use Case | Example |
|----------|----------|---------|
| `log_info` | Standard information | `log_info "Starting deployment..."` |
| `log_success` | Operation completed | `log_success "Build complete"` |
| `log_warning` | Non-fatal issues | `log_warning "Cache disabled"` |
| `log_error` | Errors (continues) | `log_error "Failed to upload file.txt"` |
| `die` | Fatal errors (exits) | `die "AWS credentials not found"` |
| `log_debug` | Debug info (DEBUG=1) | `log_debug "Using bucket: s3://example"` |
| `log_header` | Major section | `log_header "iOS Build - your-project"` |
| `log_section` | Minor section | `log_section "Step 1: Environment Validation"` |

### Error Handling

```bash
# Check required commands exist
require_command "flutter" "brew install flutter"
require_command "aws" "brew install awscli"

# Check required files exist
require_file "$REPO_ROOT/.env" "Copy .env.example to .env"

# Check required directories exist
require_directory "$IOS_DIR" "Run script from repository root"
```

### Path Utilities

```bash
# Get script directory
SCRIPT_DIR="$(get_script_dir)"

# Get repository root (finds .git directory)
REPO_ROOT="$(get_repo_root)"
```

### Platform Detection

```bash
if is_macos; then
    echo "Running on macOS"
fi

if is_linux; then
    echo "Running on Linux"
fi
```

### User Interaction

```bash
# Ask yes/no question (returns 0 for yes, 1 for no)
if ask_yes_no "Continue with deployment?" "y"; then
    deploy
fi

# Respects AUTO_YES variable for non-interactive mode
AUTO_YES=true ./script.sh  # Automatically answers yes
```

