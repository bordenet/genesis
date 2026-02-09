# Genesis Continuous Improvement Log

> **Purpose**: Track lessons learned and process failures for future genesis improvements
> **Status**: Living document - add issues as encountered

---

## How to Use This Document

1. **During genesis child creation**: Add issues as you encounter them
2. **After resolution**: Keep only lessons that prevent future mistakes
3. **Purge regularly**: Remove completed mundane fixes; keep critical lessons

---

## Critical Process Failures (MUST READ)

### Diff Tool Must Be Run Aggressively

**Severity**: CRITICAL

LLMs are stochastic - they WILL introduce inconsistencies. The diff tool at `genesis/project-diff/diff-projects.js` is your safety net.

**The Mandate**:
```bash
cd genesis-tools/genesis/project-diff && node diff-projects.js
```

Run this:
1. After EVERY significant change
2. Before EVERY commit
3. When modifying files that exist across multiple projects

**Critical**: When creating a new project, IMMEDIATELY add it to the PROJECTS array in `diff-projects.js`.

### MANDATORY Hello World Scan After Template Copy

After copying from hello-world, ALWAYS run:
```bash
grep -ri "hello.world\|hello-world\|genesis.example" --include="*.html" --include="*.md" --include="*.json" . | grep -v node_modules
```

Many files have hardcoded "Hello World" text that template variables don't replace.

### MANDATORY Template Placeholder Verification

**Severity**: CRITICAL

**Date Discovered**: 2026-02-06

**What Happened**: The `business-justification-assistant` was created from hello-world template but ONLY the README.md and About.md were customized. The actual application code retained template placeholders (`{{PROJECT_TITLE}}`, `{{PROJECT_EMOJI}}`, `{{GITHUB_USER}}`, etc.) and the validator was copied from one-pager without modification. This resulted in:
- Validator showing "One-Pager Validator" title
- Validator scoring documents against one-pager criteria instead of business justification criteria
- Storage using `one-pager-validator-history` database name (IndexedDB collision!)
- package.json still saying `"name": "hello-world-genesis-example"`

**The Mandate**:
After copying from hello-world, ALWAYS run:
```bash
# Check for unfilled template placeholders
grep -rn "{{" . --include="*.html" --include="*.js" --include="*.json" | grep -v node_modules | grep -v "\.test\." | grep -v "// " | grep -v "prompts.js.*VAR_NAME"

# Check for one-pager references in non-navigation code
grep -rn "one-pager\|One-Pager\|One Pager" . --include="*.html" --include="*.js" --include="*.json" | grep -v node_modules | grep -v "github.io/one-pager"

# Verify package.json name
grep '"name":' package.json
```

**Files That MUST Be Customized** (in addition to README.md):
1. `package.json` - name and description
2. `assistant/index.html` - title, emoji, description, meta tags
3. `index.html` (root) - same as above
4. `validator/index.html` - title, h1, placeholder text, scoring rubric in About modal
5. `validator/js/app.js` - storage name, About modal content
6. `validator/js/prompts.js` - COMPLETE REWRITE for your document type's scoring criteria
7. `validator/js/validator.js` - header comment

### MANDATORY: INTENTIONAL_DIFF_PATTERNS Must Match Directory Structure

**Severity**: CRITICAL

**Date Discovered**: 2026-02-07

**What Happened**: The `INTENTIONAL_DIFF_PATTERNS` array in `project-diff/diff-projects.js` used patterns like `/^js\/app\.js$/` but the actual files are at `shared/js/app.js`. This caused 14 files to be incorrectly flagged as MUST_MATCH divergences. The diff tool appeared to be failing when the real problem was stale patterns.

**Root Cause**: When the directory structure evolved from `js/` to `shared/js/`, the INTENTIONAL_DIFF_PATTERNS were not updated to match.

**The Fix**:
1. Updated all patterns to use `shared/` prefix (PR #145)
2. Added `validateIntentionalDiffPatterns()` function that detects unused patterns
3. Unused patterns now generate warnings in the diff output

**The Mandate**:
When modifying directory structure, immediately update `INTENTIONAL_DIFF_PATTERNS` in `diff-projects.js`. The `validateIntentionalDiffPatterns()` function will catch this automatically, but prevention is better than detection.

### MANDATORY IndexedDB Naming (Prevents Cross-Tool Data Collision)

**Severity**: CRITICAL

All genesis-derived tools share the same domain (`bordenet.github.io`). IndexedDB is scoped by domain, not URL path. If two tools use the same database name, they will corrupt each other's data.

**Files to update for EVERY new project:**
- `js/storage.js` - `DB_NAME` constant
- `assistant/js/storage.js` - `DB_NAME` constant
- `assistant/tests/storage.test.js` - test expectation

**Naming convention:**
- `DB_NAME`: `{project-name}-db` (e.g., `business-justification-assistant-db`)
- `STORE_NAME`: Descriptive noun (e.g., `justifications`, `criteria`)

---

## Proposed Changes (For Review)

Add new improvement proposals here. Format:

```markdown
### [DATE] Proposal: [Title]
**Problem**: What's broken or suboptimal
**Proposed Fix**: Specific changes to make
**Files Affected**: List files
**Status**: PROPOSED | APPROVED | REJECTED
```

(No active proposals)

---

## History

See [docs/IMPROVEMENT-HISTORY.md] for fixed gaps and confidence score evolution.

[docs/IMPROVEMENT-HISTORY.md]: docs/IMPROVEMENT-HISTORY.md
