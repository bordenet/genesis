# Genesis Project Diff Tool

Compares all 8 genesis projects to detect divergence in shared infrastructure files and test coverage gaps.

---

## Quick Start

```bash
cd genesis/project-diff
node diff-projects.js --ci
```

Exit code 0 = all checks pass. Exit code 1 = divergence, symlink issues, or test coverage gaps detected.

---

## What It Does

### File Comparison
Scans all 8 projects and categorizes every file:

| Category | Description |
|----------|-------------|
| **MUST_MATCH** | Must be byte-for-byte identical across all projects |
| **INTENTIONAL_DIFF** | Expected to differ (prompts, templates, project-specific code) |
| **PROJECT_SPECIFIC** | Only exists in some projects (acceptable) |

### Test Coverage Gap Detection
Scans test files for **critical test patterns**. If a pattern exists in ANY project, it must exist in ALL.

| Pattern | Description |
|---------|-------------|
| `exportAllProjects` | Tests for bulk export functionality |
| `importProjects` | Tests for bulk import functionality |
| `exportProject` | Tests for single project export |
| `errorHandler` | Tests for error handling infrastructure |
| `storageInit` | Tests for storage initialization |

> **Why?** This prevents situations where one project has comprehensive tests but others only have stubs.

---

## Projects Compared

1. `architecture-decision-record`
2. `jd-assistant`
3. `one-pager`
4. `power-statement-assistant`
5. `pr-faq-assistant`
6. `product-requirements-assistant`
7. `strategic-proposal`
8. `genesis/genesis/examples/hello-world` (baseline)

---

## Usage

```bash
# Full diff report (verbose)
node diff-projects.js

# JSON output (for automation)
node diff-projects.js --json

# CI mode (exit 1 if any issues detected)
node diff-projects.js --ci
```

---

## Output

### All Checks Pass

```
SUMMARY
  Total files scanned: 225
  ✓ Identical (MUST_MATCH): 42
  ✗ Divergent (MUST_MATCH): 0
  ~ Intentional differences: 58
  ? Project-specific: 125

═══════════════════════════════════════════════════════════════
  ✓ ALL MUST-MATCH FILES ARE IDENTICAL
  ✓ NO TEST COVERAGE GAPS DETECTED
═══════════════════════════════════════════════════════════════
```

### Test Coverage Gaps Detected

```
🔍 TEST COVERAGE GAPS (critical patterns missing in some projects)
────────────────────────────────────────────────────────────

  If a test pattern exists in ANY project, it should exist in ALL.

  exportProject: Tests for single project export
    ✓ Has tests: architecture-decision-record, jd-assistant, one-pager, ...
    ✗ Missing:   pr-faq-assistant

═══════════════════════════════════════════════════════════════
  🔍 1 TEST COVERAGE GAPS - ADD MISSING TESTS
═══════════════════════════════════════════════════════════════
```

### File Divergence Detected

```
🚨 CRITICAL: DIVERGENT FILES (MUST BE IDENTICAL)
────────────────────────────────────────────────────────────

  js/error-handler.js
    Version 1 (abc12345...): architecture-decision-record, one-pager
    Version 2 (def67890...): pr-faq-assistant

═══════════════════════════════════════════════════════════════
  ✗ 1 FILES HAVE DIVERGED - FIX REQUIRED
═══════════════════════════════════════════════════════════════
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

## Adding New Critical Test Patterns

To detect new test coverage gaps, add entries to `CRITICAL_TEST_PATTERNS` in `diff-projects.js`:

```javascript
{
  name: 'patternName',           // Identifier for the pattern
  description: 'What this tests', // Human-readable description
  filePattern: /filename\.test\.js$/, // Regex matching test file names
  codePatterns: [                 // Regexes to find in test file content
    /describe\s*\(\s*['"`]patternName['"`]/,
    /test\s*\(\s*['"`].*patternName/i,
  ]
}
```

The tool will report when ANY project has the pattern but SOME projects don't.

---

## Related

- [`CODE-CONSISTENCY-MANDATE.md`](../genesis/CODE-CONSISTENCY-MANDATE.md) - Consistency rules
- [`hello-world/`](../genesis/examples/hello-world/) - Baseline template

