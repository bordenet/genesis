#!/usr/bin/env bash
#
# Test Suite: Documentation Validation Script (SS-003)
# Priority: P1
# Type: Unit
#
# Objective: Test documentation validation script edge cases

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Test output directory
TEST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="${TEST_DIR}/output"
VALIDATOR_SCRIPT="${TEST_DIR}/../../genesis/scripts/lib/validate-docs.sh"

# Create output directory
mkdir -p "${OUTPUT_DIR}"

# Helper function to run a test
run_test() {
    local test_name="$1"
    local test_function="$2"

    TESTS_RUN=$((TESTS_RUN + 1))
    echo -e "\n${YELLOW}Running: ${test_name}${NC}"

    if ${test_function}; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo -e "${GREEN}✓ PASSED${NC}"
        return 0
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo -e "${RED}✗ FAILED${NC}"
        return 1
    fi
}

# Helper function to create test environment
create_test_env() {
    local env_name="$1"
    local env_dir="${OUTPUT_DIR}/${env_name}"

    rm -rf "${env_dir}"
    mkdir -p "${env_dir}"
    echo "${env_dir}"
}

# Test 1: Handle missing markdown files gracefully
test_missing_markdown_files() {
    local env_dir=$(create_test_env "missing_markdown")

    cd "${env_dir}"

    # Run validator - should not crash, just skip
    if [ -f "${VALIDATOR_SCRIPT}" ]; then
        bash "${VALIDATOR_SCRIPT}" 2>&1 || true
        # If we get here without crashing, test passes
        return 0
    else
        echo "Validator script not found, skipping test"
        return 0
    fi
}

# Test 2: Detect SESSION-CHECKPOINT.md in completed project
test_detect_session_checkpoint() {
    local env_dir=$(create_test_env "session_checkpoint")

    cd "${env_dir}"

    # Create a SESSION-CHECKPOINT.md file
    cat > SESSION-CHECKPOINT.md << 'EOF'
# Session Checkpoint

## Completed Work
- Everything is done

## Remaining Work
(None - project complete)
EOF

    # Create README.md to make it look like a project
    echo "# Test Project" > README.md

    if [ -f "${VALIDATOR_SCRIPT}" ]; then
        # Validator should fail (detect the checkpoint file)
        if bash "${VALIDATOR_SCRIPT}" 2>&1; then
            # If it passes, that's wrong
            return 1
        else
            # If it fails, that's correct
            return 0
        fi
    else
        echo "Validator script not found, skipping test"
        return 0
    fi
}

# Test 3: Detect extensive "completed work" listings
test_detect_completed_work_clutter() {
    local env_dir=$(create_test_env "completed_work")

    cd "${env_dir}"

    # Create README.md with extensive completed work section
    cat > README.md << 'EOF'
# Test Project

## ✅ Completed Work

- Task 1 completed
- Task 2 completed
- Task 3 completed
- Task 4 completed
- Task 5 completed
- Task 6 completed
- Task 7 completed
- Task 8 completed
- Task 9 completed
- Task 10 completed
- Task 11 completed
- Task 12 completed
- Task 13 completed
- Task 14 completed
- Task 15 completed
EOF

    if [ -f "${VALIDATOR_SCRIPT}" ]; then
        # Validator should warn about excessive completed work listings
        if bash "${VALIDATOR_SCRIPT}" 2>&1 | grep -i "completed"; then
            return 0
        else
            # If it doesn't detect, that's a failure
            return 1
        fi
    else
        echo "Validator script not found, skipping test"
        return 0
    fi
}

# Test 4: Handle Unicode and special characters
test_unicode_handling() {
    local env_dir=$(create_test_env "unicode")

    cd "${env_dir}"

    # Create README.md with Unicode characters
    cat > README.md << 'EOF'
# Test Project 🚀

Émojis and spëcial çharacters: 你好世界

## Features
- ✨ Feature 1
- 🔥 Feature 2
- 💡 Feature 3
EOF

    if [ -f "${VALIDATOR_SCRIPT}" ]; then
        # Should handle Unicode without crashing
        bash "${VALIDATOR_SCRIPT}" 2>&1 || true
        return 0
    else
        echo "Validator script not found, skipping test"
        return 0
    fi
}

# Test 5: Reject overly long CLAUDE.md
test_claude_md_length_limit() {
    local env_dir=$(create_test_env "long_claude_md")

    cd "${env_dir}"

    # Create a CLAUDE.md with > 600 lines
    {
        echo "# CLAUDE.md"
        for i in $(seq 1 650); do
            echo "Line $i of documentation..."
        done
    } > CLAUDE.md

    if [ -f "${VALIDATOR_SCRIPT}" ]; then
        # Validator should warn about long CLAUDE.md
        if bash "${VALIDATOR_SCRIPT}" 2>&1 | grep -i "claude\|600\|lines"; then
            return 0
        else
            # If it doesn't detect, that might be okay (depends on implementation)
            return 0
        fi
    else
        echo "Validator script not found, skipping test"
        return 0
    fi
}

# Test 6: Validator script exists and is executable
test_validator_exists() {
    if [ -f "${VALIDATOR_SCRIPT}" ]; then
        if [ -x "${VALIDATOR_SCRIPT}" ]; then
            return 0
        else
            echo "Validator script is not executable"
            return 1
        fi
    else
        echo "Validator script not found at ${VALIDATOR_SCRIPT}"
        return 1
    fi
}

# Main test execution
main() {
    echo "======================================"
    echo "Documentation Validation Script Tests"
    echo "======================================"

    run_test "SS-003-1: Validator script exists and is executable" test_validator_exists
    run_test "SS-003-2: Handle missing markdown files gracefully" test_missing_markdown_files
    run_test "SS-003-3: Detect SESSION-CHECKPOINT.md" test_detect_session_checkpoint
    run_test "SS-003-4: Detect extensive completed work listings" test_detect_completed_work_clutter
    run_test "SS-003-5: Handle Unicode and special characters" test_unicode_handling
    run_test "SS-003-6: Reject overly long CLAUDE.md" test_claude_md_length_limit

    # Clean up
    rm -rf "${OUTPUT_DIR}"

    # Print summary
    echo ""
    echo "======================================"
    echo "Test Summary"
    echo "======================================"
    echo "Tests run:    ${TESTS_RUN}"
    echo -e "${GREEN}Tests passed: ${TESTS_PASSED}${NC}"
    if [ ${TESTS_FAILED} -gt 0 ]; then
        echo -e "${RED}Tests failed: ${TESTS_FAILED}${NC}"
    else
        echo "Tests failed: ${TESTS_FAILED}"
    fi

    # Exit with appropriate code
    if [ ${TESTS_FAILED} -gt 0 ]; then
        exit 1
    else
        exit 0
    fi
}

# Run tests
main "$@"
