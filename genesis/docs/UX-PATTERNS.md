# Genesis UX Patterns

**Critical UX patterns for AI workflow applications.** These patterns were refined through testing in power-statement-assistant, one-pager, and product-requirements-assistant projects.

---

## Quick Navigation

> **For AI Agents**: Load only the section you need to minimize context usage.

| Section | Patterns |
|---------|----------|
| [Sequential Controls](./ux-patterns/sequential-controls.md) | #1 Button Reveal, #2 Textarea Enable, #3 Shared Tab, #4 Auto-Advance |
| [Labeling and Stats](./ux-patterns/labeling-and-stats.md) | #5 Step A/B, #6 AI Names, #7 Footer Stats, #8 Tab Underline |
| [Export and Navigation](./ux-patterns/export-and-navigation.md) | #9 Export Button, #10 Attribution, #11 Cross-Site, #12 Validator Link |

---

## Overview

These 12 patterns improve user experience in multi-phase AI workflow applications:

| # | Pattern | Purpose |
|---|---------|---------|
| 1 | Sequential Button Reveal | Open AI button disabled until Copy Prompt clicked |
| 2 | Sequential Textarea Enable | Response textarea disabled until prompt copied |
| 3 | Shared Browser Tab | All AI links use `target="ai-assistant-tab"` |
| 4 | Auto-Advance on Save | Saving response auto-advances to next phase |
| 5 | Step A/B Labeling | Use letters (A/B) for sub-steps, not numbers |
| 6 | Dynamic AI Name Labels | Show "Claude"/"Gemini", not generic "AI" |
| 7 | Footer Stats Auto-Update | Project count updates after create/delete |
| 8 | Phase Tab Underline Sync | Active tab underline updates from all navigation |
| 9 | Export Button for Completed | Completed projects show Export button in home view |
| 10 | Export Attribution | Exported markdown includes tool attribution footer |
| 11 | Cross-Site Navigation | Header links to related assistant tools |
| 12 | Landing Page Validator Link | Empty state links to validator with target score |

---

## Reference Implementations

- **power-statement-assistant**: https://github.com/bordenet/power-statement-assistant
- **one-pager**: https://github.com/bordenet/one-pager
- **product-requirements-assistant**: https://github.com/bordenet/product-requirements-assistant
- **pr-faq-assistant**: https://github.com/bordenet/pr-faq-assistant

All 12 patterns are implemented in `genesis/templates/web-app/js/project-view-template.js`.

