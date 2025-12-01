#!/bin/bash
#
# Genesis Module System Validator
# Validates that all JavaScript files use ES6 modules (not CommonJS)
#
# Usage:
#   ./scripts/validate-module-system.sh [path]
#
# Exit codes:
#   0 - All validations passed
#   1 - Validation failures found
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default path to validate
VALIDATE_PATH="${1:-.}"

echo ""
echo -e "${BLUE}🔍 Genesis Module System Validator${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Track validation status
VALIDATION_FAILED=0

# Check 1: No CommonJS require() in JavaScript files
echo -e "${BLUE}[1/4]${NC} Checking for CommonJS require() statements..."
REQUIRE_MATCHES=$(grep -rE --include="*.js" "=\s*require\(|const\s+.*require\(|let\s+.*require\(|var\s+.*require\(" "$VALIDATE_PATH" 2>/dev/null || true)

if [ -n "$REQUIRE_MATCHES" ]; then
    echo -e "${RED}❌ Found CommonJS require() statements:${NC}"
    echo "$REQUIRE_MATCHES"
    echo ""
    echo -e "${YELLOW}Fix: Replace require() with ES6 import${NC}"
    echo -e "${YELLOW}Example: import { storage } from './storage.js';${NC}"
    echo ""
    VALIDATION_FAILED=1
else
    echo -e "${GREEN}✅ No CommonJS require() found${NC}"
fi

# Check 2: No CommonJS module.exports in JavaScript files
echo -e "${BLUE}[2/4]${NC} Checking for CommonJS module.exports..."
EXPORTS_MATCHES=$(grep -r --include="*.js" "module\.exports\s*=" "$VALIDATE_PATH" 2>/dev/null || true)

if [ -n "$EXPORTS_MATCHES" ]; then
    echo -e "${RED}❌ Found CommonJS module.exports:${NC}"
    echo "$EXPORTS_MATCHES"
    echo ""
    echo -e "${YELLOW}Fix: Replace module.exports with ES6 export${NC}"
    echo -e "${YELLOW}Example: export { storage, showToast };${NC}"
    echo ""
    VALIDATION_FAILED=1
else
    echo -e "${GREEN}✅ No CommonJS module.exports found${NC}"
fi

# Check 3: Check for Node.js globals in browser code
echo -e "${BLUE}[3/6]${NC} Checking for Node.js globals (process, __dirname, etc.)..."
# Look for unguarded usage at variable declaration level (not inside guards)
# This catches: const x = process.env.FOO (bad)
# But allows: if (typeof process !== 'undefined') { return process.env.FOO } (good)
NODEJS_GLOBALS=""

# Check each JS file individually for context
for jsfile in $(find "$VALIDATE_PATH" -name "*.js" -type f 2>/dev/null); do
    # Look for direct assignment/declaration with process.env (not inside typeof guard)
    UNGUARDED=$(grep -nE "^\s*(const|let|var)\s+.*=.*process\.env\." "$jsfile" 2>/dev/null | grep -v "typeof process" || true)
    if [ -n "$UNGUARDED" ]; then
        NODEJS_GLOBALS="${NODEJS_GLOBALS}${jsfile}:${UNGUARDED}\n"
    fi

    # Look for direct assignment with __dirname or __filename
    UNGUARDED_DIR=$(grep -nE "^\s*(const|let|var)\s+.*=.*(__dirname|__filename)" "$jsfile" 2>/dev/null | grep -v "typeof __dirname" | grep -v "typeof __filename" || true)
    if [ -n "$UNGUARDED_DIR" ]; then
        NODEJS_GLOBALS="${NODEJS_GLOBALS}${jsfile}:${UNGUARDED_DIR}\n"
    fi
done

if [ -n "$NODEJS_GLOBALS" ]; then
    echo -e "${RED}❌ Found unguarded Node.js globals in browser code:${NC}"
    echo -e "$NODEJS_GLOBALS"
    echo ""
    echo -e "${YELLOW}Fix: Guard with typeof checks or use browser-safe alternatives${NC}"
    echo -e "${YELLOW}Example:${NC}"
    echo -e "${YELLOW}  // BAD: const mode = process.env.AI_MODE;${NC}"
    echo -e "${YELLOW}  // GOOD: const mode = (typeof process !== 'undefined' && process.env?.AI_MODE) || 'default';${NC}"
    echo ""
    VALIDATION_FAILED=1
