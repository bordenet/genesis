# Code Consistency Mandate

> **Last Updated**: 2026-02-04
> **Severity**: CRITICAL - This document describes non-negotiable requirements

---

## TL;DR

Every file in your new assistant project **MUST match the hello-world reference implementation byte-for-byte**, except for files explicitly designated as document-type-specific. Use the `project-diff` tool **repeatedly** during development to catch drift before it accumulates.

---

## The Problem We Solved (And Never Want Again)

In February 2026, we discovered **52 divergent files across 6 assistant projects** that should have been identical. Each project had been created from the same template, yet AI assistants had introduced small "improvements" that accumulated into a maintenance nightmare.

### The Carnage

| Metric | Before Unification | After Unification |
|--------|-------------------|-------------------|
| Divergent files | 52 | 0 |
| Unique versions of `app.js` | 6 | 1 |
| Unique versions of `.gitignore` | 6 | 1 |
| Unique versions of `eslint.config.js` | 3 | 1 |
| Hours to fix | 4+ | 0 (prevented) |

### What Went Wrong

AI assistants made "helpful" changes without understanding the consistency requirement:

1. **Import pattern drift**: Some projects used `import { storage }` while others used `import storage`
2. **Export pattern drift**: Mixed named exports vs default exports for the same module
3. **Missing JSDoc annotations**: Some projects had full JSDoc, others had none
4. **Line count differences**: Identical functionality with 10-30% different line counts
5. **Trailing newline inconsistencies**: Some files ended with newlines, others didn't
6. **Config file variations**: Different ESLint rules, Jest configs, and Playwright settings

Each change seemed reasonable in isolation. Together, they created 52 files that should have been identical but weren't.

---

## Specific Bugs From AI Going Rogue

These bugs were **completely avoidable**. They happened because AI assistants made project-specific "improvements" instead of maintaining consistency.

### 1. The Clipboard Bug (February 2026)

**What happened**: The "Generate & Copy Prompt" button failed on Safari/iOS with "Failed to copy to clipboard".

**Root cause**: One project had a different `copyToClipboardAsync` implementation than the others. The "improved" version didn't include Safari's `document.execCommand` fallback.

**Fix required**: Copying the correct implementation to all 6 projects.

**How to prevent**: Don't modify `validator/js/core/ui.js`. Copy it from hello-world unchanged.

### 2. The Import Pattern Bug (January 2026)

**What happened**: `error-handler.test.js` failed in one project with "storage.getDB is not a function".

**Root cause**: The test file imported `{ storage }` but the module exported `storage` as default.

**Fix required**: Aligning import/export patterns across all projects.

**How to prevent**: Don't modify export patterns. Copy files unchanged from hello-world.

### 3. The Test Assertion Bug (January 2026)

**What happened**: `same-llm-adversarial.test.js` passed in some projects, failed in others with identical test data.

**Root cause**: Different assertion patterns. One project tested `result.some(Boolean)`, another tested `result.length > 0`.

**Fix required**: Unifying the test file across all projects.

**How to prevent**: Don't "improve" test assertions. Copy test files unchanged from hello-world.

---

## The Mandate

### Rule 1: hello-world Is The Source of Truth

The `genesis/examples/hello-world/` directory is the canonical reference implementation. When creating a new assistant project:

```
hello-world/           →  your-new-project/
├── js/                    ├── js/         (COPY UNCHANGED)
│   ├── error-handler.js   │   ├── error-handler.js
│   ├── storage.js         │   ├── storage.js (modify DB_NAME only)
│   └── ...                │   └── ...
├── tests/                 ├── tests/      (COPY UNCHANGED)
├── validator/             ├── validator/  (COPY UNCHANGED)
├── eslint.config.js       ├── eslint.config.js (COPY UNCHANGED)
└── ...                    └── ...
```

### Rule 2: Only These Files May Differ

Files that contain document-type-specific logic are exempt from byte-for-byte matching:

