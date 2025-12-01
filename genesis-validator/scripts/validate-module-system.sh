#!/usr/bin/env bash

################################################################################
# Genesis Module System Validator
#
# PURPOSE: Catch module system mismatches BEFORE they cause runtime failures
#
# CHECKS:
# 1. No CommonJS exports (module.exports)
# 2. No require() calls in browser code
# 3. No unreplaced {{TEMPLATE_VARIABLES}}
# 4. Event listeners properly attached in UI modules
#
# USAGE:
#   ./validate-module-system.sh                    # Validate current directory
#   ./validate-module-system.sh /path/to/project   # Validate specific directory
#
# EXIT CODES:
#   0 = All checks passed
#   1 = Validation failed
#   2 = Invalid usage
#
################################################################################

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="${1:-.}"
ERRORS=0
WARNINGS=0

# Ensure target directory exists
if [[ ! -d "$TARGET_DIR" ]]; then
    echo -e "${RED}✗ ERROR${NC}: Directory not found: $TARGET_DIR" >&2
    exit 2
fi

################################################################################
# Helper Functions
################################################################################

log_error() {
    echo -e "${RED}✗ ERROR${NC}: $1" >&2
    ((ERRORS++))
}

log_warning() {
    echo -e "${YELLOW}⚠ WARNING${NC}: $1" >&2
    ((WARNINGS++))
}

log_success() {
    echo -e "${GREEN}✓ PASS${NC}: $1"
}

log_info() {
    echo -e "${BLUE}ℹ INFO${NC}: $1"
}

################################################################################
# Check 1: No CommonJS exports (module.exports)
################################################################################

check_no_commonjs_exports() {
    log_info "Checking for CommonJS exports..."
    
    if [[ ! -d "$TARGET_DIR/js" ]]; then
        log_warning "No 'js' directory found - skipping module export check"
        return 0
    fi
    
    # Search for module.exports in JavaScript files
    # Exclude node_modules, templates, and vendor directories
    # Match actual code, not comments
    local matches
    matches=$(find "$TARGET_DIR/js" -type f -name "*.js" \
        -not -name "*-template.js" \
        -not -path "*/node_modules/*" \
        -not -path "*/.git/*" \
        -exec grep -l "^[^/]*module\.exports" {} \; 2>/dev/null || true)
    
    if [[ -n "$matches" ]]; then
        log_error "Found CommonJS exports (module.exports) - must use ES6 export:"
        while IFS= read -r file; do
            grep -n "^[^/]*module\.exports" "$file" | head -3 | while IFS=: read -r line_num line_content; do
                echo -e "  ${RED}$file:$line_num${NC} - $line_content"
            done
        done <<< "$matches"
        echo ""
        echo "  FIX: Replace 'module.exports = { ... }' with 'export { ... }'"
        echo "  FIX: Replace 'module.exports = Class' with 'export class Class { ... }'"
        return 1
    fi
    
    log_success "No CommonJS exports found"
    return 0
}

################################################################################
# Check 2: No require() calls in browser code
################################################################################

check_no_require_calls() {
    log_info "Checking for CommonJS require() calls..."
    
    if [[ ! -d "$TARGET_DIR/js" ]]; then
        log_warning "No 'js' directory found - skipping require() check"
        return 0
    fi
    
    # Search for require() calls in JavaScript files
    # Exclude node_modules, test files, and vendor directories
    local matches
    matches=$(find "$TARGET_DIR/js" -type f -name "*.js" \
        -not -path "*/node_modules/*" \
        -not -path "*/.git/*" \
        -exec grep -l "require(" {} \; 2>/dev/null || true)
    
    if [[ -n "$matches" ]]; then
        log_error "Found CommonJS require() calls - must use ES6 import:"
        while IFS= read -r file; do
            grep -n "require(" "$file" | head -3 | while IFS=: read -r line_num line_content; do
                echo -e "  ${RED}$file:$line_num${NC} - $line_content"
            done
        done <<< "$matches"
        echo ""
        echo "  FIX: Replace 'const { x } = require(\"./file\")' with 'import { x } from \"./file.js\"'"
        echo "  FIX: Make sure files have .js extension in imports"
        return 1
    fi
    
    log_success "No require() calls found"
    return 0
}

################################################################################
# Check 3: No unreplaced {{TEMPLATE_VARIABLES}}
################################################################################

