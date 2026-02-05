# Genesis Continuous Improvement Log

> **Generated during**: jd-assistant creation (2026-02-04)
> **Purpose**: Track all friction points for future genesis improvements
> **Status**: 🔄 In Progress

---

## How to Use This Document

1. **During genesis child creation**: Add issues as you encounter them
2. **After child is born**: Process items phase by phase
3. **Mark complete**: Check boxes as fixes are implemented
4. **Archive**: Move to `_archive/` when all items are resolved

---

## Phase 1: Immediate Fixes (Do First)

High-impact, low-effort fixes that should be done immediately.

- [ ] **Issue**: README.md references non-existent `create-project.sh` script
  - **Encountered when**: Following Quick Start in README.md
  - **Current behavior**: README says `./genesis/scripts/create-project.sh --name my-document` but this script doesn't exist
  - **Expected behavior**: Either the script should exist, or README should be updated to reflect manual setup process
  - **Fix**: Either create the script OR update README.md Quick Start section to point to START-HERE.md manual process

- [ ] **Issue**: START-HERE.md assumes genesis/ is INSIDE the new project
  - **Encountered when**: Reading START-HERE.md Step 3 which says "Copy .gitignore" with `cp genesis/templates/...`
  - **Current behavior**: Instructions assume you're in a repo that already has genesis/ as a subdirectory
  - **Expected behavior**: Instructions should clarify the two workflows: (1) genesis as sibling repo, (2) genesis copied into new project
  - **Fix**: Add a "Prerequisites" section to START-HERE.md explaining how to set up the genesis directory relationship

---

## Phase 2: Documentation Gaps

Missing or unclear documentation that caused confusion.

- [ ] **Gap**: README.md template doesn't include live app links or badges
  - **Encountered when**: After deploying jd-assistant, README still had generic template content
  - **Current behavior**: hello-world README template has placeholder content without:
    - "Try it" links to deployed app and validator
    - CI/codecov badges
    - Star badge
    - Proper "How the Phases Work" section
    - "Part of Genesis Tools" section with related projects
  - **Expected behavior**: Template should prompt for or auto-generate these sections
  - **Fix options**:
    1. Update hello-world README.md to include placeholder links that get replaced during setup
    2. Add README customization step to START-HERE.md checklist
    3. Create a script that generates README from project metadata
  - **Reference**: Compare one-pager/README.md (good) vs hello-world/README.md (template)

- [ ] **Gap**: GitHub Pages deployment architecture not documented in genesis
  - **Location**: genesis/CHECKLIST.md, genesis/START-HERE.md
  - **What happened**: Agent guessed at GitHub Pages architecture (root vs /docs) instead of verifying against existing projects
  - **Fix**: Add explicit documentation stating:
    - Genesis projects serve web app from root (/)
    - The /docs folder is for markdown documentation only (DESIGN-PATTERNS.md, UI_STYLE_GUIDE.md)
    - CI workflow handles lint/test/quality; GitHub Pages is configured separately in repo settings

---

## Phase 3: Template Improvements

Changes needed to genesis templates.

- [ ] **Template**: hello-world baseline has <70% test coverage
  - **Issue**: hello-world baseline has 58.55% coverage, below the 70% threshold stated in CHECKLIST.md
  - **Files with low coverage**: `projects.js` (0%), `attachments.js` (3%), `ui.js` (46%), `workflow.js` (54%)
  - **Fix**: Either lower the threshold in CHECKLIST.md to match reality, or add tests to hello-world baseline

