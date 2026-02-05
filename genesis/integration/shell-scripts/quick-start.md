# Shell Scripts: Quick Start & File Structure

> Part of [Shell Script Standards](../SHELL_SCRIPT_STANDARDS.md)

---

## Quick Start

**Minimum Viable Script**:

```bash
#!/usr/bin/env bash

################################################################################
# your-project <Script Purpose>
################################################################################
# PURPOSE: <One sentence description>
#   - <Key responsibility 1>
#   - <Key responsibility 2>
#
# USAGE:
#   ./<script-name> [options]
#
# EXAMPLES:
#   ./<script-name> --example-flag
#
# DEPENDENCIES:
#   - Tool 1
#   - Tool 2
################################################################################

# Source common library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh" || source "$SCRIPT_DIR/../lib/common.sh"
init_script

# Script-specific variables
readonly SCRIPT_NAME="$(basename "$0")"
readonly REPO_ROOT="$(get_repo_root)"

# Main function
main() {
    log_header "Script Name"

    log_section "Step 1: Description"
    # Do work
    log_success "Step 1 complete"

    log_success "All operations completed successfully"
}

main "$@"
```

---

## Header Template

**Every script must start with this structure**:

```bash
#!/usr/bin/env bash

################################################################################
# your-project <Script Purpose>
################################################################################
# PURPOSE: <One sentence description>
#   - <Key responsibility 1>
#   - <Key responsibility 2>
#
# USAGE:
#   ./<script-name> [options]
#   ./<script-name> --help
#
# EXAMPLES:
#   ./<script-name> --dev --run
#   ./<script-name> --prod --release
#
# DEPENDENCIES:
#   - flutter (brew install flutter)
#   - aws-cli (brew install awscli)
################################################################################

# Source common library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/common.sh" || die "Cannot load common library"

# Initialize script (sets up error handling, traps)
init_script

# Script-specific variables
readonly SCRIPT_NAME="$(basename "$0")"
readonly REPO_ROOT="$(get_repo_root)"
```

---

## Main Script Body

```bash
# Parse arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help|-h)
                print_usage
                exit 0
                ;;
            --option)
                OPTION_VALUE="$2"
                shift 2
                ;;
            *)
                die "Unknown option: $1 (use --help for usage)"
                ;;
        esac
    done
}

# Print usage information
print_usage() {
    cat << EOF
Usage: $SCRIPT_NAME [OPTIONS]

Description:
    <Script description>

Options:
    -h, --help         Show this help message
    --option VALUE     Description of option

Examples:
    $SCRIPT_NAME --option value
EOF
}

# Main function
main() {
    log_header "Script Name"

    log_section "Step 1: Description"
    # Do work
    log_success "Step 1 complete"

    log_section "Step 2: Description"
    # Do work
    log_success "Step 2 complete"

    log_success "All operations completed successfully"
}

# Run main function
parse_arguments "$@"
main
```

