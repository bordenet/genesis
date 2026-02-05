# Lessons for Genesis & Impact Assessment

> Part of [UI Workflow Bug Prevention](../GENESIS-UI-WORKFLOW-BUG-PREVENTION.md)

---

## Lessons for Genesis

### 1. Forgiving UX > Strict Workflows

Don't force users into a specific order. Auto-generate missing dependencies.

### 2. Test User Behavior, Not Just Functions

Unit tests catch logic bugs. Integration tests catch UX bugs.

### 3. Empty String ≠ Intentionally Empty

```javascript
// BAD: Can't distinguish between "not set" and "intentionally empty"
phases: { 1: { prompt: '', response: '' } }

// BETTER: Use null/undefined for "not set"
phases: { 1: { prompt: null, response: null } }

// BEST: Add explicit flags
phases: { 1: { prompt: null, response: null, promptGenerated: false } }
```

### 4. Add Workflow Validation to Pre-commit

```bash
# In .pre-commit-config.yaml
- id: workflow-test-check
  name: Check for workflow edge case tests
  entry: bash -c 'grep -r "skips steps\|non-linear" tests/ || (echo "Missing workflow edge case tests" && exit 1)'
  language: system
  pass_filenames: false
```

---

## Impact Assessment

### Apps Affected

All Genesis-spawned apps with:
- Multi-step workflows (Phase 1 → Phase 2 → Phase 3)
- "Generate" + "Save" button patterns
- State that depends on previous steps

### Known Affected Projects

- ✅ **product-requirements-assistant** - FIXED (commit 0b63573)
- ⚠️ **one-pager** - NEEDS REVIEW
- ⚠️ **architecture-decision-record** - NEEDS REVIEW
- ⚠️ **coe-generator** - NEEDS REVIEW (if exists)

### Recommended Action

1. Apply this pattern to Genesis templates immediately
2. Audit existing Genesis-spawned projects for this bug
3. Add workflow edge case tests to all projects
4. Update CLAUDE.md in all projects with UX principles

---

## References

- **Bug Fix Commit:** product-requirements-assistant@0b63573
- **Test Coverage:** Added 2 new tests in `tests/workflow.test.js`
- **Files Changed:**
  - `js/project-view.js` - Added auto-generation of missing prompt
  - `tests/workflow.test.js` - Added workflow edge case tests

---

## Success Criteria for Genesis Integration

After integrating this into Genesis:

- [ ] All new Genesis-spawned apps include workflow edge case test templates
- [ ] CLAUDE.md template includes "UI Workflow Principles" section
- [ ] Spawn script warns about adding workflow tests for multi-step apps
- [ ] Event handler templates use forgiving workflow pattern
- [ ] Pre-commit hook validates workflow test coverage (optional)

**Expected Result:** Future Genesis-spawned apps won't have this class of bugs.

