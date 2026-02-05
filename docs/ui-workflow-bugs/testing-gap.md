# Why Tests Missed This Bug

> Part of [UI Workflow Bug Prevention](../GENESIS-UI-WORKFLOW-BUG-PREVENTION.md)

---

## The Testing Gap

Unit tests tested individual functions in isolation:

```javascript
// This test ALWAYS sets up the prompt first
test('should save response', async () => {
  await savePrompt(1, 'Template');  // ← Always called
  const project = await createProject('Title', 'Problems', 'Context');
  await updatePhase(project.id, 1, 'prompt', 'response');
  // Test passes, but doesn't catch the UX bug
});
```

---

## What Was Missing

**Workflow/integration tests** that simulate real user behavior:

```javascript
test('should save response even if prompt was never generated', async () => {
  await savePrompt(1, 'Template');
  const project = await createProject('Title', 'Problems', 'Context');
  
  // Verify prompt is initially empty (user hasn't clicked "Copy Prompt")
  expect(project.phases[1].prompt).toBe('');
  
  // User pastes response WITHOUT generating prompt first
  const response = 'AI response pasted directly';
  
  // UI should auto-generate prompt when saving
  let prompt = project.phases[1].prompt;
  if (!prompt) {
    prompt = await generatePromptForPhase(project, 1);
  }
  await updatePhase(project.id, 1, prompt, response);
  
  // Verify both prompt and response were saved
  const updated = await getProject(project.id);
  expect(updated.phases[1].prompt).toBeTruthy();
  expect(updated.phases[1].response).toBe(response);
});
```

---

## Key Takeaway

- **Unit tests** catch logic bugs
- **Integration tests** catch UX bugs
- Always add tests for **non-linear user behavior**

