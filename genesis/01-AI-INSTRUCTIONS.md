# Genesis Project Template - AI Instructions

**Version**: 2.1
**Last Updated**: 2026-02-05
**Purpose**: Instructions for AI assistants creating **paired assistant+validator** projects

---

## Quick Navigation

> **For AI Agents**: Load only the section you need to minimize context usage.

| Section | Description |
|---------|-------------|
| [Mandates & Architecture](./ai-instructions/mandates-and-architecture.md) | Non-negotiable mandates, paired architecture, diff tools |
| [Professional Standards](./ai-instructions/professional-standards.md) | Quality standards, Iron Law of Dependencies |
| [ES6 Module Validation](./ai-instructions/es6-module-validation.md) | Browser module requirements, validation checklist |
| [Reference Implementations](./ai-instructions/reference-implementations.md) | All paired projects, common failures and fixes |
| [Ongoing Development Rules](./ai-instructions/ongoing-development-rules.md) | Dependency workflow, quality gates, testing |
| [Success Criteria](./ai-instructions/success-criteria.md) | Completion checklist, reference documents, troubleshooting |

---

## 🚨 Critical Pre-Work

Before starting ANY work on a Genesis-created project:

1. **Read `CODE-CONSISTENCY-MANDATE.md`** - Deviation from hello-world is FORBIDDEN
2. **🚨 VERIFY VALIDATOR ALIGNMENT TEST EXISTS AND WORKS** (see CODE-CONSISTENCY-MANDATE.md section at top)
3. Read `CLAUDE.md` in the target repository
4. Follow the mandatory workflow: **lint → test → proactively communicate what's left**
5. **Run `project-diff --ci` REPEATEDLY** during development

### 🚨 Validator Alignment Test (NON-NEGOTIABLE)

This test was requested THREE TIMES and never implemented, causing a 17-point scoring divergence. Before claiming ANY genesis-derived project is complete:

1. **Verify test exists**: `grep -r "validator-inline.js should NOT exist" assistant/tests/smoke.test.js`
2. **Verify test works**: Temporarily create `shared/js/validator-inline.js` and confirm `npm test` FAILS
3. **Clean up**: Delete the temporary file

See the CATASTROPHIC FAILURE PREVENTION section in [`CODE-CONSISTENCY-MANDATE.md`](CODE-CONSISTENCY-MANDATE.md) for the required test code.

---

## 🎯 Your Mission

Create **paired assistant+validator** projects from Genesis templates:
- **Assistant** - 3-phase AI workflow for document creation
- **Validator** - Quality scoring for completed documents

**Success Criteria**: Fully working paired project with GitHub Pages deployment in <2 hours.

---

## 🚀 Quick Start

**Start here:** [`START-HERE.md`](START-HERE.md)

The orchestrator guides you through 6 step files in `steps/`.

---

## Related Documentation

- [START-HERE.md](START-HERE.md) - Entry point for new projects
- [CODE-CONSISTENCY-MANDATE.md](CODE-CONSISTENCY-MANDATE.md) - MANDATORY consistency rules
- [05-QUALITY-STANDARDS.md](05-QUALITY-STANDARDS.md) - Professional standards
- [integration/DEVELOPMENT_PROTOCOLS.md](integration/DEVELOPMENT_PROTOCOLS.md) - AI development protocols

