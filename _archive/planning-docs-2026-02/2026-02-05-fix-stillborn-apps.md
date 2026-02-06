# Fix Stillborn Apps Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all issues that caused jd-assistant to deploy as a completely broken app, ensuring ZERO future genesis-derived projects suffer the same fate.

**Architecture:** The hello-world template is the canonical source for new projects. It currently has two fatal flaws: missing `js/core/` directory and wrong `index.html` structure. We will fix the template, add validation tests, and update documentation.

**Tech Stack:** JavaScript, Jest, HTML, Shell scripts

---

## Root Cause Summary

| Issue | Impact | Prevention |
|-------|--------|------------|
| Missing `js/core/` directory | App fails silently - no body content renders | Copy js/core/ from one-pager to hello-world |
| Wrong index.html structure | Dark mode, navigation, toasts all broken | Replace with one-pager structure |
| No smoke test before deploy | Agent deployed broken app to production | Add mandatory smoke test to checklist |
| Unit tests don't catch missing modules | Tests pass, app broken | Add integration test that loads app.js |
| Silent ES module import failures | No console errors to debug | Add explicit import validation |

---

## Task 1: Add js/core/ Directory to hello-world

**Files:**
- Create: `genesis/examples/hello-world/js/core/workflow.js`
- Create: `genesis/examples/hello-world/js/core/storage.js`
- Create: `genesis/examples/hello-world/js/core/ui.js`
- Create: `genesis/examples/hello-world/js/core/index.js`

**Step 1: Copy js/core/ from one-pager**

```bash
cp -r ../../one-pager/js/core genesis/examples/hello-world/js/core
```

**Step 2: Verify files exist**

```bash
ls -la genesis/examples/hello-world/js/core/
# Expected: workflow.js, storage.js, ui.js, index.js
```

**Step 3: Test import works**

```bash
cd genesis/examples/hello-world
node --experimental-vm-modules -e "import('./js/workflow.js').then(() => console.log('OK')).catch(e => console.error(e))"
# Expected: OK (or localStorage error, which is acceptable in Node)
```

**Step 4: Commit**

```bash
git add js/core/
git commit -m "fix(hello-world): add missing js/core/ directory

CRITICAL FIX: js/workflow.js imports from ./core/workflow.js which didn't exist.
This caused all projects created from hello-world to be completely broken.

Copied from one-pager which has the complete structure."
```

---

## Task 2: Replace hello-world index.html

**Files:**
- Modify: `genesis/examples/hello-world/index.html` (complete replacement)

**Step 1: Backup current index.html**

```bash
cp genesis/examples/hello-world/index.html genesis/examples/hello-world/index.html.bak
```

**Step 2: Copy one-pager index.html structure**

```bash
cp ../../one-pager/index.html genesis/examples/hello-world/index.html
```

**Step 3: Update title and branding for hello-world**

Replace:
- Title: "One-Pager Assistant" → "Hello World - Genesis Example"
- Emoji: 📄 → 🌍
- Description: Update to "Minimal 2-phase AI workflow application"
- GitHub links: Update to hello-world repo

**Step 4: Verify critical elements exist**

```bash
grep -c "app-container\|theme-toggle\|loading-overlay\|toast-container\|storage-info" genesis/examples/hello-world/index.html
# Expected: 5 (all critical elements present)
```

**Step 5: Commit**

```bash
git add index.html
git commit -m "fix(hello-world): replace index.html with working structure

Replaces broken index.html with one-pager structure containing all 11 critical elements:
1. #app-container for dynamic content
2. Tailwind Typography plugin
3. marked.js script tag
4. Prose CSS fallback styles
5. #theme-toggle button
6. #loading-overlay
7. #toast-container
8. #privacy-notice
9. #storage-info footer
10. Favicon
11. Related projects dropdown"
```

---

## Task 3: Add Integration Smoke Test

**Files:**
- Create: `genesis/examples/hello-world/tests/smoke.test.js`

**Step 1: Write the failing test**

```javascript
/**
 * @jest-environment jsdom
 */

describe('Smoke Test - App Initialization', () => {
  beforeEach(() => {
    // Set up minimal DOM required by app
    document.body.innerHTML = `
      <div id="app-container"></div>
      <div id="loading-overlay" class="hidden"></div>
      <div id="toast-container"></div>
      <button id="theme-toggle"></button>
      <span id="storage-info"></span>
    `;
  });

  test('app.js can be imported without errors', async () => {
    // This will fail if any import in the chain is missing
    await expect(import('../js/app.js')).resolves.toBeDefined();
  });

  test('all required DOM elements exist', () => {
    expect(document.getElementById('app-container')).not.toBeNull();
    expect(document.getElementById('loading-overlay')).not.toBeNull();
    expect(document.getElementById('toast-container')).not.toBeNull();
    expect(document.getElementById('theme-toggle')).not.toBeNull();
    expect(document.getElementById('storage-info')).not.toBeNull();
  });
});
```

**Step 2: Run test to verify it fails (before fix) or passes (after fix)**

```bash
npm test -- tests/smoke.test.js
```

**Step 3: Commit**

```bash
git add tests/smoke.test.js
git commit -m "test(hello-world): add smoke test for app initialization

Catches the exact failure mode that broke jd-assistant:
- Verifies app.js can be imported (catches missing js/core/)
- Verifies required DOM elements exist (catches wrong index.html)"
```

---

## Task 4: Update CHECKLIST.md with Smoke Test Requirement

**Files:**
- Modify: `genesis/CHECKLIST.md`

**Step 1: Add to Phase 7: Final Verification**

Add after line 83:
```markdown
- [ ] Smoke test: App loads in browser without console errors
- [ ] Smoke test: Body content renders (not just header/footer)
- [ ] Smoke test: Dark mode toggle works
- [ ] Smoke test: New Project button works
```

**Step 2: Add to Common Pitfalls table**

Add row:
```markdown
| App deployed but broken | Test in actual browser before claiming done |
| Tests pass, app broken | Unit tests don't catch missing modules - test in browser |
```

**Step 3: Commit**

```bash
git add CHECKLIST.md
git commit -m "docs: add mandatory smoke test steps to checklist

Prevents the jd-assistant failure mode where:
- All unit tests passed
- CI passed
- App was completely broken

Now requires actual browser testing before claiming done."
```

---

## Task 5: Run All Tests and Verify

**Step 1: Run tests in hello-world**

```bash
cd genesis/examples/hello-world
npm test
```

Expected: All tests pass, including new smoke test

**Step 2: Verify app works locally**

```bash
python3 -m http.server 8000 &
# Open http://localhost:8000 in browser
# Verify: App loads, dark mode works, New Project button works
```

**Step 3: Create PR**

```bash
git push origin fix/stillborn-apps
gh pr create --title "fix: prevent stillborn apps from hello-world template" \
  --body "Fixes the exact issues that caused jd-assistant to deploy broken:
1. Added missing js/core/ directory
2. Replaced broken index.html with working structure
3. Added smoke test to catch this in future
4. Updated checklist with mandatory browser testing"
```

---

## Execution Handoff

**Plan complete and saved to `docs/plans/2026-02-05-fix-stillborn-apps.md`.**

This plan should be executed via **Subagent-Driven Development** since we're in the same session.

