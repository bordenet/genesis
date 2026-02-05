# Workflow Architecture Guide

## Overview

Genesis projects use a **multi-phase AI workflow** pattern where different AI models (or the same model with different perspectives) collaborate to produce high-quality documents.

**⚠️ CRITICAL: Before implementing, study the reference implementation:**
- https://github.com/bordenet/product-requirements-assistant
- All patterns described here are demonstrated in working code
- Don't guess - copy the working patterns!

---

## Quick Navigation

> **For AI Agents**: Load only the section you need to minimize context usage.

| Section | Description |
|---------|-------------|
| [Phase Types](./workflow-architecture/phase-types.md) | Mock mode vs Manual mode phases |
| [Data Flow](./workflow-architecture/data-flow.md) | How data flows through phases 1, 2, 3 |
| [Form-to-Prompt](./workflow-architecture/form-to-prompt.md) | Phase 1 form implementation, template variables |
| [Defensive Coding](./workflow-architecture/defensive-coding.md) | Input validation, error handling, testing |
| [Dark Mode](./workflow-architecture/dark-mode.md) | 🚨 CRITICAL: Tailwind dark mode configuration |

---

## Summary

Genesis projects follow these core patterns:

1. **Multi-phase workflow** with mock/manual modes
2. **Form-to-prompt** pattern for structured data collection
3. **Template abstraction** for easy customization
4. **Defensive coding** for robust error handling
5. **Dark mode** with Tailwind `class` mode (CRITICAL!)
6. **Script-only deployments** with quality gates
7. **Setup scripts** for reproducible environments

**Always study the reference implementation before implementing!**

