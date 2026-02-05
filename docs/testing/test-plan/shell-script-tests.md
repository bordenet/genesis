# Test Plan: Shell Script Tests

> Part of [Genesis Test Plan](../TEST_PLAN.md)

---

## SS-001: Setup Script Correctness (P0, Unit)
**Objective:** Verify setup scripts install dependencies correctly

**Test Cases:**
1. `setup-macos.sh` installs all dependencies
   - Check: Node.js, npm, git installed
   - Check: Homebrew packages installed
   - Expected: All dependencies present

2. Smart caching works (skip installed deps)
   - Run script twice
   - Expected: Second run faster, skips installed deps

3. Error handling for missing prerequisites
   - Remove Homebrew
   - Expected: Clear error, installation instructions

4. Script help text displays correctly
   - Run: `./setup-macos.sh --help`
   - Expected: Usage, options, examples shown

**Status:** ⬜ Not Started

---

## SS-002: Deployment Script Quality Gates (P0, Integration)
**Objective:** Verify deployment scripts enforce quality standards

**Test Cases:**
1. `deploy-web.sh` runs linting before deploy
   - Introduce lint error
   - Expected: Deployment blocked, error shown

2. Deployment blocked if tests fail
   - Introduce failing test
   - Expected: Deployment stopped, test failure shown

3. Coverage threshold enforced
   - Reduce coverage below threshold
   - Expected: Deployment blocked, coverage report shown

4. Compact mode reduces git output noise
   - Run deployment
   - Expected: Clean output, no verbose git messages

**Status:** ⬜ Not Started

---

## SS-003: Validation Script Edge Cases (P1, Unit)
**Objective:** Test documentation validation script edge cases

**Test Cases:**
1. Handle missing markdown files gracefully
   - Remove all .md files
   - Expected: Skip validation, don't crash

2. Detect completed projects with TODOs
   - Expected: Validation fails with clear message

3. Handle Unicode and special characters in docs
   - Expected: Validation works correctly

4. Performance with large documentation sets
   - Expected: Validation completes in <5 seconds

**Status:** ⬜ Not Started

---

## SS-004: Git Hook Installation (P1, Integration)
**Objective:** Verify pre-commit hooks install and function correctly

**Test Cases:**
1. `install-hooks.sh` creates pre-commit hook
   - Expected: `.git/hooks/pre-commit` exists, executable

2. Pre-commit hook runs linting
   - Introduce lint error, try to commit
   - Expected: Commit blocked, lint error shown

3. Pre-commit hook runs doc validation
   - Add SESSION-CHECKPOINT.md, try to commit
   - Expected: Commit blocked, validation error shown

4. Hook can be bypassed with --no-verify
   - Run: `git commit --no-verify`
   - Expected: Commit succeeds even with errors

**Status:** ⬜ Not Started

