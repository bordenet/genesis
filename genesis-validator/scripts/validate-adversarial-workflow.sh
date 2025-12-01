#!/usr/bin/env bash

################################################################################
# Genesis Adversarial Workflow Validator
#
# PURPOSE: Ensure apps follow the correct adversarial workflow pattern
#
# CHECKS:
# 1. No auto-generation anti-pattern (generatePhase*AI, generatePhase*Draft)
# 2. Apps generate prompts for external AI services, not auto-fill responses
# 3. Proper workflow: Generate Prompt → Copy → Paste to AI → Paste Response
#
# USAGE:
#   ./validate-adversarial-workflow.sh                    # Validate current directory
#   ./validate-adversarial-workflow.sh /path/to/project   # Validate specific directory
#
# EXIT CODES:
#   0 = All checks passed
#   1 = Validation failed
#   2 = Invalid usage
#
# REFERENCE:
#   See: GENESIS-RETROSPECTIVE-ADVERSARIAL-WORKFLOW.md
#
################################################################################

set -uo pipefail  # Removed -e to handle grep failures gracefully

# Color codes for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
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
    echo -e "${GREEN}✓${NC} $1"
}

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

################################################################################
# Validation Checks
################################################################################

echo ""
echo "🔍 Validating Adversarial Workflow Pattern..."
echo ""

# Determine JS directory
JS_DIR="$TARGET_DIR/js"
if [[ -d "$TARGET_DIR/docs/js" ]]; then
    JS_DIR="$TARGET_DIR/docs/js"
fi

if [[ ! -d "$JS_DIR" ]]; then
    log_info "No JavaScript directory found - skipping adversarial workflow validation"
    exit 0
fi

# Check 1: No auto-generation anti-pattern
echo "Checking for auto-generation anti-pattern..."

AUTO_GEN_PATTERNS=(
    "generatePhase.*AI\("
    "generatePhase.*Draft\("
    "generatePhase.*Review\("
    "generateADR\("
    "synthesizeADR\("
    "autoFillResponse\("
    "autoGenerateResponse\("
)

FOUND_ANTI_PATTERN=0

for pattern in "${AUTO_GEN_PATTERNS[@]}"; do
    if grep -rE --include="*.js" "$pattern" "$JS_DIR" >/dev/null 2>&1; then
        if [[ $FOUND_ANTI_PATTERN -eq 0 ]]; then
            log_error "Found auto-generation anti-pattern in JavaScript files"
            echo ""
            echo "  Apps should generate PROMPTS for external AI services,"
            echo "  not auto-fill AI responses."
            echo ""
            echo "  Files with anti-pattern:"
            FOUND_ANTI_PATTERN=1
        fi
        grep -rn --include="*.js" -E "$pattern" "$JS_DIR" | sed 's/^/    /' || true
    fi
done

if [[ $FOUND_ANTI_PATTERN -eq 0 ]]; then
    log_success "No auto-generation anti-pattern found"
fi

# Check 2: Verify correct pattern exists (prompt generation)
echo "Checking for correct prompt generation pattern..."

CORRECT_PATTERNS=(
    "generatePhase.*Prompt\("
    "generatePromptForPhase\("
    "loadPrompt\("
)

FOUND_CORRECT_PATTERN=0

for pattern in "${CORRECT_PATTERNS[@]}"; do
    if grep -rE --include="*.js" "$pattern" "$JS_DIR" >/dev/null 2>&1; then
        FOUND_CORRECT_PATTERN=1
        break
    fi
done

if [[ $FOUND_CORRECT_PATTERN -eq 1 ]]; then
    log_success "Found correct prompt generation pattern"
else
    log_warning "No prompt generation pattern found - verify app generates prompts for external AI"
fi

# Check 3: Verify UI has copy prompt workflow
echo "Checking for copy prompt workflow in UI..."

if grep -rE --include="*.js" "Copy Prompt|copy-prompt|copyPrompt" "$JS_DIR" >/dev/null 2>&1; then
    log_success "Found copy prompt workflow in UI"
else
    log_warning "No copy prompt workflow found - verify UI has 'Copy Prompt to Clipboard' button"
fi

################################################################################
# Summary
################################################################################

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [[ $ERRORS -gt 0 ]]; then
    echo -e "${RED}✗ Adversarial workflow validation FAILED${NC}"
    echo ""
    echo "  Errors: $ERRORS"
    echo "  Warnings: $WARNINGS"
    echo ""
    echo "📖 Reference: GENESIS-RETROSPECTIVE-ADVERSARIAL-WORKFLOW.md"
    echo ""
    echo "🔧 How to fix:"
    echo ""
    echo "  WRONG (auto-fill AI responses):"
    echo "    async generatePhase1AI() {"
    echo "      const result = await callAI(prompt);"
    echo "      textarea.value = result;  // ❌ Auto-fill"
    echo "    }"
    echo ""
    echo "  CORRECT (generate prompts for external AI):"
    echo "    async generatePhase1Prompt() {"
    echo "      const prompt = await loadPrompt(1);"
    echo "      displayPromptWithCopyButton(prompt);  // ✅ User copies to Claude.ai"
    echo "    }"
    echo ""
    exit 1
elif [[ $WARNINGS -gt 0 ]]; then
    echo -e "${YELLOW}⚠ Adversarial workflow validation passed with warnings${NC}"
    echo ""
    echo "  Warnings: $WARNINGS"
    echo ""
    exit 0
else
    echo -e "${GREEN}✓ Adversarial workflow validation PASSED${NC}"
    echo ""
    echo "  All checks passed!"
    echo ""
    exit 0
fi
