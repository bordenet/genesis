# Genesis AI Instructions: Mandates & Architecture

> Part of [AI Instructions](../01-AI-INSTRUCTIONS.md)

---

## 🚨 TWO NON-NEGOTIABLE MANDATES

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  MANDATE 1: CONTINUOUS IMPROVEMENT TRACKING                                 ║
║                                                                              ║
║  Maintain: genesis-tools/genesis/CONTINUOUS_IMPROVEMENT.md                  ║
║                                                                              ║
║  As you encounter ANY friction, obstacle, or gap:                           ║
║  → IMMEDIATELY add it to CONTINUOUS_IMPROVEMENT.md                          ║
║  → Include: what happened, expected behavior, suggested fix                 ║
║                                                                              ║
║  This is how genesis improves. NOT optional.                                ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  MANDATE 2: AGGRESSIVE DIFF TOOL USAGE                                      ║
║                                                                              ║
║  cd genesis-tools/genesis/project-diff && node diff-projects.js             ║
║                                                                              ║
║  Run this:                                                                   ║
║  ✓ After copying templates                                                  ║
║  ✓ After EVERY significant change                                           ║
║  ✓ Before EVERY commit                                                      ║
║  ✓ When modifying shared files                                              ║
║                                                                              ║
║  LLMs are stochastic. The diff tool catches inevitable inconsistencies.     ║
║  ⛔ DO NOT PROCEED if MUST_MATCH files show divergence!                     ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## Critical Pre-Work Checklist

**⚠️ READ FIRST**: Before starting ANY work on a Genesis-created project:

1. **Read `CODE-CONSISTENCY-MANDATE.md`** - Deviation from hello-world is FORBIDDEN
2. Read `CLAUDE.md` in the target repository
3. Follow the mandatory workflow: **lint → test → proactively communicate what's left**
4. NEVER include `node_modules/` or build artifacts
5. ALWAYS create `.gitignore` files
6. **Run `project-diff --ci` REPEATEDLY** during development

---

## 🏗️ Paired Architecture

**All Genesis projects use the paired model with real directories:**

```
my-project/
├── assistant/              # Document creation workflow
│   ├── index.html
│   ├── js/
│   │   ├── app.js
│   │   ├── workflow.js
│   │   ├── storage.js
│   │   └── ...
│   └── tests/
├── validator/              # Document validation/scoring
│   ├── index.html
│   ├── js/
│   │   ├── app.js
│   │   └── validator.js
│   └── testdata/
├── js/                     # Mirror of assistant/js/ (for root deployment)
├── package.json            # Unified scripts
└── .github/workflows/ci.yml
```

---

## Quick Start for New Projects

```bash
# Copy from hello-world template
cp -r genesis/examples/hello-world my-new-tool

# Customize for your document type
cd my-new-tool
# Edit prompts/, js/workflow.js, validator/js/validator.js
```

---

## Self-Contained Projects

Each project is self-contained with real directories (no symlinks). Benefits:
- **Simple setup**: Clone and run, no external dependencies
- **Clear git history**: All changes tracked in one repo
- **Easy CI/CD**: No special symlink handling needed

---

## Maintaining Consistency

Use the `project-diff` tools to keep projects aligned:

```bash
# From genesis/project-diff directory
node diff-projects.js --ci    # Check for divergent MUST_MATCH files
node find-orphans.js          # Find unused JS files
```

**Run these tools REPEATEDLY during development** - at least:
1. After initial scaffolding
2. Before every commit
3. Before creating a PR

**See `CODE-CONSISTENCY-MANDATE.md` for complete consistency rules.**

