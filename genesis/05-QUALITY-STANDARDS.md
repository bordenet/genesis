# Genesis Quality Standards

> **Version:** 2.0 (Modular)
> **Last Updated:** 2026-02-05

**Purpose**: Define the professional standards for projects created with Genesis templates.

---

## Philosophy

Projects created with Genesis will be viewed by colleagues, collaborators, and the broader community. They reflect your commitment to code quality and professional communication. This document establishes standards to ensure every Genesis-based project meets the highest professional bar.

---

## Quick Reference

| Standard | Requirement |
|----------|-------------|
| **Test Coverage** | ≥85% logic and branch coverage |
| **Linting** | Zero warnings (ESLint, shellcheck) |
| **Shell Scripts** | Timer, help flag, verbose flag |
| **Accessibility** | WCAG 2.1 Level AA |
| **Security** | OWASP Top 10 compliance |
| **Documentation** | README, inline comments, API docs |

---

## Standards by Section

This document has been modularized into smaller files for easier navigation:

| Section | File | Topics |
|---------|------|--------|
| **Code & Testing** | [`quality-standards/01-code-testing.md`](quality-standards/01-code-testing.md) | Code quality, testing, documentation, README badges |
| **Scripts & Ops** | [`quality-standards/02-scripts-ops.md`](quality-standards/02-scripts-ops.md) | Shell scripts, logging, security, accessibility, performance, version control |

---

## Pre-Commit Checklist (Essential)

Before every commit, verify:

- [ ] All tests pass (`npm test`)
- [ ] Coverage ≥85% (`npm run coverage`)
- [ ] No linting errors (`npm run lint`)
- [ ] Shell scripts pass shellcheck
- [ ] No console.log() in production code
- [ ] Dark mode tested
- [ ] Mobile responsive tested

---

## Pre-Deployment Checklist (Essential)

Before deploying:

- [ ] All CI checks pass
- [ ] README is complete and accurate
- [ ] All links validated
- [ ] No placeholder text remaining
- [ ] Security review completed
- [ ] Performance baseline established
- [ ] Accessibility audit passed

---

## Related Documentation

- [`01-AI-INSTRUCTIONS.md`](01-AI-INSTRUCTIONS.md) - Implementation guidance
- [`CODE-CONSISTENCY-MANDATE.md`](CODE-CONSISTENCY-MANDATE.md) - Project alignment
- [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md) - Common issues

