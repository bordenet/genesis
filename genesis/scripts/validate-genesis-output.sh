#!/usr/bin/env bash
#
# validate-genesis-output.sh
#
# Validates that a project created from Genesis templates is complete
# and ready for production. Run this BEFORE your first commit!
#
# Usage: ./genesis/scripts/validate-genesis-output.sh
#
# Exit codes:
#   0 - All checks passed
#   1 - One or more checks failed
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

echo "═══════════════════════════════════════════════════════════════"
echo "  Genesis Output Validation"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Function to check for file existence
check_file() {
    local file="$1"
    local priority="$2"
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file exists"
    else
        if [ "$priority" = "CRITICAL" ]; then
            echo -e "${RED}✗ CRITICAL: $file is missing!${NC}"
            ((ERRORS++))
        else
            echo -e "${YELLOW}⚠ WARNING: $file is missing${NC}"
            ((WARNINGS++))
        fi
    fi
}

# Function to check for directory existence
check_dir() {
    local dir="$1"
    local priority="$2"
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $dir/ directory exists"
    else
        if [ "$priority" = "CRITICAL" ]; then
            echo -e "${RED}✗ CRITICAL: $dir/ directory is missing!${NC}"
            ((ERRORS++))
        else
            echo -e "${YELLOW}⚠ WARNING: $dir/ directory is missing${NC}"
            ((WARNINGS++))
        fi
    fi
}

echo "📁 Checking required files..."
echo "───────────────────────────────────────────────────────────────"

# Critical files that MUST exist
check_file "README.md" "CRITICAL"
check_file ".gitignore" "CRITICAL"
check_file "package.json" "CRITICAL"
check_file "index.html" "CRITICAL"
check_file "LICENSE" "CRITICAL"

# Documentation (CRITICAL for consistency)
check_file "docs/CLAUDE.md" "CRITICAL"
check_file "docs/DESIGN-PATTERNS.md" "CRITICAL"
check_file "docs/UI_STYLE_GUIDE.md" "HIGH"
check_file "CONTRIBUTING.md" "HIGH"

# Configuration files
check_file "jest.config.js" "CRITICAL"
check_file "jest.setup.js" "CRITICAL"
check_file "eslint.config.js" "HIGH"
check_file "codecov.yml" "HIGH"

# Directories
check_dir "scripts" "CRITICAL"
check_dir "js" "CRITICAL"
check_dir "css" "CRITICAL"
check_dir "prompts" "CRITICAL"
check_dir "tests" "CRITICAL"
check_dir ".github/workflows" "CRITICAL"

# Scripts
check_file "scripts/setup-macos.sh" "CRITICAL"
check_file "scripts/deploy-web.sh" "CRITICAL"
check_file "scripts/lib/common.sh" "HIGH"

# CI/CD
check_file ".github/workflows/ci.yml" "CRITICAL"

# Prompts (3-phase workflow)
check_file "prompts/phase1.md" "CRITICAL"
check_file "prompts/phase2.md" "CRITICAL"
check_file "prompts/phase3.md" "CRITICAL"

# Core JS files
check_file "js/workflow.js" "CRITICAL"
check_file "js/storage.js" "HIGH"
check_file "js/app.js" "HIGH"

echo ""
echo "🚫 Checking genesis/ directory is deleted..."
echo "───────────────────────────────────────────────────────────────"

if [ -d "genesis" ]; then
    echo -e "${RED}✗ CRITICAL: genesis/ directory still exists!${NC}"
    echo -e "${RED}  Run: rm -rf genesis/ && git add . && git commit -m 'Remove genesis'${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✓${NC} genesis/ directory has been deleted"
fi

echo ""
echo "🔍 Checking for unreplaced template variables..."
echo "───────────────────────────────────────────────────────────────"

# Check for unreplaced {{VARIABLES}}
UNREPLACED=$(grep -r "{{" . --include="*.md" --include="*.js" --include="*.json" --include="*.html" --include="*.yml" --include="*.sh" \
    --exclude-dir=node_modules --exclude-dir=genesis --exclude-dir=.git 2>/dev/null || true)

if [ -n "$UNREPLACED" ]; then
    echo -e "${RED}✗ CRITICAL: Found unreplaced template variables:${NC}"
    echo "$UNREPLACED" | head -20
    ((ERRORS++))
else
    echo -e "${GREEN}✓${NC} No unreplaced {{VARIABLES}} found"
fi

echo ""
echo "📄 Checking README.md is not a stub..."
echo "───────────────────────────────────────────────────────────────"

if [ -f "README.md" ]; then
    README_LINES=$(wc -l < README.md | tr -d ' ')
    if [ "$README_LINES" -lt 50 ]; then
        echo -e "${RED}✗ CRITICAL: README.md is too short ($README_LINES lines)${NC}"
        echo -e "${RED}  A proper README should have 50+ lines${NC}"
        ((ERRORS++))
    else
        echo -e "${GREEN}✓${NC} README.md has $README_LINES lines"
    fi
fi

echo ""
echo "📋 Checking CLAUDE.md has deployment policy..."
echo "───────────────────────────────────────────────────────────────"

if [ -f "docs/CLAUDE.md" ]; then
    if grep -q "CI to pass" docs/CLAUDE.md 2>/dev/null || grep -q "CI Passes" docs/CLAUDE.md 2>/dev/null; then
        echo -e "${GREEN}✓${NC} CLAUDE.md contains deployment policy"
    else
        echo -e "${YELLOW}⚠ WARNING: CLAUDE.md may be missing deployment policy${NC}"
        ((WARNINGS++))
    fi
fi

echo ""
echo "🧪 Checking test configuration..."
echo "───────────────────────────────────────────────────────────────"

if [ -f "jest.config.js" ]; then
    if grep -q "coverageThreshold" jest.config.js 2>/dev/null; then
        echo -e "${GREEN}✓${NC} jest.config.js has coverage thresholds"
    else
        echo -e "${YELLOW}⚠ WARNING: jest.config.js missing coverage thresholds${NC}"
        ((WARNINGS++))
    fi
fi

if [ -f "package.json" ]; then
    if grep -q '"test:coverage"' package.json 2>/dev/null; then
        echo -e "${GREEN}✓${NC} package.json has test:coverage script"
    else
        echo -e "${RED}✗ CRITICAL: package.json missing test:coverage script${NC}"
        ((ERRORS++))
    fi
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  SUMMARY"
echo "═══════════════════════════════════════════════════════════════"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Project is ready.${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found. Review and fix if needed.${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS critical error(s) and $WARNINGS warning(s) found.${NC}"
    echo -e "${RED}   FIX THESE ISSUES BEFORE COMMITTING!${NC}"
    exit 1
fi

