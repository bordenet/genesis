# Test Plan: User Flow Tests

> Part of [Genesis Test Plan](../TEST_PLAN.md)

---

## UF-001: First-Time User Onboarding (P0, E2E)
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

## UF-002: AI Assistant Bootstrap (P0, E2E)
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

## UF-003: Developer Customization Workflow (P1, E2E)
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

## UF-004: Non-Linear User Behavior (P1, E2E)
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

