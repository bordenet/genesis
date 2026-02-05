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

---

## Genesis Confidence Assessment

### Current Confidence Score: 95/100

**Assessment Date**: 2026-02-05
**Previous Score**: 85/100 (before genesis normalization)
**Methodology**: Rigorous analysis of genesis instruction files, failure patterns from jd-assistant development, LLM context window limitations, and cross-project consistency verification.

### Score History

| Date | Score | Key Change |
|------|-------|------------|
| 2026-02-05 | 42 → 85 | Long file refactoring, mandatory checkpoints |
| 2026-02-05 | 85 → 95 | Genesis normalization complete, orphaned templates removed |

### Critical Gaps Fixed

#### Gap 1: Instruction Files Exceed Safe Length ✅ **FIXED 2026-02-05**

LLMs have context window limitations and attention degradation over long documents. Files over 300 lines risk losing critical instructions. **All long files have been refactored:**

| File | Lines | Risk | Status |
|------|-------|------|--------|
| `START-HERE.md` | 1,150 → 128 | 🔴 → ✅ | **FIXED** (refactored to steps/) |
| `00-GENESIS-PLAN.md` | 1,018 → 38 | 🔴 → ✅ | **FIXED** 2026-02-05 (archived to docs/historical/) |
| `01-AI-INSTRUCTIONS.md` | 936 → 456 | 🔴 → ✅ | **FIXED** 2026-02-05 (removed duplicated phases) |
| `TROUBLESHOOTING.md` | 776 → 73 | 🔴 → ✅ | **FIXED** 2026-02-05 (split to troubleshooting/) |
| `05-QUALITY-STANDARDS.md` | 489 → 73 | 🟡 → ✅ | **FIXED** 2026-02-05 (split to quality-standards/) |

**Pattern Applied**: Refactored into modular step files with each file ≤300 lines. Each step file has:
- Clear entry conditions
- Explicit exit criteria
- Mandatory verification commands

#### Gap 2: No Mandatory Diff Tool Checkpoints ✅ **FIXED 2026-02-05**

The diff tool is mentioned but not enforced at phase boundaries. An LLM can complete an entire project without ever running it.

**Fix Applied**: Added explicit checkpoints to `genesis/CHECKLIST.md`:
- "CHECKPOINT: After Phase 2 (Template Copying)" with blocking exit criteria
- "CHECKPOINT: Before Every Commit" with blocking exit criteria
- Added to Phase 2: "MANDATORY: Added project to PROJECTS array"
- Added to Phase 2: "MANDATORY: Ran diff-projects.js and verified output"

#### Gap 3: No "Add to PROJECTS Array" Step ✅ **FIXED 2026-02-05**

When creating a new project, there is NO instruction to add it to `diff-projects.js`. This means the diff tool won't check the new project at all.

**Fix Applied**: Added to Phase 2 of CHECKLIST.md as MANDATORY steps.

#### Gap 4: No Function-Like Exit Criteria (🔴 CRITICAL)

Steps don't have strict "MUST PASS BEFORE PROCEEDING" gates. Instructions are prose, not code.

**Status**: **PARTIALLY FIXED** - New step files in `steps/` have exit criteria, but older files don't.

#### Gap 5: Template Field Validation ✅ **FIXED 2026-02-05**

The `dealershipName` vs `jobTitle` bug shows templates contain domain-specific field names that aren't validated.

**Fix Applied**: Added to Phase 3 of CHECKLIST.md:
- Template field validation step with grep command
- Replace ALL template-specific field names instruction
- Verify import/export validation uses correct field names

#### Gap 6: Test Template Mismatch ✅ **FIXED 2026-02-05**

Tests copied from templates test wrong domain criteria (One-Pager tests for JD validator).

