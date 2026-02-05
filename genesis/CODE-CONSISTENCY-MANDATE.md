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

