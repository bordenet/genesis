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

- [ ] **CRITICAL: Export/Import All Tests Are Inconsistent Across Projects**
  - **Encountered when**: Auditing test coverage for Export and Import All features across all genesis apps (2026-02-05)
  - **Impact**: The canonical hello-world template has MINIMAL tests for export/import, while derived projects have inconsistent coverage
  - **Root cause**: hello-world only verifies functions exist (stub tests), doesn't test actual functionality

  ### Current State (as of 2026-02-05):

  | Project | `exportAllProjects` | `importProjects` | `storage.exportAll` | `storage.importAll` |
  |---------|---------------------|------------------|---------------------|---------------------|
  | **hello-world** (canonical) | ⚠️ Stub only | ⚠️ Stub only | ❌ None | ❌ None |
  | **one-pager** | ✅ Full | ✅ Full (4 tests) | ❌ None | ❌ None |
  | **power-statement-assistant** | ✅ Full | ✅ Full (4 tests) | ✅ Full | ✅ Full |
  | **pr-faq-assistant** | ✅ Full | ✅ Basic (1 test) | ✅ Structure | ✅ Validation |
  | **product-requirements-assistant** | ✅ Full | ✅ Full (4 tests) | ❌ None | ❌ None |
  | **strategic-proposal** | ⚠️ Stub only | ⚠️ Stub only | ❌ None | ❌ None |
  | **jd-assistant** | ⚠️ Stub only | ⚠️ Stub only | ❌ None | ❌ None |
  | **architecture-decision-record** | ⚠️ Stub only | ⚠️ Stub only | ❌ None | ❌ None |

  Legend: ✅ Full functional tests | ⚠️ Only verifies function exists | ❌ No tests

  ### What "Stub Only" Means:
  ```javascript
  // This is ALL hello-world has - just checks the function exists:
  test('should export exportAllProjects function', () => {
    expect(exportAllProjects).toBeInstanceOf(Function);
  });
  ```

  ### What "Full Tests" Look Like (from one-pager):
  ```javascript
  describe('exportAllProjects', () => {
    test('should export all projects as backup JSON', async () => {
      await createProject('Project 1', 'Problems 1', 'Context 1');
      await exportAllProjects();
      expect(URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('importProjects', () => {
    test('should import backup file format', async () => { /* ... */ });
    test('should import single project format', async () => { /* ... */ });
    test('should reject invalid file format', async () => { /* ... */ });
    test('should reject invalid JSON', async () => { /* ... */ });
  });
  ```

  ### Required Fixes:
  1. **Add comprehensive export/import tests to hello-world** - This is the canonical reference, it MUST have full test coverage
  2. **Backfill tests to strategic-proposal, jd-assistant, architecture-decision-record** - These match hello-world's broken state
  3. **Standardize storage.test.js** - power-statement-assistant has `exportAll`/`importAll` tests that others lack
  4. **Add to project-diff checks** - Ensure test coverage for these features is consistent across projects

  ### Files to Update:
  - `genesis/examples/hello-world/assistant/tests/projects.test.js` - Add full export/import tests
  - `genesis/examples/hello-world/assistant/tests/storage.test.js` - Add exportAll/importAll tests
  - Then propagate to: strategic-proposal, jd-assistant, architecture-decision-record

- [ ] **CRITICAL: hello-world template produces COMPLETELY BROKEN apps**
  - **Encountered when**: Deployed jd-assistant to GitHub Pages - app was non-functional (empty screen, no body content, dark mode broken, navigation broken)
  - **Impact**: TOTAL FAILURE - app shipped broken to production. User extremely frustrated. Multiple fix attempts required.
  - **Root cause analysis**:

  ### Issue 1: Missing `js/core/` directory (FATAL)
  - **Symptom**: App shows header/footer but NO body content. No console errors visible.
  - **Root cause**: `js/workflow.js` imports from `./core/workflow.js` which DOESN'T EXIST in hello-world template
  - **Why no console error**: ES module import failures are silent in some browsers
  - **Fix**: Copy `js/core/` directory from one-pager (contains workflow.js, storage.js, ui.js, index.js)
  - **Files in js/core/**:
    - `workflow.js` - 3-phase workflow engine, `detectPromptPaste()`, `createWorkflow()`, `createWorkflowConfig()`
    - `storage.js` - Core storage utilities
    - `ui.js` - Core UI utilities
    - `index.js` - Module exports

  ### Issue 2: Wrong index.html structure (FATAL)
  - **Symptom**: Even with js/core/ present, app still broken - dark mode doesn't work, no content renders
  - **Root cause**: hello-world/index.html uses DIFFERENT HTML structure than working projects
  - **Specific differences found** (11 total):
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

  ### Why This Happened (Agent Failure Analysis)
  1. **Copied from wrong source**: Agent copied templates from `genesis/examples/hello-world` instead of a working project like `one-pager`
  2. **No validation of copied files**: Agent didn't verify that copied files actually work together
  3. **Tests passed but app broken**: Unit tests mock the DOM and don't catch missing HTML elements or missing JS modules
  4. **No integration test**: No test that loads the actual index.html and verifies the app initializes
  5. **No smoke test before deploy**: Agent pushed to production without manually testing the deployed app
  6. **Silent failures**: ES module import failures and missing DOM elements fail silently

  ### Required Fixes to Genesis
  1. **Replace hello-world template** with one-pager structure (or mark hello-world as deprecated)
  2. **Add js/core/ to hello-world** if keeping it as template
  3. **Add integration test** that loads index.html and verifies app.js initializes without errors
  4. **Add HTML validation** that checks all IDs referenced in JS exist in HTML
  5. **Add pre-deploy checklist** requiring manual smoke test of deployed app

  - **Reference files**:
    - BROKEN: `genesis/examples/hello-world/assistant/index.html` (121 lines, missing js/core/)
    - WORKING: `one-pager/index.html` (196 lines, has js/core/)

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
| 2026-02-05 | **CRITICAL FAILURE #1** | App deployed but non-functional. Empty screen, dark mode broken. Discovered hello-world template has completely wrong index.html structure. |
| 2026-02-05 | Partial fix | Replaced jd-assistant/index.html with one-pager structure. Fixed views.js, router.js, app.js terminology. Tests still pass. Commit c9b6098. |
| 2026-02-05 | **CRITICAL FAILURE #2** | App STILL broken after index.html fix. Header/footer visible but NO body content. Dark mode and navigation still non-functional. |
| 2026-02-05 | Root cause found | `js/workflow.js` imports from `./core/workflow.js` which DOESN'T EXIST. hello-world template is missing entire `js/core/` directory! |
| 2026-02-05 | Why tests passed | Unit tests mock the DOM and don't catch missing JS modules. ES module import failures are silent in browser. |
| 2026-02-05 | Fix applied | Copied `js/core/` directory from one-pager (workflow.js, storage.js, ui.js, index.js). Commit caf2e36. |
| 2026-02-05 | Agent failure analysis | (1) Copied from wrong source (hello-world not one-pager), (2) No validation of copied files, (3) No smoke test before deploy, (4) Silent failures masked the problem |