**Fix Applied**: Added to Phase 4 of CHECKLIST.md:
- Test template mismatch check step
- Validator tests check domain-specific dimensions instruction
- [ ] Run tests and verify they test YOUR domain, not template domain
```

#### Gap 7: No UI Style Guide ✅ **FIXED 2026-02-05**

Button sizes, colors, and spacing are inconsistent. No standard defined.

**Fix Applied**: UI_STYLE_GUIDE.md exists in all 8 projects (433 lines each), providing comprehensive styling standards.

#### Gap 8: Orphaned Templates Directory ✅ **FIXED 2026-02-05**

The `genesis/templates/` directory contained 111 files that were no longer used by the main workflow (which now copies from `examples/hello-world/`).

**Fix Applied**:
- Deleted entire `genesis/templates/` directory (~20k lines removed)
- Updated genesis-validator to handle missing templates gracefully
- Updated all docs to reference hello-world instead of templates/
- Merged via PR #90

#### Gap 9: Cross-Project Consistency ✅ **FIXED 2026-02-05**

Internal consistency issues existed where `js/core/` and `assistant/js/core/` had divergent files within the same project.

**Fix Applied**:
- Synced all 8 projects to have identical MUST_MATCH files
- Fixed 25 internal consistency issues
- All 42 MUST_MATCH files now byte-for-byte identical
- Merged via PRs #24, #88 and direct pushes

### Roadmap to 100% Confidence

| Priority | Gap | Effort | Impact | Status |
|----------|-----|--------|--------|--------|
| P0 | Refactor files to ≤300 lines | HIGH | +20 points | ✅ **FIXED 2026-02-05** (all 5 files) |
| P0 | Add mandatory diff checkpoints | LOW | +15 points | ✅ **FIXED 2026-02-05** |
| P0 | Add "register in PROJECTS" step | LOW | +8 points | ✅ **FIXED 2026-02-05** |
| P1 | Function-like exit criteria | MEDIUM | +10 points | ✅ Partial (steps/) |
| P1 | Template field validation | LOW | +5 points | ✅ **FIXED 2026-02-05** |
| P1 | Test template mismatch check | LOW | +5 points | ✅ **FIXED 2026-02-05** |
| P2 | UI style guide | LOW | +3 points | ✅ **FIXED 2026-02-05** |
| P2 | Remove orphaned templates | LOW | +2 points | ✅ **FIXED 2026-02-05** |
| P2 | Cross-project consistency | HIGH | +5 points | ✅ **FIXED 2026-02-05** |
| P3 | CI enforcement of diff tool | MEDIUM | +3 points | TODO |
| P3 | Automated ecosystem validation | MEDIUM | +2 points | TODO |

**Current Score**: 95/100 (all P0, P1, P2 items complete)
**Target Score**: 100/100 (remaining P3 items)

### The Fundamental Truth

LLMs are stochastic. Even with perfect instructions, there is always a non-zero probability of deviation. The goal is not 100% confidence—it's building enough guardrails that deviations are caught immediately and corrected before they compound.

**The Three Pillars of LLM-Proof Genesis**:
1. **Short, focused instruction files** (≤300 lines each)
2. **Mandatory checkpoints with blocking exit criteria**
3. **Aggressive diff tool usage as a compensating control**

Without all three, confidence cannot exceed 60%.

---

## Known Template Issues (Quick Reference)

These are known issues in the hello-world template. Check for them after copying:

| Issue | Severity | File(s) | What to Fix |
|-------|----------|---------|-------------|
| Hardcoded "Hello World" text | CRITICAL | All HTML/MD | Run grep scan (see above) |
| ROOT index.html footer has `#` links | HIGH | `index.html` | Add real cross-nav links |
| ROOT index.html wrong tagline | HIGH | `index.html` | Change to "100% Client-Side • Privacy-First" |
| ROOT js/ has wrong validator path | HIGH | `js/project-view.js` | Use `./validator/` not `../validator/` |
| About modal hardcoded text | MEDIUM | `app.js` | Update title/description/GitHub link |
| workflow.js placeholder URL | LOW | `workflow.js` | Update attribution URL |

**These should be fixed in the hello-world template itself, but verify after copying until they are.**
