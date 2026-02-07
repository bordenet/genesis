# Code Consistency Mandate

> **Last Updated**: 2026-02-04
> **Severity**: CRITICAL - This document describes non-negotiable requirements

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

