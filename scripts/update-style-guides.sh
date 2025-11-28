#!/usr/bin/env bash
################################################################################
# Script Name: update-style-guides.sh
################################################################################
# PURPOSE: Check and update style guides from upstream repositories
# USAGE: ./scripts/update-style-guides.sh [-v|--verbose] [-f|--force]
# PLATFORM: macOS, Linux
################################################################################

set -euo pipefail

# Resolve symlinks to get actual script location
SCRIPT_PATH="${BASH_SOURCE[0]}"
while [ -L "$SCRIPT_PATH" ]; do
    SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
    SCRIPT_PATH="$(readlink "$SCRIPT_PATH")"
    [[ "$SCRIPT_PATH" != /* ]] && SCRIPT_PATH="$SCRIPT_DIR/$SCRIPT_PATH"
done
SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

################################################################################
# Constants
################################################################################

readonly VERSION="1.0.0"
readonly SHELL_STYLE_GUIDE_URL="https://raw.githubusercontent.com/bordenet/scripts/main/STYLE_GUIDE.md"
readonly LOCAL_SHELL_STYLE_GUIDE="$REPO_ROOT/docs/SHELL_SCRIPT_STYLE_GUIDE.md"
readonly TEMPLATE_SHELL_STYLE_GUIDE="$REPO_ROOT/genesis/templates/docs/SHELL_SCRIPT_STYLE_GUIDE-template.md"

VERBOSE=false
FORCE=false

################################################################################
# Functions
################################################################################

log_info() {
    [[ "$VERBOSE" != "true" ]] && return 0
    echo "[INFO] $*"
}

log_success() {
    echo "✅ $*"
}

log_warning() {
    echo "⚠️  $*"
}

log_error() {
    echo "❌ $*" >&2
}

show_help() {
    cat << EOF
NAME
    update-style-guides.sh - Check and update style guides from upstream (v$VERSION)

SYNOPSIS
    update-style-guides.sh [OPTIONS]

DESCRIPTION
    Checks if local style guides are current compared to upstream repositories.
    If a newer version is available, downloads and updates both the local copy
    and the genesis template.

    Currently supports:
    - Shell Script Style Guide from bordenet/scripts

OPTIONS
    -h, --help      Display this help message
    -v, --verbose   Show detailed output
    -f, --force     Force update even if versions match

EXAMPLES
    update-style-guides.sh              # Check and update if needed
    update-style-guides.sh -v           # Verbose output
    update-style-guides.sh -f           # Force update

EXIT STATUS
    0   Success (no update needed or update completed)
    1   Error occurred

EOF
}

extract_version() {
    local file="$1"
    grep -E "^Version:" "$file" 2>/dev/null | head -1 | sed 's/Version:[[:space:]]*//' || echo "unknown"
}

check_shell_style_guide() {
    log_info "Checking Shell Script Style Guide..."

    # Download upstream version to temp file
    local temp_file=""
    temp_file=$(mktemp)
    # shellcheck disable=SC2064
    trap "rm -f '$temp_file'" RETURN
    
    if ! curl -fsSL "$SHELL_STYLE_GUIDE_URL" -o "$temp_file" 2>/dev/null; then
        log_error "Failed to fetch upstream style guide from $SHELL_STYLE_GUIDE_URL"
        return 1
    fi
    
    local upstream_version
    upstream_version=$(extract_version "$temp_file")
    log_info "Upstream version: $upstream_version"
    
    local local_version="not found"
    if [[ -f "$LOCAL_SHELL_STYLE_GUIDE" ]]; then
        local_version=$(extract_version "$LOCAL_SHELL_STYLE_GUIDE")
    fi
    log_info "Local version: $local_version"
    
    if [[ "$FORCE" == "true" ]] || [[ "$upstream_version" != "$local_version" ]]; then
        log_info "Updating Shell Script Style Guide..."
        
        # Update local copy
        cp "$temp_file" "$LOCAL_SHELL_STYLE_GUIDE"
        log_success "Updated $LOCAL_SHELL_STYLE_GUIDE (v$local_version → v$upstream_version)"
        
        # Update template copy
        if [[ -d "$(dirname "$TEMPLATE_SHELL_STYLE_GUIDE")" ]]; then
            cp "$temp_file" "$TEMPLATE_SHELL_STYLE_GUIDE"
            log_success "Updated $TEMPLATE_SHELL_STYLE_GUIDE"
        fi
        
        return 0
    else
        log_success "Shell Script Style Guide is current (v$local_version)"
        return 0
    fi
}

################################################################################
# Main
################################################################################

main() {
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -h|--help) show_help; exit 0 ;;
            -v|--verbose) VERBOSE=true; shift ;;
            -f|--force) FORCE=true; shift ;;
            *) log_error "Unknown option: $1. Use --help for usage."; exit 1 ;;
        esac
    done
    
    cd "$REPO_ROOT"
    
    echo "🔄 Checking style guides for updates..."
    echo ""
    
    check_shell_style_guide
    
    echo ""
    echo "Done."
}

main "$@"

