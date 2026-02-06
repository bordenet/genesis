# Genesis Improvement History

> **Purpose**: Historical record of gaps identified and fixed
> **Audience**: Humans reviewing genesis evolution
> **Last Updated**: 2026-02-06

---

## Confidence Score Evolution

| Date | Score | Key Change |
|------|-------|------------|
| 2026-02-05 | 42 → 85 | Long file refactoring, mandatory checkpoints |
| 2026-02-05 | 85 → 95 | Genesis normalization complete, orphaned templates removed |
| 2026-02-06 | 95 → 100 | P3 automation: CI enforcement + ecosystem validation |
| 2026-02-06 | 100 → 95 | Discovered business-justification-assistant never customized |

**Current Score**: 95/100

---

## Fixed Gaps Summary

| Gap | Priority | Fixed Date |
|-----|----------|------------|
| Instruction files >300 lines | P0 | 2026-02-05 |
| No mandatory diff checkpoints | P0 | 2026-02-05 |
| No "add to PROJECTS" step | P0 | 2026-02-05 |
| Function-like exit criteria | P1 | Partial |
| Template field validation | P1 | 2026-02-05 |
| Test template mismatch | P1 | 2026-02-05 |
| UI style guide | P2 | 2026-02-05 |
| Orphaned templates directory | P2 | 2026-02-05 |
| Cross-project consistency | P2 | 2026-02-05 |
| CI enforcement of diff tool | P3 | 2026-02-06 |
| Automated ecosystem validation | P3 | 2026-02-06 |

---

## Gap Details

### Gap 1: Instruction Files Exceed Safe Length

LLMs have attention degradation over long documents. Files over 300 lines risk losing critical instructions.

**Files refactored:**
- `START-HERE.md`: 1,150 → 128 lines (moved to `steps/`)
- `00-GENESIS-PLAN.md`: 1,018 → 38 lines (archived)
- `01-AI-INSTRUCTIONS.md`: 936 → 456 lines
- `TROUBLESHOOTING.md`: 776 → 73 lines (split)
- `05-QUALITY-STANDARDS.md`: 489 → 73 lines (split)

### Gap 2: No Mandatory Diff Tool Checkpoints

**Fix**: Added explicit checkpoints to `genesis/CHECKLIST.md` with blocking exit criteria.

### Gap 3: No "Add to PROJECTS Array" Step

**Fix**: Added to Phase 2 of CHECKLIST.md as MANDATORY step.

### Gap 4: No Function-Like Exit Criteria

**Status**: Partially fixed - new step files in `steps/` have exit criteria.

### Gap 5: Template Field Validation

The `dealershipName` vs `jobTitle` bug showed templates contain domain-specific field names.

**Fix**: Added template field validation step with grep command to Phase 3.

### Gap 6: Test Template Mismatch

Tests copied from templates tested wrong domain criteria.

**Fix**: Added test template mismatch check to Phase 4.

### Gap 7: UI Style Guide

**Fix**: UI_STYLE_GUIDE.md added to all projects.

### Gap 8: Orphaned Templates Directory

The `genesis/templates/` directory (111 files) was no longer used.

**Fix**: Deleted via PR #90.

### Gap 9: Cross-Project Consistency

Internal consistency issues between `js/core/` and `assistant/js/core/`.

**Fix**: Synced all projects, fixed 25 issues. Merged via PRs #24, #88.

### Gap 10: CI Enforcement of Diff Tool

**Fix**: Updated `.github/workflows/ci.yml` to run `diff-projects.js --ci` on every PR.

### Gap 11: Automated Ecosystem Validation

**Fix**: CI workflow clones all 9 projects before running diff tool.

---

## Template Issues (Fixed)

| Issue | Status | PR |
|-------|--------|-----|
| ROOT index.html footer has `#` links | ✅ Fixed | #108 |
| ROOT index.html wrong tagline | ✅ Fixed | #108 |
| ROOT js/ wrong validator path | ✅ Fixed | #108 |
| About modal hardcoded text | ✅ Fixed | #108 |
| workflow.js placeholder URL | ✅ Fixed | #108 |

---

## The Three Pillars

1. **Short, focused instruction files** (≤300 lines each)
2. **Mandatory checkpoints with blocking exit criteria**
3. **Aggressive diff tool usage as a compensating control**

Without all three, confidence cannot exceed 60%.

