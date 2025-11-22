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

# Check 1: Validate internal markdown links
echo "📝 Checking internal markdown links..."
while IFS= read -r file; do
    # Extract markdown links [text](path)
    grep -oP '\[.*?\]\(\K[^)]+' "$file" 2>/dev/null | while read -r link; do
        # Skip external links
        if [[ "$link" =~ ^https?:// ]]; then
            continue
        fi
        
        # Skip anchors
        if [[ "$link" =~ ^# ]]; then
            continue
        fi
        
        # Resolve relative path
        dir=$(dirname "$file")
        target="$dir/$link"
        
        # Check if target exists
        if [[ ! -e "$target" ]]; then
            error "Broken link in $file: $link (target: $target)"
        fi
    done
done < <(find genesis -name "*.md" -o -name "README.md")

# Check 2: Validate coverage threshold consistency
echo ""
echo "📊 Checking coverage threshold consistency..."

# Find all jest.config files
JEST_CONFIGS=$(find genesis -name "jest.config*.js" -o -name "jest.config*.json")

for config in $JEST_CONFIGS; do
    if grep -q "statements.*70" "$config"; then
        warning "Found 70% threshold in $config (should be 85%)"
    fi
    if grep -q "branches.*50" "$config"; then
        warning "Found 50% branch threshold in $config (should be 80%)"
    fi
done

# Check documentation claims
if grep -r "≥70%" genesis/ README.md 2>/dev/null | grep -v "scripts/validate" > /dev/null; then
    warning "Found ≥70% coverage claims in documentation (should be ≥85%)"
fi

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

if [[ -f "genesis/START-HERE.md" ]]; then
    # Extract file paths mentioned in START-HERE.md
    grep -oP '`[^`]+\.(md|js|json|sh|yml)`' genesis/START-HERE.md | tr -d '`' | while read -r file; do
        if [[ ! -f "genesis/$file" ]] && [[ ! -f "$file" ]]; then
            error "START-HERE.md references missing file: $file"
        fi
    done
fi

# Check 5: Validate template variable consistency
echo ""
echo "🔧 Checking template variable consistency..."

# Find all template files
TEMPLATES=$(find genesis/templates -name "*-template.*" 2>/dev/null)

for template in $TEMPLATES; do
    # Check for undefined variables ({{VAR}} format)
    VARS=$(grep -oP '\{\{[A-Z_]+\}\}' "$template" 2>/dev/null | sort -u)
    
    # Common expected variables
    EXPECTED_VARS="PROJECT_NAME PROJECT_TITLE PROJECT_DESCRIPTION DEPLOY_FOLDER PHASE_COUNT"
    
    for var in $VARS; do
        var_name=$(echo "$var" | tr -d '{}')
        if ! echo "$EXPECTED_VARS" | grep -q "$var_name"; then
            warning "Uncommon template variable in $template: $var"
        fi
    done
done

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

