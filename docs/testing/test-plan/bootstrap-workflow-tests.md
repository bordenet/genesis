# Test Plan: Bootstrap Workflow Tests

> Part of [Genesis Test Plan](../TEST_PLAN.md)

---

## BW-001: End-to-End Project Creation (P0, E2E)
**Objective:** Test complete project creation from Genesis templates

**Test Cases:**
1. Create minimal project from templates
   - Input: Minimal configuration
   - Steps: Copy templates, replace variables, install deps
   - Expected: Working app, all tests pass

2. Create full-featured project
   - Input: All optional features enabled
   - Steps: Full template copying per START-HERE.md
   - Expected: All files present, lint passes, tests pass

3. Verify genesis/ directory deleted after bootstrap
   - Expected: No genesis/ in final project

4. Verify .gitignore prevents unwanted files
   - Expected: node_modules/, coverage/ excluded from git

**Status:** ⬜ Not Started

---

## BW-002: Multi-Platform Bootstrap (P1, Compatibility)
**Objective:** Verify bootstrap works on macOS, Linux, Windows WSL

**Test Cases:**
1. Bootstrap on macOS
   - Script: `setup-macos.sh`
   - Expected: Dependencies installed, app runs

2. Bootstrap on Linux (Ubuntu)
   - Script: `setup-linux.sh`
   - Expected: Dependencies installed, app runs

3. Bootstrap on Windows WSL
   - Script: `setup-windows-wsl.sh`
   - Expected: Dependencies installed, app runs

4. Cross-platform path handling
   - Test: File paths work on all platforms
   - Expected: No hardcoded platform-specific paths

**Status:** ⬜ Not Started

---

## BW-003: Bootstrap Error Recovery (P1, Integration)
**Objective:** Test error handling during bootstrap process

**Test Cases:**
1. Missing dependencies detected and reported
   - Remove node, npm, git
   - Expected: Clear error messages, fail gracefully

2. Network failures during npm install
   - Simulate network outage
   - Expected: Retry logic or clear failure message

3. Partial template copy recovery
   - Interrupt template copying mid-process
   - Expected: Resume or restart from clean state

4. Invalid variable values rejected
   - Input: Empty project name, invalid GitHub username
   - Expected: Validation errors, clear guidance

**Status:** ⬜ Not Started

---

## BW-004: Documentation Hygiene Enforcement (P0, Integration)
**Objective:** Verify documentation validation prevents clutter

**Test Cases:**
1. Reject commits with SESSION-CHECKPOINT.md
   - When: Project marked complete
   - Expected: Validation fails with clear message

2. Reject extensive "completed work" listings
   - Expected: Validation detects and rejects

3. Reject references to deleted files
   - Expected: Validation catches broken links

4. Reject CLAUDE.md over 600 lines
   - Expected: Validation warns about accumulated cruft

**Status:** ⬜ Not Started

