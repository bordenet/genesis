# Genesis Test Plan

**Version:** 1.0
**Date:** 2025-12-03
**Status:** Draft → Implementation → Complete

---

## Executive Summary

This test plan covers comprehensive testing of the Genesis template system beyond existing code coverage. It focuses on user flows, UX patterns, data flows, integration testing, and correctness validation across all components.

**Current Coverage:**
- JavaScript: 95.67% (86 tests)
- Go: 93.3% (42 tests estimated)
- Total: 128 tests passing

**Test Plan Scope:**
- Template system validation and integration
- Bootstrap workflow end-to-end testing
- Shell script correctness and error handling
- Cross-platform compatibility
- Documentation validation
- Security and edge case testing

---

## Table of Contents

1. [Test Categories](#test-categories)
2. [Template System Tests](#template-system-tests)
3. [Bootstrap Workflow Tests](#bootstrap-workflow-tests)
4. [Shell Script Tests](#shell-script-tests)
5. [Go Validator Tests](#go-validator-tests)
6. [Integration Tests](#integration-tests)
7. [User Flow Tests](#user-flow-tests)
8. [Security Tests](#security-tests)
9. [Documentation Tests](#documentation-tests)
10. [Progress Tracking](#progress-tracking)

---

## Test Categories

### Priority Levels
- **P0 (Critical)**: Blocks core functionality, must pass for release
- **P1 (High)**: Important features, should pass before release
- **P2 (Medium)**: Nice-to-have, can be deferred
- **P3 (Low)**: Edge cases, future improvements

### Test Types
- **Unit**: Individual function/module testing
- **Integration**: Cross-module interaction testing
- **E2E**: Complete user workflow testing
- **Security**: Vulnerability and input validation
- **Performance**: Speed and resource usage
- **Compatibility**: Cross-platform and browser testing

---

## Template System Tests

### TS-001: Template Variable Replacement (P0, Integration)
**Objective:** Verify all template variables are correctly replaced during project creation

**Test Cases:**
1. Replace all standard variables in HTML templates
   - Input: `{{PROJECT_NAME}}`, `{{PROJECT_TITLE}}`, etc.
   - Expected: All variables replaced with actual values
   - Files: `index-template.html`, `README-template.md`

2. Replace variables in JavaScript templates
   - Files: All `*-template.js` files
   - Verify: No `{{}}` patterns remain after replacement

3. Replace variables in configuration files
   - Files: `package-template.json`, `codecov-template.yml`
   - Verify: Valid JSON/YAML after replacement

4. Handle special characters in replacements
   - Test: Project names with spaces, hyphens, special chars
   - Expected: Proper escaping and valid output

**Status:** ⬜ Not Started

---

### TS-002: Template File Completeness (P0, Integration)
**Objective:** Ensure all required template files are present and accessible

**Test Cases:**
1. Verify mandatory template files exist
   - Core: `.gitignore`, `CLAUDE.md`, `README.md`, `package.json`
   - Web: `index.html`, all `js/*.js` files
   - Tests: All `tests/*.test.js` files

2. Verify optional template files are documented
   - Scripts: `setup-*.sh`, `deploy-*.sh`
   - Docs: Architecture, development guides

3. Check for orphaned templates (exist but not referenced)
   - Use `genesis-validator` tool
   - Expected: Zero orphaned files

4. Check for missing templates (referenced but don't exist)
   - Expected: Zero missing files

**Status:** ⬜ Not Started

---

### TS-003: Template Syntax Validation (P1, Unit)
**Objective:** Validate template syntax before variable replacement

**Test Cases:**
1. Valid JavaScript syntax in all JS templates
   - Use ESLint on template files
   - Expected: No syntax errors

2. Valid HTML in all HTML templates
   - Check for unclosed tags, invalid attributes
   - Expected: Valid HTML5

3. Valid Shell script syntax
   - Use shellcheck on all `*.sh` templates
   - Expected: No errors, minimal warnings

4. Valid JSON/YAML in config templates
   - Parse before and after variable replacement
   - Expected: Valid structure

**Status:** ⬜ Not Started

---

### TS-004: Template Content Consistency (P1, Integration)
**Objective:** Ensure templates are internally consistent and follow best practices

**Test Cases:**
1. Dark mode configuration present in HTML templates
   - Verify: Tailwind `darkMode: 'class'` config
   - Verify: `loadTheme()` function in app.js
   - Files: `index-template.html`

2. Quote style consistency (single quotes in JS)
   - Verify: All JS templates use single quotes
   - ESLint rule: `quotes: ['error', 'single']`

3. Adversarial workflow pattern (NOT auto-fill)
   - Verify: Prompts generated for external AI, not auto-filled
   - Check: Copy-paste instructions present
   - Files: `workflow-template.js`, `views-template.js`

4. Forgiving UX patterns implemented
   - Verify: Auto-generation of missing dependencies
   - Example: Save button generates prompt if not already generated

**Status:** ⬜ Not Started

---

## Bootstrap Workflow Tests

### BW-001: End-to-End Project Creation (P0, E2E)
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

### BW-002: Multi-Platform Bootstrap (P1, Compatibility)
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

### BW-003: Bootstrap Error Recovery (P1, Integration)
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

### BW-004: Documentation Hygiene Enforcement (P0, Integration)
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

---

## Shell Script Tests

### SS-001: Setup Script Correctness (P0, Unit)
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

### SS-002: Deployment Script Quality Gates (P0, Integration)
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

### SS-003: Validation Script Edge Cases (P1, Unit)
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

### SS-004: Git Hook Installation (P1, Integration)
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

---

## Go Validator Tests

### GV-001: Template Scanning Accuracy (P0, Unit)
**Objective:** Verify validator correctly identifies all template files

**Test Cases:**
1. Scan finds all *-template* files
   - Expected: All template files discovered

2. Scan handles nested directories
   - Expected: Deep template files found

3. Scan ignores node_modules/
   - Expected: No false positives from dependencies

4. Scan handles symbolic links
   - Expected: Follow links or skip gracefully

**Status:** ⬜ Not Started

---

### GV-002: Documentation Parsing Robustness (P0, Unit)
**Objective:** Verify validator correctly extracts references from docs

**Test Cases:**
1. Parse cp commands correctly
   - Pattern: `cp genesis/templates/...`
   - Expected: File path extracted

2. Parse backtick references
   - Pattern: `` `templates/...` ``
   - Expected: File path extracted

3. Parse parenthetical references
   - Pattern: `(from templates/...)`
   - Expected: File path extracted

4. Handle malformed markdown gracefully
   - Expected: Parse what's possible, don't crash

**Status:** ⬜ Not Started

---

### GV-003: Validation Logic Correctness (P0, Integration)
**Objective:** Verify validator correctly identifies issues

**Test Cases:**
1. Detect orphaned files (exist, not referenced)
   - Create template file, don't document it
   - Expected: Validation fails, orphan reported

2. Detect missing files (referenced, don't exist)
   - Reference non-existent file in docs
   - Expected: Validation fails, missing file reported

3. Detect documentation inconsistencies
   - Reference in START-HERE but not in CHECKLIST
   - Expected: Warning reported

4. Pass validation when all files match
   - Expected: Validation succeeds, exit code 0

**Status:** ⬜ Not Started

---

### GV-004: LLM Prompt Generation (P2, Unit)
**Objective:** Verify validator generates useful fix prompts

**Test Cases:**
1. Prompt includes specific file paths
   - Expected: Actionable fix instructions

2. Prompt prioritizes critical issues
   - Expected: Orphans and missing files first

3. Prompt formatting is LLM-friendly
   - Expected: Clear markdown, numbered steps

4. Prompt can be disabled with -no-prompt flag
   - Expected: Validation runs, no prompt generated

**Status:** ⬜ Not Started

---

## Integration Tests

### IT-001: JavaScript + IndexedDB Storage (P0, Integration)
**Objective:** Test complete storage workflow across modules

**Test Cases:**
1. Create project, save data, retrieve data
   - Use storage.js functions
   - Expected: Data persists across page reloads

2. Export data to JSON
   - Expected: Valid JSON, all data included

3. Import data from JSON
   - Expected: Data restored correctly

4. Handle storage quota exceeded
   - Expected: Clear error, fallback behavior

**Status:** ⬜ Not Started

---

### IT-002: Workflow Phase Transitions (P0, E2E)
**Objective:** Test multi-phase workflow from start to finish

**Test Cases:**
1. Complete Phase 1 → Phase 2 → Phase 3 workflow
   - Input: Form data for Phase 1
   - Expected: Prompts generated, responses saved

2. Skip Phase 1, go directly to Phase 2
   - Expected: Phase 1 data auto-generated (forgiving UX)

3. Go backwards (Phase 3 → Phase 2)
   - Expected: Data preserved, no loss

4. Parallel workflow (multiple projects)
   - Expected: Projects don't interfere with each other

**Status:** ⬜ Not Started

---

### IT-003: Same-LLM Adversarial Detection (P1, Integration)
**Objective:** Test same-LLM detection and mitigation

**Test Cases:**
1. Detect when Phase 1 and Phase 2 use same LLM
   - Input: Both phases use "Claude Sonnet 4.5"
   - Expected: Detection triggers, mitigation applied

2. Apply Gemini personality simulation
   - Expected: Prompt modified with forget clause

3. Skip mitigation when different LLMs used
   - Input: Phase 1 = Claude, Phase 2 = Gemini
   - Expected: No mitigation, original prompt used

4. Handle edge cases (empty LLM names, undefined)
   - Expected: Graceful handling, no crashes

**Status:** ⬜ Not Started

---

### IT-004: Template + Prompt Loading (P1, Integration)
**Objective:** Test loading and combining templates with prompts

**Test Cases:**
1. Load prompt from markdown file
   - File: `prompts/phase1.md`
   - Expected: Prompt text loaded correctly

2. Replace template variables in prompt
   - Variables: `{title}`, `{context}`, etc.
   - Expected: All variables replaced

3. Combine template + form data
   - Expected: Complete prompt ready for AI

4. Handle missing prompt files
   - Expected: Clear error, fallback behavior

**Status:** ⬜ Not Started

---

## User Flow Tests

### UF-001: First-Time User Onboarding (P0, E2E)
**Objective:** Test complete first-time user experience

**Scenario:** User wants to create a new PRD assistant app

**Steps:**
1. User reads README.md
2. User reads genesis/START-HERE.md
3. User copies templates per instructions
4. User runs setup-macos.sh
5. User runs npm install
6. User runs npm test
7. User commits and pushes to GitHub
8. User enables GitHub Pages
9. User visits deployed app

**Expected:**
- Clear instructions at each step
- No errors or confusion
- Working app at the end
- All tests passing

**Status:** ⬜ Not Started

---

### UF-002: AI Assistant Bootstrap (P0, E2E)
**Objective:** Test AI assistant following START-HERE.md

**Scenario:** AI assistant creates project from templates

**Steps:**
1. AI reads START-HERE.md
2. AI asks user for project details
3. AI copies all template files
4. AI replaces all variables
5. AI runs quality checks (lint, test)
6. AI commits and pushes
7. AI tells user "Ready to start coding"

**Expected:**
- AI completes all steps without human intervention
- All quality gates pass
- genesis/ directory deleted
- No template variables remaining

**Status:** ⬜ Not Started

---

### UF-003: Developer Customization Workflow (P1, E2E)
**Objective:** Test developer customizing generated app

**Scenario:** Developer wants to change from 3-phase to 2-phase workflow

**Steps:**
1. Developer modifies workflow.js
2. Developer updates prompts/
3. Developer updates tests
4. Developer runs npm test
5. Developer runs deploy-web.sh

**Expected:**
- Tests updated to match new workflow
- All tests pass
- Deployment succeeds
- App works with new workflow

**Status:** ⬜ Not Started

---

### UF-004: Non-Linear User Behavior (P1, E2E)
**Objective:** Test forgiving UX when users skip steps

**Scenario:** User skips "Copy Prompt" button

**Steps:**
1. User creates new project
2. User skips "Copy Prompt to Clipboard" button
3. User pastes AI response directly into textarea
4. User clicks "Save Response"

**Expected:**
- Prompt auto-generated if missing
- Response saved successfully
- No errors or failures

**Status:** ⬜ Not Started

---

## Security Tests

### SEC-001: Input Validation (P0, Security)
**Objective:** Verify all user inputs are validated

**Test Cases:**
1. Reject XSS attempts in form inputs
   - Input: `<script>alert('xss')</script>`
   - Expected: Sanitized or rejected

2. Reject SQL injection attempts (if applicable)
   - Input: `'; DROP TABLE users; --`
   - Expected: Treated as literal string

3. Reject path traversal attempts
   - Input: `../../etc/passwd`
   - Expected: Rejected, clear error

4. Handle extremely long inputs
   - Input: 10MB string
   - Expected: Rejected or truncated with warning

**Status:** ⬜ Not Started

---

### SEC-002: Secret Detection (P0, Security)
**Objective:** Prevent secrets from being committed

**Test Cases:**
1. Detect API keys in code
   - Pattern: `API_KEY = "sk-..."`
   - Expected: Pre-commit hook blocks

2. Detect tokens in environment files
   - File: `.env` (not .env.example)
   - Expected: .gitignore blocks

3. Detect credentials in JSON
   - Pattern: `"password": "..."`
   - Expected: Warning or block

4. Allow placeholder secrets in examples
   - File: `.env.example`
   - Expected: Allowed, not blocked

**Status:** ⬜ Not Started

---

### SEC-003: Dependency Vulnerabilities (P1, Security)
**Objective:** Detect and report vulnerable dependencies

**Test Cases:**
1. npm audit detects known vulnerabilities
   - Run: `npm audit`
   - Expected: Report shown, critical vulns fail CI

2. Trivy scans filesystem for vulns
   - Run: Trivy action in CI
   - Expected: SARIF report uploaded to GitHub

3. Dependabot PRs for updates
   - Expected: Auto-PRs for dependency updates

4. Security policy documented
   - File: SECURITY.md
   - Expected: Vulnerability reporting process clear

**Status:** ⬜ Not Started

---

## Documentation Tests

### DOC-001: Documentation Completeness (P1, Unit)
**Objective:** Verify all features are documented

**Test Cases:**
1. README.md covers all major features
   - Expected: 3-phase workflow, testing, deployment

2. CLAUDE.md provides clear AI instructions
   - Expected: Coding standards, quality gates

3. START-HERE.md has complete bootstrap steps
   - Expected: All template files listed

4. Troubleshooting guide covers common issues
   - File: TROUBLESHOOTING.md
   - Expected: Solutions for known problems

**Status:** ⬜ Not Started

---

### DOC-002: Documentation Accuracy (P1, Integration)
**Objective:** Verify documentation matches code reality

**Test Cases:**
1. Code examples in docs are runnable
   - Expected: Copy-paste examples work

2. File paths in docs are correct
   - Expected: All referenced files exist

3. Version numbers are consistent
   - Expected: package.json matches README

4. Screenshots are up-to-date
   - Expected: UI matches current version

**Status:** ⬜ Not Started

---

### DOC-003: Link Validity (P2, Unit)
**Objective:** Verify all documentation links work

**Test Cases:**
1. Internal links (to other docs) work
   - Expected: No 404s

2. External links (to GitHub, demos) work
   - Expected: No dead links

3. Reference implementation links work
   - Expected: product-requirements-assistant, one-pager accessible

4. Badge links work
   - Expected: CI status, coverage badges functional

**Status:** ⬜ Not Started

---

## Progress Tracking

### Overall Status

- **Total Test Cases:** 67
- **Completed:** 0
- **In Progress:** 0
- **Not Started:** 67
- **Blocked:** 0

### By Priority

| Priority | Total | Completed | Remaining |
|----------|-------|-----------|-----------|
| P0       | 24    | 0         | 24        |
| P1       | 28    | 0         | 28        |
| P2       | 12    | 0         | 12        |
| P3       | 3     | 0         | 3         |

### By Category

| Category              | Total | Completed | Remaining |
|-----------------------|-------|-----------|-----------|
| Template System       | 4     | 0         | 4         |
| Bootstrap Workflow    | 4     | 0         | 4         |
| Shell Scripts         | 4     | 0         | 4         |
| Go Validator          | 4     | 0         | 4         |
| Integration Tests     | 4     | 0         | 4         |
| User Flows            | 4     | 0         | 4         |
| Security              | 3     | 0         | 3         |
| Documentation         | 3     | 0         | 3         |

### Implementation Plan

**Phase 1 (P0 Critical Tests):** Days 1-3
- All P0 template system tests
- All P0 bootstrap workflow tests
- All P0 shell script tests
- All P0 validator tests
- All P0 integration tests
- All P0 user flow tests
- All P0 security tests

**Phase 2 (P1 High Priority Tests):** Days 4-5
- Remaining integration tests
- User customization workflows
- Error recovery scenarios
- Documentation accuracy checks

**Phase 3 (P2-P3 Nice-to-Have Tests):** Day 6
- Link validation
- Performance testing
- Advanced edge cases

---

## Test Implementation Guidelines

### Test File Organization

```
genesis/
├── tests/                          # New test directory
│   ├── template-system/
│   │   ├── variable-replacement.test.js
│   │   ├── file-completeness.test.js
│   │   ├── syntax-validation.test.js
│   │   └── content-consistency.test.js
│   ├── bootstrap/
│   │   ├── e2e-creation.test.sh
│   │   ├── multi-platform.test.sh
│   │   ├── error-recovery.test.js
│   │   └── doc-hygiene.test.js
│   ├── scripts/
│   │   ├── setup.test.sh
│   │   ├── deployment.test.sh
│   │   ├── validation.test.sh
│   │   └── git-hooks.test.sh
│   └── integration/
│       ├── storage-workflow.test.js
│       ├── phase-transitions.test.js
│       ├── same-llm-adversarial.test.js
│       └── template-prompt-loading.test.js
```

### Testing Standards

1. **All tests must be idempotent** - Can run multiple times without side effects
2. **All tests must clean up after themselves** - No leftover files or state
3. **All tests must have clear assertions** - No ambiguous pass/fail conditions
4. **All tests must document their purpose** - Clear description and expected behavior

### Coverage Goals

- **Code Coverage:** Maintain >90% statement coverage
- **Branch Coverage:** Maintain >85% branch coverage
- **Integration Coverage:** All major user flows tested end-to-end
- **Error Coverage:** All error paths tested with expected behavior

---

## Success Criteria

This test plan is considered complete when:

- ✅ All P0 tests implemented and passing
- ✅ All P1 tests implemented and passing
- ✅ At least 80% of P2 tests implemented
- ✅ Code coverage remains above 90%
- ✅ All CI quality gates pass cleanly
- ✅ TEST_BUGS_REVEALED.md documents any defects found
- ✅ All critical defects have remediation plans
- ✅ No regressions in existing test suite

---

## Notes

- This test plan complements existing tests, not replaces them
- Focus is on integration, user flows, and correctness beyond unit coverage
- Tests should catch issues that current 95%+ coverage misses
- Emphasize adversarial workflow, forgiving UX, and documentation hygiene
- All tests must follow CLAUDE.md coding standards (single quotes, linting, etc.)
