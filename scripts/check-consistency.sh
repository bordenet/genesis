#!/bin/bash
# Genesis Consistency Checker - Wrapper Script
# Detects structural drift across genesis-derived repositories
#
# Usage:
#   ./scripts/check-consistency.sh              # Run analysis
#   ./scripts/check-consistency.sh --baseline   # Compare to baseline
#   ./scripts/check-consistency.sh --save       # Save new baseline
#   ./scripts/check-consistency.sh --ci         # CI mode (exits non-zero if <90%)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
GENESIS_DIR="$(dirname "$SCRIPT_DIR")"
WORKSPACE_DIR="$(dirname "$GENESIS_DIR")"
FINGERPRINT_SCRIPT="$GENESIS_DIR/consistency-checker/fingerprint.js"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is required but not installed.${NC}"
    exit 1
fi

# Check fingerprint script exists
if [[ ! -f "$FINGERPRINT_SCRIPT" ]]; then
    echo -e "${RED}Error: Fingerprint script not found at $FINGERPRINT_SCRIPT${NC}"
    exit 1
fi

# Parse arguments
case "${1:-}" in
    --baseline|-b)
        echo -e "${YELLOW}📊 Comparing to baseline...${NC}"
        cd "$WORKSPACE_DIR"
        node "$FINGERPRINT_SCRIPT" --baseline
        ;;
    --save|-s)
        echo -e "${YELLOW}💾 Saving new baseline...${NC}"
        cd "$WORKSPACE_DIR"
        node "$FINGERPRINT_SCRIPT" --save-baseline
        ;;
    --ci)
        echo -e "${YELLOW}🔄 Running CI consistency check...${NC}"
        cd "$WORKSPACE_DIR"

        # Get score from JSON output using node to parse
        SCORE=$(node "$FINGERPRINT_SCRIPT" --json | node -e "
            let data = '';
            process.stdin.on('data', chunk => data += chunk);
            process.stdin.on('end', () => {
                const json = JSON.parse(data);
                console.log(json.summary.averageSimilarity);
            });
        ")

        echo -e "Consistency score: ${SCORE}%"

        # Check threshold (default 90%)
        THRESHOLD="${CONSISTENCY_THRESHOLD:-90}"
        if (( $(echo "$SCORE < $THRESHOLD" | bc -l) )); then
            echo -e "${RED}❌ Consistency score $SCORE% is below threshold $THRESHOLD%${NC}"
            exit 1
        else
            echo -e "${GREEN}✅ Consistency score $SCORE% meets threshold $THRESHOLD%${NC}"
            exit 0
        fi
        ;;
    --json|-j)
        cd "$WORKSPACE_DIR"
        node "$FINGERPRINT_SCRIPT" --json
        ;;
    --help|-h)
        echo "Genesis Consistency Checker"
        echo ""
        echo "Usage:"
        echo "  ./scripts/check-consistency.sh              Run analysis"
        echo "  ./scripts/check-consistency.sh --baseline   Compare to saved baseline"
        echo "  ./scripts/check-consistency.sh --save       Save current state as baseline"
        echo "  ./scripts/check-consistency.sh --ci         CI mode (exit 1 if score <90%)"
        echo "  ./scripts/check-consistency.sh --json       Output JSON only"
        echo "  ./scripts/check-consistency.sh --help       Show this help"
        echo ""
        echo "Environment variables:"
        echo "  CONSISTENCY_THRESHOLD   Minimum score for --ci mode (default: 90)"
        ;;
    *)
        cd "$WORKSPACE_DIR"
        node "$FINGERPRINT_SCRIPT"
        ;;
esac

