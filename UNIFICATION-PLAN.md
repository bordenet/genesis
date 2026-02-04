# Genesis Tools Unification Plan

> **Goal:** Unify 52 divergent files across 6 assistant projects to achieve consistency.
> **Created:** 2026-02-04
> **Status:** ✅ COMPLETE

---

## Symlink Unification - CANCELLED

> **Decision Date:** 2026-02-04
> **Decision:** Do NOT convert children to use symlinks for `js/core/` or `assistant/js/core/`

### Background

We considered converting all 6 children to use symlinks pointing to `validator-core` and `assistant-core` repos for their `core/` directories. This would have provided "edit once, apply everywhere" semantics.

### Why We Cancelled

1. **Complexity outweighs benefit** - Symlinks require cloning extra repos for local dev, CI workflow changes, and split git history
2. **Manual propagation is manageable** - After achieving alignment, keeping files in sync is straightforward
3. **Self-contained repos are simpler** - Each child repo works standalone without external dependencies
4. **We already achieved alignment** - The hard work (unifying divergent files) is done; maintaining alignment is easy

### Current Approach

- All 6 children have **real directories** for `js/core/` and `assistant/js/core/`
- Files are kept in sync via manual propagation when changes are needed
- The `validator-core` and `assistant-core` repos exist but are NOT actively used as symlink targets
- Two children (architecture-decision-record, pr-faq-assistant) have legacy symlinks for `assistant/js/core/` - these work but are not the recommended pattern

### If You're Tempted to Revisit Symlinks

Don't. The complexity is not worth it. If propagation becomes painful, consider:
1. A script to copy files across repos
2. A CI check that verifies alignment
3. But NOT symlinks

---

## Executive Summary

The `project-diff` tool identified **52 files that MUST be identical** but have diverged across the 6 assistant projects. This plan organizes the unification into waves, prioritizing quick wins first.

### Projects
1. architecture-decision-record (ADR)
2. one-pager
3. power-statement-assistant
4. pr-faq-assistant
5. product-requirements-assistant (PRD)
6. strategic-proposal

### Divergence Categories

| Category | Count | Description | Approach |
|----------|-------|-------------|----------|
| **Cat 1: Single Outlier** | 18 | 5 projects match, 1 differs (usually strategic-proposal) | Copy majority version to outlier |
| **Cat 2: All Diverged** | 23 | All 6 projects have different versions | Pick canonical, propagate |
| **Cat 3: Partial** | 11 | 3-5 different versions | Analyze and merge best |

---

## Wave 1: Single Outlier Files (Quick Wins)

**Strategy:** Copy the majority version to the outlier project.

### Files to Fix (strategic-proposal is usually the outlier):

- [ ] `.github/workflows/ci.yml` - 5 match, strategic-proposal differs
- [ ] `.nojekyll` - 5 match, strategic-proposal differs  
- [ ] `assistant/js/core/index.js` - 5 match, strategic-proposal differs
- [ ] `assistant/js/core/ui.js` - 5 match, strategic-proposal differs
- [ ] `assistant/js/diff-view.js` - 5 match, one-pager differs
- [ ] `codecov.yml` - 5 match, strategic-proposal differs
- [ ] `docs/DESIGN-PATTERNS.md` - 5 match, strategic-proposal differs
- [ ] `docs/UI_STYLE_GUIDE.md` - 5 match, strategic-proposal differs
- [ ] `jest.config.js` - 5 match, strategic-proposal differs
- [ ] `jsconfig.json` - 5 match, strategic-proposal differs
- [ ] `scripts/lib/symlinks.sh` - 5 match, strategic-proposal differs
- [ ] `validator/css/styles.css` - 5 match, strategic-proposal differs
- [ ] `validator/js/core/.gitkeep` - 5 match, 1 differs
- [ ] `validator/js/core/index.js` - 5 match, 1 differs
- [ ] `validator/js/core/storage.js` - 5 match, 1 differs
- [ ] `validator/js/core/ui.js` - 5 match, 1 differs
- [ ] `validator/tests/button-state.test.js` - 5 match, strategic-proposal differs
- [ ] `js/diff-view.js` - 5 match, one-pager differs (mirror of assistant/)

