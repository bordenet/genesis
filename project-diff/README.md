# Genesis Project Diff Tool

Compares all 9 genesis projects to detect divergence, test coverage gaps, domain bleed-over, and internal consistency issues.

## Quick Start

```bash
cd genesis/project-diff
node diff-projects.js --ci
```

Exit code 0 = all checks pass. Exit code 1 = issues detected.

## What It Does

### 1. File Comparison

Scans all 9 projects and categorizes every file:

| Category | Description |
|----------|-------------|
| **MUST_MATCH** | Byte-for-byte identical across all projects |
| **INTENTIONAL_DIFF** | Expected to differ (prompts, templates, project-specific code) |
| **HIGH_ENTROPY_RISK** | Exists in 7+ projects but missing from a few (almost always unintentional) |
| **PROJECT_SPECIFIC** | Only exists in some projects (acceptable) |

### 2. High Entropy Risk Detection

Files that exist in **7+ of 9 projects** but are missing from a few are flagged as HIGH ENTROPY RISK. These are almost never intentionally missing—they represent propagation gaps.

**Threshold**: `Math.max(7, Math.floor(PROJECTS.length * 0.78))` = 7 with 9 projects (~78%)

**Example output**:

```text
🔥 HIGH ENTROPY RISK (exists in 7+ projects, missing from few)
────────────────────────────────────────────────────────────

  These files exist in MOST projects but are missing from a few.
  This is almost certainly unintentional entropy - propagate or remove.

  CHANGELOG.md
    Missing from: acceptance-criteria-assistant, genesis/genesis/examples/hello-world

  shared/js/import-document.js
    Missing from: product-requirements-assistant
```

> **Why?** When a file exists in 8 of 9 projects, it's almost certainly supposed to be universal. The HIGH ENTROPY RISK section surfaces these propagation gaps so they can be fixed.

### 3. Test Coverage Gap Detection

Scans test files for **critical test patterns**. If a pattern exists in ANY project, it must exist in ALL:

| Pattern | Description |
|---------|-------------|
| `exportAllProjects` | Tests for bulk export functionality |
| `importProjects` | Tests for bulk import functionality |
| `exportProject` | Tests for single project export |
| `errorHandler` | Tests for error handling infrastructure |
| `storageInit` | Tests for storage initialization |
| `storage.exportAll` | Tests for storage-level exportAll |
| `storage.importAll` | Tests for storage-level importAll |

> **Why?** Prevents situations where one project has comprehensive tests but others only have stubs.

### 4. Domain Bleed-Over Detection

Scans domain-specific files for **terms from other project domains**. Catches when template content from one project type bleeds into another.

| Project | Banned Terms |
|---------|-------------|
| `jd-assistant` | dealership, DEALERSHIP_NAME, proposalId |
| `one-pager` | dealership, DEALERSHIP_NAME, STORE_COUNT |
| `power-statement-assistant` | dealership, DEALERSHIP_NAME, proposalId |
| `pr-faq-assistant` | dealership, DEALERSHIP_NAME, STORE_COUNT |
| `architecture-decision-record` | dealership, DEALERSHIP_NAME, proposalId |
| `product-requirements-assistant` | dealership, DEALERSHIP_NAME, STORE_COUNT |
| `acceptance-criteria-assistant` | dealership, DEALERSHIP_NAME, proposalId |

