# Reference Implementations

> Part of [The 7-Step Adversarial Workflow Pattern](../ADVERSARIAL-WORKFLOW-PATTERN.md)

---

## Production Examples

Study these working implementations:

### 1. product-requirements-assistant ⭐ PRIMARY

- https://github.com/bordenet/product-requirements-assistant
- Perfect example of 7-step workflow
- Study `js/workflow.js` and `js/app.js`

### 2. one-pager ⭐ SECONDARY

- https://github.com/bordenet/one-pager
- Simpler version, same pattern
- Good for understanding basics

---

## What to Study in References

In `product-requirements-assistant`, study:

- `js/workflow.js` lines 45-120: Phase management
- `js/app.js` lines 67-89: Prompt generation
- `prompts/phase1.md`: Template variable pattern
- `prompts/phase2.md`: Adversarial prompt structure
- `prompts/phase3.md`: Synthesis prompt structure
- `assistant/tests/workflow.test.js`: Testing async workflows

---

## Code Patterns

**See:** [`examples/WORKFLOW-CODE-EXAMPLES.md`](../examples/WORKFLOW-CODE-EXAMPLES.md) for complete implementation examples.

Key patterns:

```javascript
// Template variable replacement
function replaceVars(template, vars) {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value || '');
  }
  return result;
}

// Phase 2 prompt generation (includes Phase 1 output)
const phase2Prompt = template.replace(/\{phase1_output\}/g, phase1Response);

// Phase 3 prompt generation (includes BOTH outputs)
const phase3Prompt = template
  .replace(/\{phase1_output\}/g, phase1Response)
  .replace(/\{phase2_output\}/g, phase2Response);
```

---

## Success Indicators

You've implemented the pattern correctly if:

- ✅ App never auto-generates AI content
- ✅ User manually copies/pastes to external AIs
- ✅ Three distinct AI interactions occur
- ✅ Each AI asks clarifying questions
- ✅ Final document is noticeably better than single-AI generation

---

## When to Deviate

**NEVER deviate from this pattern** for document-generation apps. This is a proven, battle-tested approach.

Only deviate if:

- You're building a completely different type of app (not document generation)
- You have a compelling reason AND document it extensively

---

## Getting Help

If you're unsure about implementation:

1. Re-read [ADVERSARIAL-WORKFLOW-PATTERN.md](../ADVERSARIAL-WORKFLOW-PATTERN.md)
2. Study the reference implementations
3. Check [ANTI-PATTERNS.md](../ANTI-PATTERNS.md)
4. Ask specific questions with code examples