else
    echo -e "${GREEN}✅ No unguarded Node.js globals found${NC}"
fi

# Check 4: Check for unreplaced template variables
echo -e "${BLUE}[4/6]${NC} Checking for unreplaced template variables..."
TEMPLATE_VARS=$(grep -r --include="*.js" --include="*.html" "{{[A-Z_]*}}" "$VALIDATE_PATH" 2>/dev/null || true)

if [ -n "$TEMPLATE_VARS" ]; then
    echo -e "${YELLOW}⚠️  Found unreplaced template variables:${NC}"
    echo "$TEMPLATE_VARS"
    echo ""
    echo -e "${YELLOW}Note: This is expected in genesis/templates/ directory${NC}"
    echo -e "${YELLOW}Fix: Replace {{TEMPLATE_VAR}} with actual values in generated projects${NC}"
    echo ""
    # Don't fail validation for template variables in templates directory
    if [[ "$VALIDATE_PATH" != *"templates"* ]]; then
        VALIDATION_FAILED=1
    fi
else
    echo -e "${GREEN}✅ No unreplaced template variables found${NC}"
fi

# Check 5: Verify ES6 import statements exist
echo -e "${BLUE}[5/6]${NC} Verifying ES6 import/export usage..."
JS_FILES=$(find "$VALIDATE_PATH" -name "*.js" -type f 2>/dev/null | wc -l | tr -d ' ')

if [ "$JS_FILES" -gt 0 ]; then
    IMPORT_COUNT=$(grep -r --include="*.js" "^import " "$VALIDATE_PATH" 2>/dev/null | wc -l | tr -d ' ')
    EXPORT_COUNT=$(grep -r --include="*.js" "^export " "$VALIDATE_PATH" 2>/dev/null | wc -l | tr -d ' ')
    
    if [ "$IMPORT_COUNT" -gt 0 ] || [ "$EXPORT_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ Found ES6 imports/exports (${IMPORT_COUNT} imports, ${EXPORT_COUNT} exports)${NC}"
    else
        echo -e "${YELLOW}⚠️  No ES6 imports/exports found in $JS_FILES JavaScript files${NC}"
        echo -e "${YELLOW}Note: This might be okay for standalone scripts${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No JavaScript files found in $VALIDATE_PATH${NC}"
fi

# Check 6: Verify GitHub footer link is properly linked
echo -e "${BLUE}[6/6]${NC} Checking for unlinked GitHub text in footer..."
HTML_FILES=$(find "$VALIDATE_PATH" -name "*.html" -type f 2>/dev/null)

if [ -n "$HTML_FILES" ]; then
    # Look for "GitHub" text that's not inside an <a> tag
    UNLINKED_GITHUB=$(echo "$HTML_FILES" | xargs grep -l "GitHub" 2>/dev/null | xargs grep -E ">GitHub<" 2>/dev/null | grep -v "<a[^>]*>GitHub<" || true)

    if [ -n "$UNLINKED_GITHUB" ]; then
        echo -e "${YELLOW}⚠️  Found unlinked 'GitHub' text in HTML:${NC}"
        echo "$UNLINKED_GITHUB"
        echo ""
        echo -e "${YELLOW}Fix: Wrap GitHub text in <a> tag linking to repository${NC}"
        echo -e "${YELLOW}Example: <a href=\"https://github.com/{{GITHUB_USER}}/{{GITHUB_REPO}}\">GitHub</a>${NC}"
        echo ""
        # Don't fail validation, just warn
    else
        echo -e "${GREEN}✅ GitHub footer links validated${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No HTML files found in $VALIDATE_PATH${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Final result
if [ $VALIDATION_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ Module system validation passed!${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Module system validation failed!${NC}"
    echo ""
    echo -e "${YELLOW}See errors above for details.${NC}"
    echo -e "${YELLOW}Reference: genesis/REFERENCE-IMPLEMENTATIONS.md (Module System section)${NC}"
    echo ""
    exit 1
fi

