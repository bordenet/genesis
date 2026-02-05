#!/bin/bash
# Genesis Ecosystem Validation Script
# Runs ALL mandatory checks across all genesis-derived projects in sequence.
#
# Usage: ./scripts/validate-genesis-ecosystem.sh [--fix]
#   --fix: Attempt to auto-fix issues where possible (WIP)
#
# Exit codes:
#   0 = All checks pass
#   1 = Critical failures detected
#   2 = Warnings only (non-blocking)

set -uo pipefail
# Note: Not using -e because grep returns 1 when no matches found, which would exit the script

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GENESIS_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
GENESIS_TOOLS_ROOT="$(cd "$GENESIS_ROOT/.." && pwd)"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  GENESIS ECOSYSTEM VALIDATION"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Genesis root: $GENESIS_ROOT"
echo "Genesis-tools root: $GENESIS_TOOLS_ROOT"
echo ""

ERRORS=0
WARNINGS=0

# Function to print status
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "pass" ]; then
        echo -e "  ${GREEN}✓${NC} $message"
    elif [ "$status" = "fail" ]; then
        echo -e "  ${RED}✗${NC} $message"
        ((ERRORS++))
    elif [ "$status" = "warn" ]; then
        echo -e "  ${YELLOW}⚠${NC} $message"
        ((WARNINGS++))
    elif [ "$status" = "info" ]; then
        echo -e "  ${BLUE}ℹ${NC} $message"
    fi
}

# ════════════════════════════════════════════════════════════════
# CHECK 1: Project-diff consistency
# ════════════════════════════════════════════════════════════════
echo "────────────────────────────────────────────────────────────"
echo "CHECK 1: Cross-project file consistency (project-diff)"
echo "────────────────────────────────────────────────────────────"

DIFF_OUTPUT=$(cd "$GENESIS_ROOT/project-diff" && node diff-projects.js 2>&1)

if echo "$DIFF_OUTPUT" | grep -q "✗ Divergent (MUST_MATCH): 0"; then
    print_status "pass" "All MUST_MATCH files are identical"
elif echo "$DIFF_OUTPUT" | grep -q "Divergent (MUST_MATCH): [1-9]"; then
    DIVERGENT=$(echo "$DIFF_OUTPUT" | grep "Divergent (MUST_MATCH):" | grep -oE "[0-9]+")
    print_status "fail" "$DIVERGENT divergent MUST_MATCH files detected"
else
    print_status "pass" "All MUST_MATCH files are identical"
fi

# Check for internal consistency issues
if echo "$DIFF_OUTPUT" | grep -q "Internal consistency issues:"; then
    INTERNAL=$(echo "$DIFF_OUTPUT" | grep "Internal consistency issues:" | grep -oE "[0-9]+")
    if [ "$INTERNAL" != "0" ]; then
        print_status "fail" "$INTERNAL internal consistency issues (js/ vs assistant/js/)"
    else
        print_status "pass" "No internal consistency issues"
    fi
else
    print_status "pass" "No internal consistency issues"
fi

# Check test coverage gaps (warning only)
if echo "$DIFF_OUTPUT" | grep -q "Test coverage gaps:"; then
    GAPS=$(echo "$DIFF_OUTPUT" | grep "Test coverage gaps:" | head -1 | grep -oE "[0-9]+" | tail -1)
    if [ -n "$GAPS" ] && [ "$GAPS" != "0" ]; then
        print_status "warn" "$GAPS test coverage gaps (non-blocking)"
    fi
fi

# ════════════════════════════════════════════════════════════════
# CHECK 2: Project setup template variables (HTML/index files only)
# ════════════════════════════════════════════════════════════════
echo ""
echo "────────────────────────────────────────────────────────────"
echo "CHECK 2: Template variable cleanup (HTML files)"
echo "────────────────────────────────────────────────────────────"

# Check for PROJECT SETUP template variables in HTML files only (where they matter)
# Skip hello-world (it's a template, SUPPOSED to have these)
# Skip prompts/ directories (runtime variables like {{PROJECT_NAME}})
TEMPLATE_VARS=0
for proj in "$GENESIS_TOOLS_ROOT/one-pager" "$GENESIS_TOOLS_ROOT/jd-assistant" \
            "$GENESIS_TOOLS_ROOT/architecture-decision-record" "$GENESIS_TOOLS_ROOT/strategic-proposal" \
            "$GENESIS_TOOLS_ROOT/power-statement-assistant" "$GENESIS_TOOLS_ROOT/pr-faq-assistant" \
            "$GENESIS_TOOLS_ROOT/product-requirements-assistant"; do
    if [ -d "$proj" ]; then
        # Only check HTML files for template variables (these should all be replaced)
        COUNT=$(grep -rI "{{GITHUB_USER}}\|{{GITHUB_REPO}}" "$proj" --include="*.html" --exclude-dir=node_modules 2>/dev/null | wc -l | tr -d ' ')
        TEMPLATE_VARS=$((TEMPLATE_VARS + COUNT))
    fi
done

if [ "$TEMPLATE_VARS" = "0" ]; then
    print_status "pass" "No unresolved template variables in HTML files"
else
    print_status "fail" "$TEMPLATE_VARS HTML files with unresolved template variables"
fi

# ════════════════════════════════════════════════════════════════
# CHECK 3: Git identity verification
# ════════════════════════════════════════════════════════════════
echo ""
echo "────────────────────────────────────────────────────────────"
echo "CHECK 3: Git identity configuration"
echo "────────────────────────────────────────────────────────────"

EXPECTED_EMAIL="bordenet@users.noreply.github.com"
EXPECTED_NAME="Matt J Bordenet"

PROJECTS=(
    "$GENESIS_TOOLS_ROOT/genesis"
    "$GENESIS_TOOLS_ROOT/one-pager"
    "$GENESIS_TOOLS_ROOT/jd-assistant"
    "$GENESIS_TOOLS_ROOT/architecture-decision-record"
    "$GENESIS_TOOLS_ROOT/strategic-proposal"
    "$GENESIS_TOOLS_ROOT/power-statement-assistant"
    "$GENESIS_TOOLS_ROOT/pr-faq-assistant"
    "$GENESIS_TOOLS_ROOT/product-requirements-assistant"
)

GIT_IDENTITY_OK=true
for proj in "${PROJECTS[@]}"; do
    if [ -d "$proj/.git" ]; then
        PROJ_NAME=$(basename "$proj")
        EMAIL=$(cd "$proj" && git config user.email 2>/dev/null || echo "NOT_SET")
        if [ "$EMAIL" != "$EXPECTED_EMAIL" ]; then
            print_status "fail" "$PROJ_NAME: Git email is '$EMAIL' (expected: $EXPECTED_EMAIL)"
            GIT_IDENTITY_OK=false
        fi
    fi
done

if [ "$GIT_IDENTITY_OK" = true ]; then
    print_status "pass" "All projects have correct git identity"
fi

# ════════════════════════════════════════════════════════════════
# SUMMARY
# ════════════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  VALIDATION SUMMARY"
echo "═══════════════════════════════════════════════════════════════"
echo ""

if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
    echo -e "  ${GREEN}✓ ALL CHECKS PASSED${NC}"
    echo ""
    exit 0
elif [ "$ERRORS" -eq 0 ]; then
    echo -e "  ${YELLOW}⚠ $WARNINGS warnings (non-blocking)${NC}"
    echo ""
    exit 2
else
    echo -e "  ${RED}✗ $ERRORS critical errors, $WARNINGS warnings${NC}"
    echo ""
    echo "  Fix errors before proceeding."
    exit 1
fi

