# Markdown File Breakdown Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Break down 24 markdown files (>300 lines each) into smaller, focused files (<250 lines) for optimal AI agent context window usage.

**Architecture:** Each large file becomes an index file linking to focused sub-files. Sub-files are self-contained with clear scope.

**Target:** No file exceeds 250 lines (leaves room for growth before hitting 300-line threshold).

---

## Priority Order

### Tier 1: Core Integration Docs (most frequently loaded)
1. `genesis/integration/SHELL_SCRIPT_STANDARDS.md` (730 lines)
2. `genesis/integration/SAFETY_NET.md` (676 lines)
3. `genesis/integration/CODE_STYLE_STANDARDS.md` (629 lines)
4. `genesis/integration/PROJECT_SETUP_CHECKLIST.md` (628 lines)
5. `genesis/integration/DEVELOPMENT_PROTOCOLS.md` (504 lines)

### Tier 2: Genesis Core Docs
6. `genesis/01-AI-INSTRUCTIONS.md` (488 lines)
7. `genesis/README.md` (436 lines)
8. `genesis/03-CUSTOMIZATION-GUIDE.md` (372 lines)
9. `genesis/04-DEPLOYMENT-GUIDE.md` (333 lines)
10. `genesis/CODE-CONSISTENCY-MANDATE.md` (338 lines)

### Tier 3: Supporting Docs
11. `genesis/docs/WORKFLOW-ARCHITECTURE.md` (425 lines)
12. `genesis/docs/UX-PATTERNS.md` (345 lines)
13. `genesis/examples/hello-world/docs/UI_STYLE_GUIDE.md` (433 lines)

### Tier 4: Testing Docs
14. `docs/testing/TEST_PLAN.md` (880 lines)
15. `docs/testing/TEST_BUGS_REVEALED.md` (688 lines)

### Tier 5: Style Guides
16. `docs/SHELL_SCRIPT_STYLE_GUIDE.md` (502 lines)
17. `docs/PYTHON_STYLE_GUIDE.md` (429 lines)

### Tier 6: Pattern/Anti-Pattern Docs
18. `docs/ANTI-PATTERNS.md` (637 lines)
19. `docs/ADVERSARIAL-WORKFLOW-PATTERN.md` (526 lines)
20. `docs/GENESIS-UI-WORKFLOW-BUG-PREVENTION.md` (327 lines)

### Tier 7: Improvement Tracking
21. `CONTINUOUS_IMPROVEMENT.md` (667 lines)

### Tier 8: Historical/Archive (LOW PRIORITY - rarely loaded)
22. `genesis/docs/archive/GENESIS-PROCESS-IMPROVEMENTS.md` (1,023 lines)
23. `genesis/docs/historical/00-GENESIS-PLAN.md` (1,018 lines)
24. `docs/plans/GENESIS-MODULE-SYSTEM-FIX.md` (545 lines) - COMPLETED PLAN

---

## Breakdown Strategy Per File

### Pattern: Index + Sub-files

**Original file becomes index:**
```markdown
# [Title]

> Quick navigation to focused documentation sections.

## Sections
- [Section A](./subdir/section-a.md) - Brief description
- [Section B](./subdir/section-b.md) - Brief description
```

**Each section becomes standalone file** with:
- Clear H1 title
- "Part of [Parent Doc](../parent.md)" backlink
- Self-contained content
- Under 250 lines

---

## Task 1: Break Down SHELL_SCRIPT_STANDARDS.md

**Current:** 730 lines with these sections:
- Quick Start (lines 23-50)
- Common Library Patterns (extensive code examples)
- Error Handling
- Logging Standards
- Testing Scripts

**Target structure:**
```
genesis/integration/
├── SHELL_SCRIPT_STANDARDS.md (index, ~50 lines)
└── shell-scripts/
    ├── quick-start.md (~80 lines)
    ├── common-library.md (~150 lines)
    ├── error-handling.md (~100 lines)
    ├── logging.md (~100 lines)
    └── testing.md (~100 lines)
```

**Step 1:** Create directory `genesis/integration/shell-scripts/`
**Step 2:** Extract Quick Start section to `quick-start.md`
**Step 3:** Extract Common Library section to `common-library.md`
**Step 4:** Continue for remaining sections
**Step 5:** Replace original with index file
**Step 6:** Verify all links work
**Step 7:** Commit

---

## Task 2-21: Repeat Pattern

Each subsequent task follows the same pattern:
1. Create sub-directory
2. Extract sections to individual files
3. Replace original with index
4. Verify links
5. Commit

---

## Success Criteria

- [ ] No markdown file exceeds 250 lines
- [ ] All original content preserved
- [ ] All cross-references updated
- [ ] Index files provide clear navigation
- [ ] `find . -name "*.md" ! -path "*/node_modules/*" -exec wc -l {} \; | awk '$1 > 250'` returns nothing

