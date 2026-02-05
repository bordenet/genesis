# Code Consistency: Anti-Patterns

> Part of [Code Consistency Mandate](../CODE-CONSISTENCY-MANDATE.md)

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

## Anti-Pattern: The Plugin Architecture Disaster (February 2026)

**What was attempted**: An AI assistant tried to isolate document-type-specific files by creating a `document-type/` folder with `config.js` that would centralize configuration. The idea was to make `storage.js` and `workflow.js` import from this config, eliminating hardcoded values.

**What went wrong**: The changes were made to **hello-world first** without simultaneously updating all 6 derived projects. Since hello-world is the canonical reference, the modified `storage.js` and `workflow.js` immediately became the "expected" versions. Every derived project was now "divergent" because they didn't have the `document-type/config.js` file or the new import statements.

**Result**: All 6 projects became undeployable. The imports pointed to files that didn't exist.

**Lesson 1**: hello-world is the **source of truth**. Changing hello-world changes what "correct" means for every project. Never modify hello-world in isolation.

**Lesson 2**: Large architectural changes require **simultaneous updates** to all projects, not sequential waves starting from hello-world.

**Lesson 3**: Run `project-diff --ci` **after every change**. If you see divergent files, stop and fix them before proceeding.

**The correct approach for architectural changes**:
1. Design the change on paper first
2. Create a branch in **every** project simultaneously
3. Apply changes to **all** projects in lockstep
4. Run `project-diff` to verify consistency
5. Test all projects before committing
6. Merge all projects together

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