check_no_template_variables() {
    log_info "Checking for unreplaced {{TEMPLATE_VARIABLES}}..."
    
    if [[ ! -d "$TARGET_DIR" ]]; then
        log_warning "Target directory not found"
        return 0
    fi
    
    # Search for unreplaced template variables (e.g., {{PROJECT_TITLE}})
    # Look in common project files, but EXCLUDE -template.* files
    local matches
    matches=$(find "$TARGET_DIR" \
        -type f \( -name "*.js" -o -name "*.html" -o -name "*.css" \) \
        -not -name "*-template.*" \
        -not -path "*/node_modules/*" \
        -not -path "*/.git/*" \
        -not -path "*/coverage/*" \
        -not -path "*/genesis/*" \
        -not -path "*/docs/*" \
        -exec grep -l "{{[A-Z_]*}}" {} \; 2>/dev/null || true)
    
    if [[ -n "$matches" ]]; then
        log_error "Found unreplaced {{TEMPLATE_VARIABLES}} - all must be replaced before deploy:"
        while IFS= read -r file; do
            grep -n "{{[A-Z_]*}}" "$file" | head -3 | while IFS=: read -r line_num line_content; do
                echo -e "  ${RED}$file:$line_num${NC} - $line_content"
            done
        done <<< "$matches"
        return 1
    fi
    
    log_success "No unreplaced template variables found"
    return 0
}

################################################################################
# Check 4: Event listeners properly defined
################################################################################

check_event_listeners() {
    log_info "Checking for event listener setup..."
    
    if [[ ! -f "$TARGET_DIR/js/ui.js" && ! -f "$TARGET_DIR/js/app.js" ]]; then
        log_warning "No ui.js or app.js found - skipping event listener check"
        return 0
    fi
    
    local has_listeners=0
    
    # Check for addEventListener in ui.js if it exists
    if [[ -f "$TARGET_DIR/js/ui.js" ]]; then
        if grep -q "addEventListener" "$TARGET_DIR/js/ui.js" 2>/dev/null; then
            has_listeners=1
        fi
    fi
    
    # Check for addEventListener in app.js if it exists
    if [[ -f "$TARGET_DIR/js/app.js" ]]; then
        if grep -q "addEventListener" "$TARGET_DIR/js/app.js" 2>/dev/null; then
            has_listeners=1
        fi
    fi
    
    # Check for event listener setup in any JS file
    if find "$TARGET_DIR/js" -type f -name "*.js" -exec grep -q "addEventListener" {} \; 2>/dev/null; then
        has_listeners=1
    fi
    
    if [[ $has_listeners -eq 0 ]]; then
        log_warning "No addEventListener() calls found - buttons may not work"
        echo "  FIX: Ensure event listeners are attached to DOM elements"
        echo "  FIX: Example: document.getElementById('btn').addEventListener('click', handleClick)"
        return 0
    fi
    
    log_success "Event listeners appear to be properly set up"
    return 0
}

################################################################################
# Check 5: HTML has type="module" on scripts
################################################################################

check_html_module_type() {
    log_info "Checking for type='module' on script tags..."
    
    if [[ ! -f "$TARGET_DIR/index.html" ]]; then
        log_warning "No index.html found - skipping HTML module type check"
        return 0
    fi
    
    # Count script tags with type="module"
    local module_scripts
    module_scripts=$(grep -c 'type="module"' "$TARGET_DIR/index.html" || true)
    
    if [[ $module_scripts -eq 0 ]]; then
        log_warning "No type='module' found on any script tags"
        echo "  FIX: Add type='module' to all <script src='js/...'> tags"
        echo "  FIX: Example: <script type='module' src='js/app.js'></script>"
        return 0
    fi
    
    log_success "HTML script tags have type='module' attribute"
    return 0
}

################################################################################
# Main Validation
################################################################################

main() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║          Genesis Module System Validator                       ║"
    echo "║                                                                ║"
    echo "║  Checking: $(realpath "$TARGET_DIR")"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    
    local failed=0
    
    # Run all checks
    check_no_commonjs_exports || failed=1
    echo ""
    
    check_no_require_calls || failed=1
    echo ""
    
    check_no_template_variables || failed=1
    echo ""
    
    check_event_listeners || true
    echo ""
    
    check_html_module_type || true
    echo ""
    
    # Summary
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                      Validation Summary                        ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    
    if [[ $ERRORS -eq 0 ]]; then
        echo -e "${GREEN}✓ All critical checks passed!${NC}"
        if [[ $WARNINGS -gt 0 ]]; then
            echo -e "${YELLOW}⚠ $WARNINGS warning(s) found - review above${NC}"
        fi
        echo ""
        return 0
    else
        echo -e "${RED}✗ $ERRORS error(s) found - please fix above${NC}"
        echo ""
        return 1
    fi
}

# Run main validation
main "$@"
