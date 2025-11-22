#!/bin/bash
#
# Genesis Validator Pre-Commit Hook
#
# This hook runs the Genesis validator before each commit to ensure
# template consistency and completeness.
#
# Installation:
#   ln -sf ../../genesis-validator/scripts/pre-commit-hook.sh .git/hooks/pre-commit
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Running Genesis Validator..."

# Check if validator binary exists
VALIDATOR_BIN="./genesis-validator/bin/genesis-validator"

if [ ! -f "$VALIDATOR_BIN" ]; then
    echo -e "${YELLOW}⚠️  Genesis validator binary not found. Building...${NC}"
    
    # Build the validator
    cd genesis-validator
    go build -o bin/genesis-validator ./cmd/genesis-validator
    cd ..
    
    if [ ! -f "$VALIDATOR_BIN" ]; then
        echo -e "${RED}❌ Failed to build genesis-validator${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Built genesis-validator${NC}"
fi

# Run the validator
if $VALIDATOR_BIN -no-prompt; then
    echo -e "${GREEN}✅ Genesis validation passed!${NC}"
    exit 0
else
    EXIT_CODE=$?
    
    if [ $EXIT_CODE -eq 1 ]; then
        echo -e "${RED}❌ Genesis validation FAILED with critical errors!${NC}"
        echo ""
        echo "Run this command to see detailed issues and get an LLM prompt for fixes:"
        echo "  ./genesis-validator/bin/genesis-validator"
        echo ""
        echo "To bypass this check (NOT RECOMMENDED), use:"
        echo "  git commit --no-verify"
        exit 1
    elif [ $EXIT_CODE -eq 2 ]; then
        echo -e "${YELLOW}⚠️  Genesis validation passed with warnings${NC}"
        echo ""
        echo "Run this command to see warnings:"
        echo "  ./genesis-validator/bin/genesis-validator"
        echo ""
        echo "Proceeding with commit..."
        exit 0
    else
        echo -e "${RED}❌ Genesis validator failed with unexpected error${NC}"
        exit 1
    fi
fi

