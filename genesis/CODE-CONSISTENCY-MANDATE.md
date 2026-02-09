# Code Consistency Mandate

> **Last Updated**: 2026-02-08
> **Severity**: CRITICAL - This document describes non-negotiable requirements

---

## 🚨🚨🚨 CATASTROPHIC FAILURE PREVENTION: Validator Alignment Test 🚨🚨🚨

> **STOP AND READ THIS FIRST** - This test was requested THREE TIMES and never implemented, causing a 17-point scoring divergence that confused users. This is now a MANDATORY test for ALL genesis-derived projects.

### The Problem That MUST Never Happen Again

Genesis projects have TWO components that score documents:
1. **LLM Assistant** (`assistant/`) - Uses prompts to guide document creation
2. **JavaScript Validator** (`validator/js/validator.js`) - Scores completed documents

If these diverge, users get confused: the LLM teaches them to write one way, but the validator scores differently. This happened when `shared/js/validator-inline.js` diverged from `validator/js/validator.js` by **553 lines** in one project.

### MANDATORY Test: Single Source of Truth

**Every genesis-derived project MUST have this test in `assistant/tests/smoke.test.js`:**

```javascript
describe('CRITICAL: Validator Single Source of Truth', () => {
  test('validator-inline.js should NOT exist (use canonical validator instead)', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const inlinePath = path.join(process.cwd(), 'shared', 'js', 'validator-inline.js');
    expect(fs.existsSync(inlinePath)).toBe(false);
  });

  test('canonical validator exports validateDocument', async () => {
    const validator = await import('../../validator/js/validator.js');
    expect(typeof validator.validateDocument).toBe('function');
  });

  test('canonical validator exports getScoreColor', async () => {
    const validator = await import('../../validator/js/validator.js');
    expect(typeof validator.getScoreColor).toBe('function');
  });

  test('canonical validator exports getScoreLabel', async () => {
    const validator = await import('../../validator/js/validator.js');
    expect(typeof validator.getScoreLabel).toBe('function');
  });
});
```

### MANDATORY: Verify the Test Works

After adding the test, **verify it actually catches the problem**:

```bash
# 1. Run tests - should pass
npm test

# 2. Create a fake validator-inline.js
echo "// fake" > shared/js/validator-inline.js

# 3. Run tests again - MUST FAIL
npm test  # Should fail with "validator-inline.js should NOT exist"

# 4. Delete the fake file
rm shared/js/validator-inline.js

# 5. Run tests - should pass again
npm test
```

**If step 3 does NOT fail, the test is broken and MUST be fixed before proceeding.**

### Why This Matters

| Without This Test | With This Test |
|-------------------|----------------|
| Duplicate validator files can accumulate | CI fails immediately if duplicate appears |
| Scoring divergence goes unnoticed | Single source of truth enforced |
| Users get confused by inconsistent scores | Consistent scoring guaranteed |
| 17+ point discrepancies possible | Impossible to diverge |

### AI Agent Checklist

Before claiming a genesis-derived project is complete:

- [ ] `shared/js/validator-inline.js` does NOT exist
- [ ] `validator/js/validator.js` exports `validateDocument`, `getScoreColor`, `getScoreLabel`
- [ ] `shared/js/import-document.js` imports from `../../validator/js/validator.js`
- [ ] `shared/js/project-view.js` imports from `../../validator/js/validator.js`
- [ ] `shared/js/views.js` imports from `../../validator/js/validator.js`
- [ ] Smoke test exists that verifies `validator-inline.js` does NOT exist
- [ ] Smoke test has been TESTED by temporarily creating the file and verifying test fails

---

## TL;DR

Every file in your new assistant project **MUST match the hello-world reference implementation byte-for-byte**, except for files explicitly designated as document-type-specific. Use the `project-diff` tool **repeatedly** during development to catch drift before it accumulates.

```bash
# From genesis/project-diff directory
node diff-projects.js --ci   # Exit 1 if MUST_MATCH files diverge
```

The tool compares **all 7 projects** (6 derived + hello-world baseline).

---

## Quick Navigation

> **For AI Agents**: Load only the section you need to minimize context usage.

| Section | Description |
|---------|-------------|
| [The Problem](./code-consistency/the-problem.md) | Why we need this mandate (52 divergent files, specific bugs) |
| [The Mandate](./code-consistency/the-mandate.md) | The 3 rules: hello-world as source of truth, allowed diffs, use project-diff |
| [Plugin Model](./code-consistency/plugin-model.md) | Core vs plugin layers, safe customization |
| [Verification Workflow](./code-consistency/verification-workflow.md) | Before/during/after development checks |
| [Anti-Patterns](./code-consistency/anti-patterns.md) | What NOT to do, lessons learned |

---

## Summary

| Action | Allowed? |
|--------|----------|
| Copy hello-world files unchanged | ✅ Always |
| Modify plugin-layer files | ✅ Expected |
| "Improve" core-layer files in one project | ❌ Never |
| Improve core-layer files in hello-world first | ✅ Correct approach |
| Skip running project-diff | ❌ Never |
| Create PR with divergent files | ❌ Never |

**The rule is simple**: If it's not explicitly in the plugin layer, don't touch it. Use the diff tool. Every time.

---

## 🚨 CRITICAL: Files That MUST Be Customized

While most files should match hello-world exactly, these files **MUST** be changed for each new project:

### IndexedDB Storage (MANDATORY)

**Files**: `js/storage.js` AND `assistant/js/storage.js`

```javascript
// ❌ WRONG - Causes data corruption between tools!
const DB_NAME = 'hello-world-assistant-db';

// ✅ CORRECT - Unique per project
const DB_NAME = 'your-project-name-db';
const STORE_NAME = 'your-documents';  // Also change this
```

**Why**: All genesis tools share the same domain (`bordenet.github.io`). IndexedDB is scoped by domain, not URL path. Same `DB_NAME` = shared/corrupted data.

**Also update**: `assistant/tests/storage.test.js` to expect the new `STORE_NAME`.

### Import Document Module (MANDATORY)

**File**: `shared/js/import-document.js`

```javascript
// ❌ WRONG - Using template defaults
const DOC_TYPE = 'Hello World';
const DOC_TYPE_SHORT = 'Document';

// ✅ CORRECT - Your document type
const DOC_TYPE = 'Business Justification';
const DOC_TYPE_SHORT = 'Justification';
```

**Also customize**: The `LLM_CLEANUP_PROMPT` constant with your document's suggested structure.

**Why**: The Import feature shows document type names in the UI and generates LLM prompts. Generic names confuse users.

See [Web App Customization](./customization-guide/web-app.md) for full details.