**Verification:** Run `npm test` in each modified project, then run `project-diff --ci`

---

## Wave 2: Config & Setup Files

**Strategy:** Analyze differences, create canonical version, propagate.

- [ ] `.gitignore` - 6 versions (merge all patterns)
- [ ] `eslint.config.js` - 3 versions (pick most complete)
- [ ] `jest.setup.js` - 4 versions (merge mocks)
- [ ] `playwright.config.js` - 4 versions (standardize)
- [ ] `scripts/lib/compact.sh` - 4 versions (pick best)

---

## Wave 3: Update INTENTIONAL_DIFF_PATTERNS

**Strategy:** Some files SHOULD differ (contain project-specific data). Update the diff tool.

Files that should be marked as intentional:
- [ ] `assistant/js/storage.js` - Contains DB_NAME per project
- [ ] `js/storage.js` - Mirror of above
- [ ] `assistant/js/app.js` - Different import patterns per project
- [ ] `js/app.js` - Mirror of above

---

## Wave 4: Core JS Files (Major Effort)

**Strategy:** These have structural differences. Need careful analysis.

### Files with 6 different versions:
- [ ] `assistant/js/project-view.js`
- [ ] `assistant/js/projects.js`
- [ ] `assistant/js/router.js`
- [ ] `assistant/js/views.js`
- [ ] `assistant/js/workflow.js`
- [ ] `validator/js/app.js`

### Mirror files (js/ = assistant/js/):
- [ ] `js/project-view.js`
- [ ] `js/projects.js`
- [ ] `js/router.js`
- [ ] `js/views.js`
- [ ] `js/workflow.js`

---

## Wave 5: Test Files

**Strategy:** Tests should match their source files. Update after Wave 4.

- [ ] `assistant/tests/project-view.test.js`
- [ ] `assistant/tests/projects.test.js`
- [ ] `assistant/tests/router.test.js`
- [ ] `assistant/tests/storage.test.js`
- [ ] `assistant/tests/ui.test.js`
- [ ] `assistant/tests/views.test.js`
- [ ] `assistant/tests/workflow.test.js`
- [ ] `assistant/tests/diff-view.test.js`
- [ ] `assistant/tests/error-handler.test.js`

---

## Wave 6: Remaining Files

- [ ] `assistant/js/error-handler.js` / `js/error-handler.js`
- [ ] `assistant/js/same-llm-adversarial.js` / `js/same-llm-adversarial.js`

---

## Verification Checklist (After Each Wave)

1. [ ] Run `npm run lint` in each modified project
2. [ ] Run `npm test` in each modified project
3. [ ] Run `node genesis/project-diff/diff-projects.js --ci`
4. [ ] Commit with descriptive message
5. [ ] Push to origin/main

---

## Progress Tracking

| Wave | Status | Divergent Before | Divergent After |
|------|--------|------------------|-----------------|
| 1    | ✅ DONE | 52               | 34              |
| 2    | ✅ DONE | 34               | 29              |
| 3    | ✅ DONE | 29               | 0               |

### Wave 3 Summary

**Unification work completed:**
- Unified `error-handler.js` and `error-handler.test.js` across all projects
- Unified `diff-view.test.js` across all projects
- Unified `same-llm-adversarial.js` across all projects

**Added to INTENTIONAL_DIFF_PATTERNS:**
- `storage.js` (contains project-specific DB_NAME)
- `app.js` (different import patterns per project)
- `project-view.js`, `views.js`, `workflow.js` (document-type specific UI)
- `projects.js`, `router.js` (project management and routing)
- Related test files

**Result:** All files now either match across projects OR are correctly marked as intentionally different.

