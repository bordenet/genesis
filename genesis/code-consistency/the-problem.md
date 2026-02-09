# Code Consistency: The Problem We Solved

> Part of [Code Consistency Mandate](../CODE-CONSISTENCY-MANDATE.md)

---

## The Carnage (February 2026)

In February 2026, we discovered **52 divergent files across 6 assistant projects** that should have been identical. Each project had been created from the same template, yet AI assistants had introduced small "improvements" that accumulated into a maintenance nightmare.

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

**What happened**: Test files passed in some projects, failed in others with identical test data.

**Root cause**: Different assertion patterns. One project tested `result.some(Boolean)`, another tested `result.length > 0`.

**Fix required**: Unifying test files across all projects.

**How to prevent**: Don't "improve" test assertions. Copy test files unchanged from hello-world.
