# Shell Scripts: Examples & Anti-Patterns

> Part of [Shell Script Standards](../SHELL_SCRIPT_STANDARDS.md)

---

## Minimal Script

```bash
#!/usr/bin/env bash

################################################################################
# your-project Hello World
################################################################################
# PURPOSE: Example script demonstrating standardized style
################################################################################

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"
init_script

main() {
    log_header "Hello World Example"
    log_info "Hello from your-project!"
    log_success "Example complete"
}

main "$@"
```

---

## Full-Featured Script

See [examples-full-script.md](./examples-full-script.md) for a complete deployment script example (~90 lines).

---

## Anti-Patterns

### Never Do This

```bash
# ❌ Don't use raw echo with color codes
echo -e "\033[0;32mSuccess\033[0m"

# ❌ Don't use cd without validation
cd ../../recipe_archive

# ❌ Don't ignore errors
flutter build ios || true

# ❌ Don't use unclear variable names
x="debug"
tmp="/tmp/build"

# ❌ Don't use magic numbers
sleep 5  # Why 5 seconds?

# ❌ Don't duplicate common code
RED='\033[0;31m'
GREEN='\033[0;32m'
# (Use common library instead)
```

---

## Customization for Your Project

**To adopt for your project**:

1. Copy `common.sh` to `scripts/lib/common.sh`
2. Update project name in headers (change "your-project" to your project name)
3. Add project-specific helper functions to `common.sh`
4. Create script templates in your docs/
5. Enforce standards in code reviews

**Project-Specific Extensions**:

```bash
# Add to scripts/lib/project-helpers.sh

# Project-specific validation
validate_project_config() {
    require_file "$REPO_ROOT/config/app.yaml"
    # ... more checks
}

# Project-specific deployment
deploy_to_production() {
    log_section "Deploying to Production"
    # ... deployment logic
}
```

---

**Remember**: Consistent shell scripts are maintainable shell scripts. Use the common library religiously.

