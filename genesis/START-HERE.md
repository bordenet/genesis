# 🚀 Genesis - Start Here

> **Version:** 3.0 (Modular)
> **Last Updated:** 2026-02-05
> **For AI Assistants:** Execute steps in order. Each step has blocking exit criteria.

```text
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   🚨 CRITICAL: This document orchestrates 5 step files.                     ║
║                                                                              ║
║   Each step is ≤150 lines with explicit exit criteria.                      ║
║   DO NOT PROCEED to the next step until exit criteria pass.                 ║
║                                                                              ║
║   📁 Step files are in: genesis/steps/                                      ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## Your Mission

Create a fully working **paired assistant+validator** project:
1. ✅ Working app deployed to GitHub Pages
2. ✅ All tests passing
3. ✅ genesis/ directory deleted
4. ✅ Tell user: "Ready to start coding"

**Time Budget:** 45-60 minutes
**Success Criteria:** App live, tests pass, genesis deleted

---

## 🚨 Mandatory: Read Before ANY Step

1. **[`CODE-CONSISTENCY-MANDATE.md`](CODE-CONSISTENCY-MANDATE.md)** — Deviation from hello-world is FORBIDDEN
2. **[`docs/AI-QUICK-REFERENCE.md`](../docs/AI-QUICK-REFERENCE.md)** — Keep open while coding
3. **[`../CONTINUOUS_IMPROVEMENT.md`](../CONTINUOUS_IMPROVEMENT.md)** — Log ALL obstacles as you encounter them

---

## 🚨 Mandatory: Throughout Development

**Continuous Improvement Tracking:**
- As you encounter ANY friction, obstacle, or gap → IMMEDIATELY add to `CONTINUOUS_IMPROVEMENT.md`
- This feeds improvements back to genesis for the next project
- NOT optional. This is how genesis gets better.

**Diff Tool Usage:**
- Run `cd genesis-tools/genesis/project-diff && node diff-projects.js` AGGRESSIVELY
- After copying templates, after every significant change, before every commit
- LLMs are stochastic — the diff tool catches inevitable inconsistencies

---

## The Steps

Execute these steps **in order**. Each step has explicit exit criteria that MUST pass before proceeding.

| Step | File | Time | Exit Criteria |
|------|------|------|---------------|
| 0 | [`steps/00-prerequisites.md`](steps/00-prerequisites.md) | 5-10 min | Understand 7-step workflow, paired architecture |
| 1 | [`steps/01-requirements.md`](steps/01-requirements.md) | 5 min | All template variables captured |
| 2 | [`steps/02-domain-research.md`](steps/02-domain-research.md) | 15-30 min | Research doc saved with key takeaways |
| 3 | [`steps/03-copy-templates.md`](steps/03-copy-templates.md) | 15-20 min | Diff tool shows 0 divergence |
| 4 | [`steps/04-install-test.md`](steps/04-install-test.md) | 10 min | Tests pass, lint clean, coverage ≥70% |
| 5 | [`steps/05-deploy.md`](steps/05-deploy.md) | 10-15 min | App live, genesis deleted |

---

## 🔴 Blocking Checkpoints

After EACH step, verify:

```bash
# Run diff tool (MANDATORY after steps 3, 4, 5)
cd genesis/project-diff && node diff-projects.js --ci
# MUST show: ✓ ALL MUST-MATCH FILES ARE IDENTICAL
```

**⛔ DO NOT PROCEED if diff tool shows divergent files!**

---

## Quick Reference

### Template Variables

| Variable | Example |
|----------|---------|
| `{{PROJECT_NAME}}` | `one-pager` |
| `{{PROJECT_TITLE}}` | `One-Pager Assistant` |
| `{{GITHUB_USER}}` | `bordenet` |
| `{{DOCUMENT_TYPE}}` | `One-Pager` |

### Key Files

| File | Purpose |
|------|---------|
| `genesis/examples/hello-world/` | Source of truth for copying |
| `genesis/project-diff/diff-projects.js` | Verify no divergence |
| `CODE-CONSISTENCY-MANDATE.md` | Why consistency matters |

---

## Final Verification

Before declaring complete, ALL must pass:

```bash
# 1. genesis/ deleted
[ ! -d "genesis" ] && echo "✅" || echo "❌"

# 2. Tests pass
npm test && echo "✅" || echo "❌"

# 3. Lint clean
npm run lint && echo "✅" || echo "❌"

# 4. No unreplaced variables
grep -r "{{" . --exclude-dir=node_modules || echo "✅"

# 5. App accessible
curl -s -o /dev/null -w "%{http_code}" https://{{GITHUB_USER}}.github.io/{{GITHUB_REPO}}/
```

---

## 🎉 Completion Message

```
✅ Completed:
- Created {{PROJECT_TITLE}} from Genesis template
- Tests: PASSED
- Coverage: ≥70%
- Deployed: https://{{GITHUB_USER}}.github.io/{{GITHUB_REPO}}/
- Genesis: DELETED

✅ Ready to start coding!
```

---

**Start here:** [Step 0: Prerequisites →](steps/00-prerequisites.md)