| File | Why It Differs |
|------|---------------|
| `storage.js` | Contains project-specific `DB_NAME` |
| `app.js` | Different initialization for different document types |
| `workflow.js` | Phase logic specific to document type |
| `project-view.js` | UI rendering specific to document type |
| `views.js` | Form fields specific to document type |
| `prompts/*.md` | LLM prompts specific to document type |
| `templates/*.md` | Output templates specific to document type |
| `validator/*.js` | Validation rules specific to document type |

Everything else **MUST** match hello-world exactly.

### Rule 3: Use project-diff Repeatedly

Run the diffing tool **at least 3 times** during development:

1. **After initial scaffolding**: Before writing any custom code
2. **Before each commit**: After every change
3. **Before creating a PR**: Final verification

```bash
# From genesis/project-diff directory
node diff-projects.js --ci

# Expected output for a properly maintained project:
# ✓ ALL MUST-MATCH FILES ARE IDENTICAL
```

If you see divergent files, **STOP** and fix them before proceeding.

---

## The Plugin Model

Genesis uses a **plugin model** for document types. The core implementation is stable and shared. Only the "plugin" layer differs per document type.

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR NEW ASSISTANT                       │
├─────────────────────────────────────────────────────────────┤
│  PLUGIN LAYER (varies per document type)                    │
│  ├── prompts/         ← Your LLM prompts                   │
│  ├── templates/       ← Your output templates              │
│  ├── workflow.js      ← Your phase logic                   │
│  └── validator.js     ← Your validation rules              │
├─────────────────────────────────────────────────────────────┤
│  CORE LAYER (NEVER MODIFY - copy from hello-world)         │
│  ├── storage.js       ← IndexedDB operations               │
│  ├── router.js        ← URL routing                        │
│  ├── error-handler.js ← Error display                      │
│  ├── ui.js            ← Clipboard, toasts, modals          │
│  ├── eslint.config.js ← Linting rules                      │
│  ├── jest.config.js   ← Test configuration                 │
│  └── all test files   ← Test infrastructure                │
└─────────────────────────────────────────────────────────────┘
```

### Why This Model

1. **Bug fixes propagate**: Fix a bug in hello-world, copy to all projects
2. **No hidden surprises**: Every project behaves identically for shared functionality
3. **Easy maintenance**: One source of truth, N copies
4. **Safe customization**: Change only what needs to change

### What "Safe Customization" Means

✅ **Safe**: Adding a new prompt file for your document type
✅ **Safe**: Modifying `workflow.js` to add a phase for your document type
✅ **Safe**: Changing `DB_NAME` in `storage.js`

❌ **Unsafe**: "Improving" `error-handler.js` with better messages
❌ **Unsafe**: "Cleaning up" import statements in `router.js`
❌ **Unsafe**: "Optimizing" the clipboard function in `ui.js`
❌ **Unsafe**: "Fixing" ESLint config for your personal preferences

If you think a core file needs improvement, **improve it in hello-world first**, then copy to all projects.

---

## Verification Workflow

### Before Creating a New Project

1. Pull the latest hello-world: `git pull origin main`
2. Run tests in hello-world: `npm test`
3. Verify hello-world is green

### During Development

After every code change:

```bash
# Run the diff tool
cd genesis/project-diff
node diff-projects.js --ci

# If you see divergent files:
# 1. STOP
# 2. Identify which project is the outlier
# 3. Copy the correct version from hello-world (or majority)
# 4. Re-run tests
# 5. Re-run diff tool
```

### Before Creating a PR

```bash
# Final verification
cd genesis/project-diff
node diff-projects.js --json > /tmp/diff-report.json

# Check for divergent files
cat /tmp/diff-report.json | jq '.mustMatch.divergent | length'
# Expected: 0

# If not 0, fix before creating PR
```

---

## What To Do When You're Tempted To "Improve" Something

1. **STOP**
2. Ask: "Is this file in the MUST_MATCH category?"
3. If yes: **DO NOT MODIFY IT**
4. If you believe the file needs improvement:
   a. Make the change in `genesis/examples/hello-world/`
   b. Run tests in hello-world
   c. Copy the improved file to **all** existing projects
   d. Run tests in all projects
   e. Run `project-diff` to verify consistency
   f. Commit all changes together

Never make a "quick fix" in one project. The quick fix becomes tomorrow's divergence nightmare.

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

