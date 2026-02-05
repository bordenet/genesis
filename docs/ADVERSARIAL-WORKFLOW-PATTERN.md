# The 7-Step Adversarial Workflow Pattern

**The Core Pattern That Makes Genesis Projects Excellent**

> ⚠️ **THIS IS THE MOST IMPORTANT PATTERN IN GENESIS** - Every document-generation app MUST follow this pattern.

---

## Quick Navigation

> **For AI Agents**: Load only the section you need to minimize context usage.

| Section | Content |
|---------|---------|
| [Overview & Why](./adversarial-workflow/overview.md) | Core principles, why it matters, real-world examples |
| [The 7 Steps](./adversarial-workflow/seven-steps.md) | Detailed breakdown of each step |
| [Data Flow Diagram](./adversarial-workflow/data-flow-diagram.md) | Visual representation of the workflow |
| [Quality Checklists](./adversarial-workflow/checklists.md) | Implementation, UI/UX, workflow checklists |
| [Reference Implementations](./adversarial-workflow/reference-implementations.md) | Production examples, code patterns |

---

## The 7 Steps at a Glance

| Step | Action | AI Service |
|------|--------|------------|
| 1 | Gather input from user | App form |
| 2 | Generate prompt for Claude | → Claude.ai |
| 3 | Collect markdown from Claude | ← Claude.ai |
| 4 | Construct adversarial prompt | → Gemini |
| 5 | Collect improved document | ← Gemini |
| 6 | Generate synthesis prompt | → Claude.ai |
| 7 | Collect final result | ← Claude.ai |

---

## Core Principles

**Genesis apps generate PROMPTS, not AI responses:**

| ✅ RIGHT | ❌ WRONG |
|----------|----------|
| Display prompt with "Copy" button | Call AI API directly |
| User copies to Claude.ai/Gemini | App auto-generates content |
| User pastes response back | App fills in response |
| Different AIs for different phases | Same AI all phases |
| Prompts request questions | Single-shot generation |

---

## References

- [Anti-Patterns](ANTI-PATTERNS.md) - What NOT to do
- [Workflow Architecture](../genesis/docs/WORKFLOW-ARCHITECTURE.md) - Technical architecture
- [UI Workflow Bug Prevention](GENESIS-UI-WORKFLOW-BUG-PREVENTION.md) - Common UI bugs