- [ ] **CRITICAL: hello-world index.html has WRONG structure - produces stillborn apps**
  - **Encountered when**: Deployed jd-assistant to GitHub Pages - app was non-functional (empty screen, dark mode broken)
  - **Impact**: TOTAL FAILURE - app shipped broken to production. User extremely frustrated.
  - **Root cause**: hello-world/index.html uses a DIFFERENT HTML structure than working projects
  - **Specific differences found**:
    1. **Missing `#app-container`** - hello-world has static `#projectListView`/`#workflowView` but `views.js` renders to `#app-container`
    2. **Missing Tailwind Typography plugin** - hello-world has `tailwindcss.com` but working projects have `tailwindcss.com?plugins=typography`
    3. **Missing marked.js script tag** - file exists at `js/lib/marked.min.js` but `<script src="...">` tag is missing
    4. **Missing prose styles** - one-pager has 20+ lines of fallback `.prose` CSS for markdown rendering
    5. **Wrong dark mode button ID** - hello-world has `id="darkModeToggle"` but `app.js` looks for `id="theme-toggle"`
    6. **Missing `#loading-overlay`** - `showLoading()`/`hideLoading()` fail silently
    7. **Missing `#toast-container`** - toast notifications don't appear
    8. **Missing `#privacy-notice`** - first-run privacy notice not shown
    9. **Missing footer** - no `#storage-info` element for footer stats
    10. **Missing favicon** - working projects have emoji favicon
    11. **Missing related projects dropdown** - header navigation to sibling tools
  - **Fix**: Replace hello-world/index.html with the one-pager structure (or whichever is canonical)
  - **Validation needed**: Add a check that verifies HTML has all elements the JS expects
  - **Reference files**:
    - BROKEN: `genesis/examples/hello-world/assistant/index.html` (121 lines)
    - WORKING: `one-pager/index.html` (196 lines)

---

## Phase 4: Tooling Enhancements

Improvements to project-diff, validation scripts, etc.

_No issues recorded yet - document as encountered_

---

## Phase 5: Process Improvements

Changes to the overall genesis workflow or AI instructions.

- [ ] **Issue**: AI agents repeatedly commit with wrong git identity
  - **Encountered when**: Creating jd-assistant - all 5 commits used `mattbordenet@hotmail.com` instead of `bordenet@users.noreply.github.com`
  - **Impact**: Had to rewrite git history with filter-branch; user frustration
  - **Root cause**: Genesis templates don't include git identity configuration in setup steps
  - **Fix options**:
    1. Add git config commands to START-HERE.md Step 1 (before first commit)
    2. Add a pre-commit hook that validates author email
    3. Add `.gitconfig` template with correct identity
  - **Workaround applied**: Added git identity rules to workspace-level Agents.md and CLAUDE.md

---

## Resolved Items

_Move completed items here with resolution notes_

---

## Session Log

| Timestamp | Action | Notes |
|-----------|--------|-------|
| 2026-02-04 | Created jd-assistant directory | `/Users/matt/GitHub/Personal/genesis-tools/jd-assistant` |
| 2026-02-04 | Initialized git repo | Branch: main |
| 2026-02-04 | Created this file | Starting continuous improvement tracking |
| 2026-02-04 | Phase 2 complete | Templates copied, variables replaced, quality gates pass |
| 2026-02-04 | Phase 3 started | Domain research - user providing Perplexity research |
| 2026-02-04 | Requirement noted | Optional career ladder field for accurate leveling |
| 2026-02-04 | Requirement noted | Company-mandated preambles field (EEO, diversity statements) |
| 2026-02-04 | Requirement noted | Company-mandated legal text field at end (disclaimers, notices) |
| 2026-02-04 | Gap identified | AI instructions don't specify next steps after domain research — agent had to ask user what to do next instead of following a defined sequence |
| 2026-02-05 | Implementation complete | All 4 tasks done: form fields, prompts, prompts.js, validator. 316 tests passing. |
| 2026-02-05 | Git identity issue | All commits used wrong email; had to rewrite history with filter-branch |
| 2026-02-05 | Friction documented | Added git identity rules to Personal/Agents.md and Personal/CLAUDE.md |
| 2026-02-05 | **CRITICAL FAILURE** | App deployed but non-functional. Empty screen, dark mode broken. Discovered hello-world template has completely wrong index.html structure. |
| 2026-02-05 | Root cause identified | 11 differences between hello-world and one-pager index.html - views.js expects `#app-container` which doesn't exist |
| 2026-02-05 | Fix applied | Replaced jd-assistant/index.html with one-pager structure. Fixed views.js, router.js, app.js terminology. Tests still pass. |

