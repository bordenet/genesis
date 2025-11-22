#!/bin/bash
#
# Install Genesis Validator Pre-Commit Hook
# This script installs the Genesis validator as a git pre-commit hook
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}🔧 Installing Genesis Validator Pre-Commit Hook${NC}"
echo ""

# Get the repository root directory
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)

if [ -z "$REPO_ROOT" ]; then
    echo -e "${RED}❌ Error: Not in a git repository${NC}"
    echo ""
    exit 1
fi

# Check if genesis-validator binary exists
VALIDATOR_BIN="$REPO_ROOT/genesis-validator/bin/genesis-validator"

if [ ! -f "$VALIDATOR_BIN" ]; then
    echo -e "${RED}❌ Error: Genesis validator binary not found at: $VALIDATOR_BIN${NC}"
    echo ""
    echo -e "${YELLOW}Please build the validator first:${NC}"
    echo -e "${YELLOW}  cd genesis-validator && go build -o bin/genesis-validator${NC}"
    echo ""
    exit 1
fi

# Check if binary is executable
if [ ! -x "$VALIDATOR_BIN" ]; then
    echo -e "${YELLOW}⚠️  Making validator binary executable...${NC}"
    chmod +x "$VALIDATOR_BIN"
fi

# Create the pre-commit hook
HOOK_FILE="$REPO_ROOT/.git/hooks/pre-commit"

cat > "$HOOK_FILE" << 'EOF'
#!/bin/bash
#
# Genesis Pre-Commit Hook
# Runs the Genesis validator to ensure template consistency before committing
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "🔍 Running Genesis validator..."
echo ""

# Get the repository root directory
REPO_ROOT=$(git rev-parse --show-toplevel)

# Check if genesis-validator binary exists
VALIDATOR_BIN="$REPO_ROOT/genesis-validator/bin/genesis-validator"

if [ ! -f "$VALIDATOR_BIN" ]; then
    echo -e "${YELLOW}⚠️  Genesis validator binary not found at: $VALIDATOR_BIN${NC}"
    echo -e "${YELLOW}⚠️  Skipping validation...${NC}"
    echo ""
    exit 0
fi

# Check if binary is executable
if [ ! -x "$VALIDATOR_BIN" ]; then
    echo -e "${YELLOW}⚠️  Genesis validator binary is not executable${NC}"
    echo -e "${YELLOW}⚠️  Run: chmod +x $VALIDATOR_BIN${NC}"
    echo -e "${YELLOW}⚠️  Skipping validation...${NC}"
    echo ""
    exit 0
fi

# Run the validator
cd "$REPO_ROOT"
if "$VALIDATOR_BIN"; then
    echo ""
    echo -e "${GREEN}✅ Genesis validation passed!${NC}"
    echo ""
    exit 0
else
    echo ""
    echo -e "${RED}❌ Genesis validation failed!${NC}"
    echo ""
    echo -e "${YELLOW}Please fix the issues above before committing.${NC}"
    echo -e "${YELLOW}Or run: git commit --no-verify (to skip validation)${NC}"
    echo ""
    exit 1
fi
EOF

# Make the hook executable
chmod +x "$HOOK_FILE"

echo -e "${GREEN}✅ Pre-commit hook installed successfully!${NC}"
echo ""
echo -e "${BLUE}Location:${NC} $HOOK_FILE"
echo ""
echo -e "${BLUE}The hook will run automatically on every commit.${NC}"
echo -e "${BLUE}To skip validation, use: git commit --no-verify${NC}"
echo ""

# Test the hook
echo -e "${BLUE}🧪 Testing the hook...${NC}"
echo ""

cd "$REPO_ROOT"
if "$VALIDATOR_BIN"; then
    echo ""
    echo -e "${GREEN}✅ Hook test passed!${NC}"
    echo ""
else
    echo ""
    echo -e "${YELLOW}⚠️  Hook test failed - please check the validator${NC}"
    echo ""
    exit 1
fi