> **Why?** When copying hello-world, domain-specific content (like strategic-proposal's "dealership" fields) can bleed into the new project. This check catches that.

### 5. Internal Consistency Check

Files in `js/` and `assistant/js/` MUST be identical within each project:

| Root Path | Must Match |
|-----------|------------|
| `js/projects.js` | `assistant/js/projects.js` |
| `js/views.js` | `assistant/js/views.js` |
| `js/workflow.js` | `assistant/js/workflow.js` |
| `js/ui.js` | `assistant/js/ui.js` |
| ... | (14 files total) |

> **Why?** ROOT `index.html` loads from `js/`, while `assistant/index.html` loads from `assistant/js/`. Divergence causes different behavior depending on entry point.

### 6. Stub Validator Detection

Detects validators that are missing critical functionality based on line counts:

| File | Minimum Lines |
|------|---------------|
| `validator/index.html` | 200 |
| `validator/js/app.js` | 300 |
| `validator/js/validator.js` | 200 |

Also checks for required UI elements and functions.

### 7. Validator Scoring Alignment

Detects when `validator-inline.js` (Assistant) and `validator.js` (Validator tool) would produce **different scores** for the same document:

| Check | Description |
|-------|-------------|
| Slop formula consistency | Both must use `Math.min(5, Math.floor(penalty * 0.6))` |
| Internal consistency | `js/validator-inline.js` must match `assistant/js/validator-inline.js` |
| Scoring algorithm match | Both validators must use the **same scoring functions** |

#### Scoring Algorithm Mismatch Detection

Different function names indicate different scoring logic:

```text
⚖️  VALIDATOR SCORING ALIGNMENT (inline vs full validator mismatch)
────────────────────────────────────────────────────────────

  pr-faq-assistant:
    ✗ Inline and full validators use DIFFERENT scoring algorithms - scores will NOT match
      Inline-only functions: scoreStructure, scoreContent
      Full-only functions: scoreStructureAndHook, scoreContentQuality
```

> **Why?** This catches cases where the inline validator uses simple pattern matching (e.g., `scoreStructure`) while the full validator uses sophisticated analysis (e.g., `scoreStructureAndHook`), causing **4+ point score differences** for users.

### 8. Fit-and-Finish Consistency

Ensures consistent UI/UX polish across all projects:

| Check | Description |
|-------|-------------|
| Navigation order | Related Tools dropdown follows canonical order (excluding self) |
| Footer link | Links to `genesis/BACKGROUND.md` |
| Double-click prevention | Import feature has `isSaving` flag pattern |
| Import tile | Landing page has Import tile in views.js |
| Project tile status | Landing page tiles show phase progress and quality scores |

#### Canonical Navigation Order

Each project's Related Tools dropdown must list tools in this order (excluding itself):

1. One-Pager
2. PRD Assistant
3. Acceptance Criteria
4. ADR Tool
5. Business Justification
6. JD Assistant
7. PR-FAQ Assistant
8. Power Statement
9. Strategic Proposal

#### Double-Click Prevention Pattern

Import document feature must have:

```javascript
let isSaving = false;

async function saveImportedDocument() {
  if (isSaving) return;  // Guard clause
  isSaving = true;
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';
  // ... save logic ...
}
```

#### Project Tile Status Pattern

Each project tile on the landing page must display document status:

**Required elements in `views.js`:**
- `scoreData` variable to store validation results
- `validateDocument()` call to compute quality score
- `getScoreColor()` for score-based color coding
- `getScoreLabel()` for score-based labels (Needs Work, Good, Excellent)
- `completedPhases` counter for in-progress tracking
- Phase progress display showing `N/3` completed phases
- "Quality Score" label for completed documents

**Why?** Users need immediate feedback on document quality. Tiles show:
- In-progress docs: "Phase Progress: 2/3"
- Completed docs: "Quality Score: 85" with color indicator

> **Why?** Without these checks, projects can drift in UI/UX polish, creating inconsistent user experiences across the genesis ecosystem.

## Projects Compared

1. `acceptance-criteria-assistant`
2. `architecture-decision-record`
3. `jd-assistant`
4. `one-pager`
5. `power-statement-assistant`
6. `pr-faq-assistant`
7. `product-requirements-assistant`
8. `strategic-proposal`
9. `genesis/genesis/examples/hello-world` (baseline)

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

```text
SUMMARY
  Total files scanned: 182
  ✓ Identical (MUST_MATCH): 39
  ✗ Divergent (MUST_MATCH): 0
  ~ Intentional differences: 51
  🔥 High entropy risk: 7
  ? Project-specific: 85

═══════════════════════════════════════════════════════════════
  ✓ ALL MUST-MATCH FILES ARE IDENTICAL
  ✓ NO INTERNAL CONSISTENCY ISSUES
  ✓ NO DOMAIN BLEED-OVER DETECTED
  ✓ NO URL SELF-REFERENCE ISSUES
  ✓ ALL PROJECTS HAVE INLINE SCORING
  ✓ NO TEMPLATE CUSTOMIZATION ISSUES
  ✓ NO SHARED LIBRARY NAMING ISSUES
  ✓ NO TEST COVERAGE GAPS DETECTED
  ✓ NO STUB VALIDATORS DETECTED
  ✓ NO FUNCTION SIGNATURE MISMATCHES
  ✓ VALIDATOR SCORING ALIGNED (inline = full)
  ✓ FIT-AND-FINISH CONSISTENT (nav, footer, import, tiles)
═══════════════════════════════════════════════════════════════
```

### Test Coverage Gaps Detected

```text
🔍 TEST COVERAGE GAPS (critical patterns missing in some projects)
────────────────────────────────────────────────────────────

  If a test pattern exists in ANY project, it should exist in ALL.

  exportProject: Tests for single project export
    ✓ Has tests: architecture-decision-record, jd-assistant, one-pager
    ✗ Missing:   pr-faq-assistant

═══════════════════════════════════════════════════════════════
  🔍 1 TEST COVERAGE GAPS - ADD MISSING TESTS
═══════════════════════════════════════════════════════════════
```

### File Divergence Detected

```text
🚨 CRITICAL: DIVERGENT FILES (MUST BE IDENTICAL)
────────────────────────────────────────────────────────────

  js/error-handler.js
    Version 1 (abc12345...): architecture-decision-record, one-pager
    Version 2 (def67890...): pr-faq-assistant

═══════════════════════════════════════════════════════════════
  ✗ 1 FILES HAVE DIVERGED - FIX REQUIRED
═══════════════════════════════════════════════════════════════
```

### Domain Bleed-Over Detected

```text
🩸 CRITICAL: DOMAIN BLEED-OVER (terms from other domains)
────────────────────────────────────────────────────────────

  Domain-specific terms from another project type have bled over.
  This indicates the template was not properly customized.
  Example: "dealership" in jd-assistant = strategic-proposal bleed-over.

  power-statement-assistant: 3 bleed-over occurrences
    "proposal" found 3 times:
      assistant/js/types.js:114
      js/types.js:114
      prompts/phase3.md:89

═══════════════════════════════════════════════════════════════
  🩸 3 DOMAIN BLEED-OVER TERMS - CUSTOMIZE TEMPLATE CONTENT
═══════════════════════════════════════════════════════════════
```

### Internal Consistency Issues Detected

```text
🔀 CRITICAL: INTERNAL CONSISTENCY ISSUES (js/ vs assistant/js/)
────────────────────────────────────────────────────────────

  Files in js/ and assistant/js/ MUST be identical within each project.

  jd-assistant:
    js/projects.js (7864e3da) ≠ assistant/js/projects.js (bc3a22db)

═══════════════════════════════════════════════════════════════
  🔀 1 INTERNAL CONSISTENCY ISSUES - js/ vs assistant/js/ DIVERGED
═══════════════════════════════════════════════════════════════
```

## INTENTIONAL_DIFF Patterns

Files matching these patterns are expected to differ. See `INTENTIONAL_DIFF_PATTERNS` in
[`diff-projects.js`](https://github.com/bordenet/genesis/blob/main/project-diff/diff-projects.js).

**Document-Type Specific:**

- `prompts/`, `templates/`, `prompts.js`
- `ai-mock.js`, `types.js`, `validator.js`
- `storage.js`, `workflow.js`, `project-view.js`

**Project Identity:**

- `README.md`, `package.json`, `index.html`
- `Agents.md`, `CLAUDE.md` (contain project-specific content)

**MUST_MATCH AI Instruction Files:**

These are NOT in INTENTIONAL_DIFF - they must be identical across all projects:

- `AGENT.md`, `CODEX.md`, `COPILOT.md`, `GEMINI.md`, `ADOPT-PROMPT.md`

**Hello-World Specific (different directory structure):**

- `jest.config.js`, `playwright.config.js` (path differences)
- `tests/*.test.js` (hello-world uses `tests/`, derived use `assistant/tests/`)
- `.github/workflows/ci.yml` (path differences)

### Pattern Validation

The tool validates that all INTENTIONAL_DIFF_PATTERNS match at least one actual file. Unused patterns indicate stale configuration:

```text
⚠️  WARNING: Unused INTENTIONAL_DIFF pattern: /^js\/app\.js$/
   This pattern matches no files. Update or remove it.
```

**Why this matters**: When directory structure changes (e.g., `js/` → `shared/js/`), patterns must be updated to match. Unused patterns mean files are being miscategorized as MUST_MATCH when they should be INTENTIONAL_DIFF.

## find-orphans.js

Detects JS files that exist but are never imported by any other file.

```bash
node find-orphans.js        # Full report
node find-orphans.js --ci   # Exit 1 if orphans found
```

### What It Checks

- Scans `js/`, `assistant/js/`, and `validator/js/` directories
- Finds files that are never imported by other files
- Excludes known entry points (`app.js`, `validator.js`, `prompts.js`, etc.)

### Allowed Orphans

Some files are intentionally standalone:

- `app.js` - Entry point loaded by HTML
- `prompts.js` - Dynamically loaded
- `ai-mock.js` - Conditionally loaded
- `validator.js` - Validator entry point
- See `ALLOWED_ORPHANS` in `find-orphans.js` for full list

## When to Run

Run **both tools** repeatedly during development:

1. **After initial scaffolding** - Verify new project matches template
2. **Before every commit** - Catch accidental deviations
3. **Before creating a PR** - Final consistency check
4. **After changes to shared infrastructure** - Propagate to all projects

> ⚠️ Inconsistency between projects leads to maintenance nightmares.

## Extending the Tool

### Adding New Critical Test Patterns

Add entries to `CRITICAL_TEST_PATTERNS` in [`diff-projects.js`](https://github.com/bordenet/genesis/blob/main/project-diff/diff-projects.js):

```javascript
{
  name: 'patternName',
  description: 'What this tests',
  filePattern: /filename\.test\.js$/,
  codePatterns: [
    /describe\s*\(\s*['"`]patternName['"`]/,
    /test\s*\(\s*['"`].*patternName/i,
  ]
}
```

### Adding New Domain Bleed-Over Terms

Add entries to `DOMAIN_BLEED_OVER` in `diff-projects.js`:

```javascript
'project-name': {
  ownTerms: ['terms', 'this', 'project', 'owns'],
  bannedTerms: ['terms', 'from', 'other', 'domains']
}
```

## Related

| Resource | Description |
| -------- | ----------- |
| [CODE-CONSISTENCY-MANDATE.md][ccm] | Consistency rules and file categorization |
| [hello-world template][hw] | Baseline template for all projects |
| [BACKGROUND.md][bg] | Genesis ecosystem history and metrics |
| [CONTINUOUS_IMPROVEMENT.md][ci] | Self-reinforcing AI instructions approach |

[ccm]: https://github.com/bordenet/genesis/blob/main/genesis/CODE-CONSISTENCY-MANDATE.md
[hw]: https://github.com/bordenet/genesis/tree/main/genesis/examples/hello-world
[bg]: https://github.com/bordenet/genesis/blob/main/BACKGROUND.md
[ci]: https://github.com/bordenet/genesis/blob/main/CONTINUOUS_IMPROVEMENT.md
