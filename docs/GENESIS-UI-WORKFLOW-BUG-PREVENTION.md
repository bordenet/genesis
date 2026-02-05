# Genesis Template Enhancement: UI Workflow Bug Prevention

**Date:** 2024-12-01 | **Source:** product-requirements-assistant bug fix (commit 0b63573)

> ⚠️ **Priority: HIGH** - Affects all Genesis-spawned apps with multi-step workflows

---

## Quick Navigation

> **For AI Agents**: Load only the section you need to minimize context usage.

| Section | Content |
|---------|---------|
| [Bug Pattern & Fix](./ui-workflow-bugs/bug-pattern.md) | The problem, root cause, and solution |
| [Testing Gap](./ui-workflow-bugs/testing-gap.md) | Why unit tests missed this, how to fix |
| [Template Updates](./ui-workflow-bugs/template-updates.md) | Genesis template changes needed |
| [Lessons & Impact](./ui-workflow-bugs/lessons-and-impact.md) | Key lessons, affected projects, success criteria |

---

## The Core Problem

**Save buttons fail if users skip intermediate steps.**

| Step | User Action | Bug Behavior |
|------|-------------|--------------|
| 1 | Creates new project | ✅ Works |
| 2 | **Skips** "Copy Prompt" button | — |
| 3 | Pastes AI response into textarea | ✅ Works |
| 4 | Clicks "Save Response" | ❌ **Fails silently** |

---

## The Key Principle

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  Never assume users follow the intended workflow order.                      ║
║  Auto-generate missing dependencies.                                         ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## Quick Fix Pattern

```javascript
// GOOD: Auto-generate missing data if user skipped steps
saveBtn.addEventListener('click', async () => {
  const userInput = textarea.value.trim();
  if (!userInput) return showToast('Please enter data', 'warning');

  // AUTO-GENERATE MISSING DEPENDENCIES
  let requiredData = state.requiredData;
  if (!requiredData) {
    requiredData = await generateRequiredData(state);
  }

  await saveState(state.id, requiredData, userInput);
  showToast('Saved successfully!', 'success');
});
```

---

## References

- [ADVERSARIAL-WORKFLOW-PATTERN.md](ADVERSARIAL-WORKFLOW-PATTERN.md) - The correct workflow pattern
- [ANTI-PATTERNS.md](ANTI-PATTERNS.md) - Common mistakes to avoid
