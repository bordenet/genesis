# Bug Pattern: Save Fails When Users Skip Steps

> Part of [UI Workflow Bug Prevention](../GENESIS-UI-WORKFLOW-BUG-PREVENTION.md)

---

## The Problem

Genesis-spawned apps with multi-step workflows have a critical UX bug where **Save buttons fail if users skip intermediate steps**.

**Specific Case from product-requirements-assistant:**
1. User creates a new project
2. User skips "Copy Prompt to Clipboard" button
3. User pastes AI response directly into textarea
4. User clicks "Save Response" button
5. **BUG:** Save fails silently because prompt was never generated

---

## Root Cause

```javascript
// BAD: Assumes prompt was already generated
saveResponseBtn.addEventListener('click', async () => {
  const response = responseTextarea.value.trim();
  if (response) {
    // This fails if user never clicked "Copy Prompt"
    await updatePhase(project.id, phase, project.phases[phase].prompt, response);
  }
});
```

The code assumes users follow the "happy path" workflow, but real users skip steps.

---

## The Fix

### Make Workflows Forgiving

```javascript
// GOOD: Auto-generate missing data if user skipped steps
saveResponseBtn.addEventListener('click', async () => {
  const response = responseTextarea.value.trim();
  if (response) {
    // Generate prompt if it hasn't been generated yet
    let prompt = project.phases[phase].prompt;
    if (!prompt) {
      prompt = await generatePromptForPhase(project, phase);
    }
    await updatePhase(project.id, phase, prompt, response);
    showToast('Response saved successfully!', 'success');
    renderProjectView(project.id);
  } else {
    showToast('Please enter a response', 'warning');
  }
});
```

### Key Principle

**Never assume users follow the intended workflow order. Auto-generate missing dependencies.**

