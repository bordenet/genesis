# Test Plan: Go Validator Tests

> Part of [Genesis Test Plan](../TEST_PLAN.md)

---

## GV-001: Template Scanning Accuracy (P0, Unit)
**Objective:** Verify validator correctly identifies all template files

**Test Cases:**
1. Scan finds all *-template* files
   - Expected: All template files discovered

2. Scan handles nested directories
   - Expected: Deep template files found

3. Scan ignores node_modules/
   - Expected: No false positives from dependencies

4. Scan handles symbolic links
   - Expected: Follow links or skip gracefully

**Status:** ⬜ Not Started

---

## GV-002: Documentation Parsing Robustness (P0, Unit)
**Objective:** Verify validator correctly extracts references from docs

**Test Cases:**
1. Parse cp commands correctly
   - Pattern: `cp genesis/templates/...`
   - Expected: File path extracted

2. Parse backtick references
   - Pattern: `` `templates/...` ``
   - Expected: File path extracted

3. Parse parenthetical references
   - Pattern: `(from templates/...)`
   - Expected: File path extracted

4. Handle malformed markdown gracefully
   - Expected: Parse what's possible, don't crash

**Status:** ⬜ Not Started

---

## GV-003: Validation Logic Correctness (P0, Integration)
**Objective:** Verify validator correctly identifies issues

**Test Cases:**
1. Detect orphaned files (exist, not referenced)
   - Create template file, don't document it
   - Expected: Validation fails, orphan reported

2. Detect missing files (referenced, don't exist)
   - Reference non-existent file in docs
   - Expected: Validation fails, missing file reported

3. Detect documentation inconsistencies
   - Reference in START-HERE but not in CHECKLIST
   - Expected: Warning reported

4. Pass validation when all files match
   - Expected: Validation succeeds, exit code 0

**Status:** ⬜ Not Started

---

## GV-004: LLM Prompt Generation (P2, Unit)
**Objective:** Verify validator generates useful fix prompts

**Test Cases:**
1. Prompt includes specific file paths
   - Expected: Actionable fix instructions

2. Prompt prioritizes critical issues
   - Expected: Orphans and missing files first

3. Prompt formatting is LLM-friendly
   - Expected: Clear markdown, numbered steps

4. Prompt can be disabled with -no-prompt flag
   - Expected: Validation runs, no prompt generated

**Status:** ⬜ Not Started

