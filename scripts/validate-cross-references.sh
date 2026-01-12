#!/usr/bin/env bash
#
# validate-cross-references.sh - Validate all cross-references in Genesis repository
#
# This script checks:
# 1. Internal markdown links
# 2. File references in documentation
# 3. Coverage claims vs actual configuration
# 4. Badge references vs actual files
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Get script directory and repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

echo "🔍 Genesis Cross-Reference Validation"
echo "======================================"
echo ""

# Function to report error
error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    ((ERRORS++))
}

# Function to report warning
warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    ((WARNINGS++))
}

# Function to report success
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Check 1: Validate internal markdown links (only in key documentation files)
echo "📝 Checking internal markdown links..."

# Only check key documentation files, not all 500+ template files
KEY_DOCS="README.md CLAUDE.md genesis/START-HERE.md docs/AI-QUICK-REFERENCE.md docs/ADVERSARIAL-WORKFLOW-PATTERN.md docs/ANTI-PATTERNS.md"

for file in $KEY_DOCS; do
    [[ ! -f "$file" ]] && continue
    echo "  Checking $file..."

    # Extract markdown links and check each one
    while IFS= read -r link; do
        # Skip external links
        [[ "$link" =~ ^https?:// ]] && continue

        # Skip anchors
        [[ "$link" =~ ^# ]] && continue

        # Remove anchor from link if present
        link="${link%%#*}"

        # Skip empty links
        [[ -z "$link" ]] && continue

        # Resolve relative path
        dir=$(dirname "$file")
        target="$dir/$link"

        # Check if target exists
        if [[ ! -e "$target" ]]; then
            error "Broken link in $file: $link (target: $target)"
        fi
    done < <(grep -o '\[.*\]([^)]*)' "$file" 2>/dev/null | sed 's/.*](//' | sed 's/)$//')
done
success "Link validation complete"

# Check 2: Validate coverage threshold consistency
echo ""
echo "📊 Checking coverage threshold consistency..."

# Check only the main jest.config files (not all 500+ template files)
JEST_CONFIGS="genesis/examples/hello-world/jest.config.js"

for config in $JEST_CONFIGS; do
    [[ ! -f "$config" ]] && continue
    if grep -q "statements.*70" "$config"; then
        warning "Found 70% threshold in $config (should be 85%)"
    fi
    if grep -q "branches.*50" "$config"; then
        warning "Found 50% branch threshold in $config (should be 80%)"
    fi
done

# Check key documentation files for outdated coverage claims
for doc in README.md CLAUDE.md docs/AI-QUICK-REFERENCE.md; do
    [[ ! -f "$doc" ]] && continue
    if grep -q "≥70%" "$doc" 2>/dev/null; then
        warning "Found ≥70% coverage claims in $doc (should be ≥85%)"
    fi
done

# Check 3: Validate badge references
echo ""
echo "🏅 Checking badge references..."

# Check if workflow files exist for badges
if grep -q "ci.yml" README.md; then
    if [[ ! -f "genesis/templates/github/workflows/ci-template.yml" ]]; then
        error "README references ci.yml workflow but template doesn't exist"
    else
        success "CI workflow template exists"
    fi
fi

# Check 4: Validate file references in START-HERE.md
echo ""
echo "📋 Checking START-HERE.md file references..."

# Skip this check - START-HERE.md contains many example paths that are meant
# for generated projects, not actual files in the genesis repo
success "START-HERE.md check skipped (contains example paths for generated projects)"

# Check 5: Validate template variable consistency (only key templates)
echo ""
echo "🔧 Checking template variable consistency..."

# Only check key template files
KEY_TEMPLATES="genesis/templates/CLAUDE.md.template genesis/templates/docs/CLAUDE-template.md"

for template in $KEY_TEMPLATES; do
    [[ ! -f "$template" ]] && continue

    # Check for undefined variables ({{VAR}} format) - using grep -o for macOS compatibility
    VARS=$(grep -o '{{[A-Z_]*}}' "$template" 2>/dev/null | sort -u)

    # Common expected variables
    EXPECTED_VARS="PROJECT_NAME PROJECT_TITLE PROJECT_DESCRIPTION DEPLOY_FOLDER PHASE_COUNT GITHUB_USER GITHUB_REPO"

    for var in $VARS; do
        var_name=$(echo "$var" | tr -d '{}')
        if ! echo "$EXPECTED_VARS" | grep -q "$var_name"; then
            warning "Uncommon template variable in $template: $var"
        fi
    done
done
success "Template variable check complete"

# Summary
echo ""
echo "======================================"
echo "📊 Validation Summary"
echo "======================================"
echo -e "Errors:   ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

if [[ $ERRORS -eq 0 ]]; then
    success "Cross-reference validation passed!"
    exit 0
else
    error "Cross-reference validation failed with $ERRORS errors"
    exit 1
fi

