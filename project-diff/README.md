# Genesis Project Diff Tool

Compares all 7 genesis projects to detect divergence in shared infrastructure files.

---

## Quick Start

```bash
cd genesis/project-diff
node diff-projects.js --ci
```

Exit code 0 = all MUST_MATCH files are identical. Exit code 1 = divergence detected.

---

## What It Does

Scans all 7 projects and categorizes every file:

| Category | Description |
|----------|-------------|
| **MUST_MATCH** | Must be byte-for-byte identical across all projects |
| **INTENTIONAL_DIFF** | Expected to differ (prompts, templates, project-specific code) |
| **PROJECT_SPECIFIC** | Only exists in some projects (acceptable) |

---

## Projects Compared

1. `architecture-decision-record`
2. `one-pager`
3. `power-statement-assistant`
4. `pr-faq-assistant`
5. `product-requirements-assistant`
6. `strategic-proposal`
7. `genesis/genesis/examples/hello-world` (baseline)

---

## Usage

```bash
# Full diff report (verbose)
node diff-projects.js

# JSON output (for automation)
node diff-projects.js --json

# CI mode (exit 1 if MUST_MATCH files diverge)
node diff-projects.js --ci
```

---

## Output

### CI Mode (`--ci`)

```
Projects: 7
MUST_MATCH files (identical): 20
Intentional differences: 39
Project-specific files: 163

✓ ALL MUST-MATCH FILES ARE IDENTICAL
```

### Divergence Detected

```
❌ DIVERGENT FILES DETECTED

File: js/error-handler.js
  - architecture-decision-record: abc123...
  - one-pager: def456...

Action: Copy the correct version to all projects.
```

---

## INTENTIONAL_DIFF Patterns

Files matching these patterns are expected to differ. The authoritative list is in `diff-projects.js` → `INTENTIONAL_DIFF_PATTERNS`.

**Document-Type Specific:**
- `prompts/`, `templates/`, `prompts.js`
- `ai-mock.js`, `types.js`, `validator.js`
- `storage.js`, `workflow.js`, `project-view.js`

**Project Identity:**
- `README.md`, `package.json`, `index.html`
- `Agents.md`, `CLAUDE.md` (contain project-specific content)

**MUST_MATCH AI Instruction Files:**
> Note: These are NOT in INTENTIONAL_DIFF - they must be identical across all projects:
- `AGENT.md`, `CODEX.md`, `COPILOT.md`, `GEMINI.md`, `ADOPT-PROMPT.md`

**Hello-World Specific (different directory structure):**
- `jest.config.js`, `playwright.config.js` (path differences)
- `tests/*.test.js` (hello-world uses `tests/`, derived use `assistant/tests/`)
- `.github/workflows/ci.yml` (path differences)

---

## When to Run These Tools

**Run diff-projects.js and find-orphans.js REPEATEDLY during development:**

1. **After initial scaffolding** - Verify new project matches template
2. **Before every commit** - Catch accidental deviations
3. **Before creating a PR** - Final consistency check
4. **After changes to shared infrastructure** - Propagate to all projects

> ⚠️ **Don't skip the diff check!** Inconsistency between projects leads to maintenance nightmares.

---

## Related

- [`CODE-CONSISTENCY-MANDATE.md`](../genesis/CODE-CONSISTENCY-MANDATE.md) - Consistency rules
- [`hello-world/`](../genesis/examples/hello-world/) - Baseline template

