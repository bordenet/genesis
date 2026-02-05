# Quality Checklists

> Part of [The 7-Step Adversarial Workflow Pattern](../ADVERSARIAL-WORKFLOW-PATTERN.md)

---

## Implementation Checklist

- [ ] **Step 1: Form Collection**
  - [ ] Form has all required fields
  - [ ] Form validates input
  - [ ] Form data stored in `project.formData`

- [ ] **Step 2: Phase 1 Prompt**
  - [ ] Loads `prompts/phase1.md`
  - [ ] Replaces ALL template variables
  - [ ] Displays prompt (doesn't send to API)
  - [ ] Has "Copy Prompt" button
  - [ ] Prompt instructs AI to ask questions

- [ ] **Step 3: Phase 1 Response**
  - [ ] Textarea for user to paste
  - [ ] Validates response (not empty, is markdown)
  - [ ] Stores in `project.phases[0].response`
  - [ ] Marks phase as completed

- [ ] **Step 4: Phase 2 Prompt**
  - [ ] Loads `prompts/phase2.md`
  - [ ] Injects complete Phase 1 output
  - [ ] Includes "forget" clause
  - [ ] Requests critique and improved version
  - [ ] Displays with copy button

- [ ] **Step 5: Phase 2 Response**
  - [ ] Textarea for user to paste
  - [ ] Validates critique is present
  - [ ] Stores in `project.phases[1].response`
  - [ ] Marks phase as completed

- [ ] **Step 6: Phase 3 Prompt**
  - [ ] Loads `prompts/phase3.md`
  - [ ] Injects Phase 1 AND Phase 2 outputs
  - [ ] Requests synthesis of both
  - [ ] Displays with copy button

- [ ] **Step 7: Final Response**
  - [ ] Textarea for user to paste
  - [ ] Validates response
  - [ ] Stores in `project.phases[2].response`
  - [ ] Stores in `project.finalDocument`
  - [ ] Shows completion screen

---

## UI/UX Checklist

- [ ] Clear phase indicators (Phase 1/3, Phase 2/3, etc.)
- [ ] Step-by-step instructions visible
- [ ] Copy buttons work and show confirmation
- [ ] Can't skip phases (validation prevents)
- [ ] Previous phases are read-only once completed
- [ ] Completion screen celebrates success
- [ ] Download/export options available

---

## Workflow Quality Checklist

- [ ] Different AIs used (Claude → Gemini → Claude)
- [ ] Each prompt requests questions
- [ ] Full outputs injected into subsequent prompts
- [ ] Same-LLM detection implemented
- [ ] Responses validated before accepting
- [ ] Progress persisted to storage
- [ ] User can resume if interrupted

---

## Common Mistakes Quick Reference

| Mistake | What's Wrong | Fix |
|---------|--------------|-----|
| Auto-generation | App calls AI API directly | Display prompt with "Copy" button |
| Same AI all phases | No adversarial perspective | Claude → Gemini → Claude |
| No questions | Single-shot generation | Prompt says "ask clarifying questions" |
| Skipping steps | Phase 3 without Phase 1/2 | Validate previous phases complete |
| Missing context | Phase 2 without `{phase1_output}` | Include full previous output |
| Stillborn buttons | UI elements with no handlers | Wire handlers immediately |

---

## References

- [ANTI-PATTERNS.md](../ANTI-PATTERNS.md) - Detailed anti-patterns with examples
- [examples/WORKFLOW-CODE-EXAMPLES.md](../examples/WORKFLOW-CODE-EXAMPLES.md) - Code examples

