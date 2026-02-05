# Anti-Patterns: Checklists & Quick Reference

> Part of [Anti-Patterns Guide](../ANTI-PATTERNS.md)

---

## Quick Reference: Wrong vs Right

| Aspect | ❌ Wrong | ✅ Right |
|--------|----------|----------|
| **AI Interaction** | App calls AI API | User copies to external AI |
| **Button Text** | "Generate with AI" | "Copy Prompt" |
| **Prompt Display** | Hidden from user | Shown with copy button |
| **User Role** | Passive (watches app work) | Active (interacts with AI) |
| **Phase 2 AI** | Same as Phase 1 | Different AI (adversarial) |
| **Questions** | None requested | Explicitly requested in prompts |
| **Flow** | Can skip phases | Enforced sequential order |
| **Context** | Missing previous outputs | Full previous outputs included |
| **Generation** | Single-shot | Iterative with user input |
| **Mock Mode** | Replaces workflow | Testing convenience only |

---

## Validation Checklist

Before considering your implementation complete, verify:

### Code Review Checklist

- [ ] **No API calls** to AI services in production code
- [ ] **No auto-generation** of AI content anywhere
- [ ] **Prompt templates** exist for all 3 phases
- [ ] **Copy buttons** present for all phases
- [ ] **Different AIs** used: Claude → Gemini → Claude
- [ ] **Sequential flow** enforced (can't skip phases)
- [ ] **Full context** injected in Phase 2 and 3 prompts
- [ ] **Questions requested** in all prompt templates
- [ ] **Validation** prevents incomplete responses
- [ ] **Mock mode** clearly marked as development-only

### UI Review Checklist

- [ ] **No "Generate with AI" buttons** anywhere
- [ ] **All buttons say "Copy Prompt"** or "Generate Prompt"
- [ ] **Prompts visible** to user before copying
- [ ] **Clear instructions** for each phase
- [ ] **External AI services mentioned** (Claude.ai, Gemini)
- [ ] **Step-by-step guide** visible for each phase
- [ ] **Phase indicators** show progress (1/3, 2/3, 3/3)
- [ ] **Previous phases read-only** once completed

### Workflow Review Checklist

- [ ] **7 steps** all implemented (gather, prompt, collect × 3)
- [ ] **Form collection** happens first
- [ ] **Phase 1** uses Claude
- [ ] **Phase 2** uses Gemini
- [ ] **Phase 3** uses Claude again
- [ ] **Each prompt** requests questions from AI
- [ ] **Phase 2** includes full Phase 1 output
- [ ] **Phase 3** includes both Phase 1 and Phase 2 outputs
- [ ] **Completion screen** marks workflow done

---

## How to Fix If You Made These Mistakes

### Quick Fix Guide

1. **Search your code for:**
   - `api.anthropic.com`
   - `api.openai.com`
   - `generatePhase1AI`
   - `generatePhase2AI`
   - `callAI`
   - Auto-generation patterns

2. **If found, replace with:**
   - Prompt loading from `prompts/phase*.md`
   - Template variable replacement
   - Display prompt with copy button
   - Manual user paste into textarea

3. **Update button text:**
   - "Generate with AI" → "Generate Prompt for Claude"
   - "Auto-fill" → "Copy Prompt to Clipboard"

4. **Add validation:**
   - Check phase completion before advancing
   - Validate responses are not empty
   - Confirm markdown format

5. **Update prompts:**
   - Add "ask clarifying questions" instruction
   - Add "forget previous sessions" to Phase 2
   - Inject full previous outputs

---

## References

- [ADVERSARIAL-WORKFLOW-PATTERN.md](../ADVERSARIAL-WORKFLOW-PATTERN.md) - Complete correct pattern
- [WORKFLOW-ARCHITECTURE.md](../../genesis/docs/WORKFLOW-ARCHITECTURE.md) - Architecture guide
- Reference implementation: https://github.com/bordenet/product-requirements-assistant

