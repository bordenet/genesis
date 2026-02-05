# Adversarial Workflow Anti-Patterns

**What NOT to Do: Common Mistakes and How to Avoid Them**

> ⚠️ These are WRONG ways to implement Genesis apps. If you see any of these patterns, STOP and fix them.

---

## Quick Navigation

> **For AI Agents**: Load only the section you need to minimize context usage.

| Section | Anti-Patterns Covered |
|---------|----------------------|
| [Patterns 1-2](./anti-patterns/patterns-1-2.md) | Auto-Generation, Same AI All Phases |
| [Patterns 3-4](./anti-patterns/patterns-3-4.md) | No Questions, Skipping Steps |
| [Patterns 5-6](./anti-patterns/patterns-5-6.md) | Missing Context, Single-Shot Generation |
| [Patterns 7-8](./anti-patterns/patterns-7-8.md) | Mock Mode Confusion, Stillborn App |
| [Checklists](./anti-patterns/checklists.md) | Quick Reference, Validation, How to Fix |

---

## Anti-Pattern Summary

| # | Anti-Pattern | Core Mistake |
|---|--------------|--------------|
| 1 | **Auto-Generation** | App calls AI API instead of generating prompts for user |
| 2 | **Same AI All Phases** | Using Claude for all 3 phases (no adversarial review) |
| 3 | **No Questions** | Prompts don't request clarifying questions from AI |
| 4 | **Skipping Steps** | UI allows jumping to Phase 3 without completing 1 & 2 |
| 5 | **Missing Context** | Phase 2/3 prompts don't include previous phase outputs |
| 6 | **Single-Shot** | One prompt generates entire document (no iteration) |
| 7 | **Mock Mode Confusion** | Thinking mock mode = auto-generation in production |
| 8 | **Stillborn App** | Buttons exist but have no event handlers |

---

## The Golden Rule

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  Genesis apps generate PROMPTS, not AI RESPONSES.                           ║
║  Users copy prompts to external AI services and paste responses back.       ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## References

- [ADVERSARIAL-WORKFLOW-PATTERN.md](ADVERSARIAL-WORKFLOW-PATTERN.md) - The correct pattern
- [WORKFLOW-ARCHITECTURE.md](../genesis/docs/WORKFLOW-ARCHITECTURE.md) - Architecture guide
