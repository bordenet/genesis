# Genesis Checklist

> **Audience**: AI assistants creating projects from Genesis templates

---

## Mandatory: Throughout Development

**Log obstacles**: Add friction/gaps to [CONTINUOUS_IMPROVEMENT.md](../CONTINUOUS_IMPROVEMENT.md) immediately.

**Run diff tool**: MUST run before every commit:

```bash
cd genesis-tools/genesis/project-diff && node diff-projects.js --ci
# Expected: ✓ ALL MUST-MATCH FILES ARE IDENTICAL
```

---

## Before You Start

Read in order:
1. [AI-QUICK-REFERENCE.md](../docs/AI-QUICK-REFERENCE.md) - Cheat sheet
2. [ADVERSARIAL-WORKFLOW-PATTERN.md](../docs/ADVERSARIAL-WORKFLOW-PATTERN.md) - 7-step pattern
3. [ANTI-PATTERNS.md](../docs/ANTI-PATTERNS.md) - What NOT to do

Reference: [hello-world](examples/hello-world) - source of truth for all copying.

---

## Success Criteria

- [ ] Tests pass with ≥70% coverage
- [ ] Lint passes with zero errors
- [ ] Pre-commit hooks installed
- [ ] GitHub Actions CI passes
- [ ] Web app loads without console errors
- [ ] No `{{...}}` template variables remain
- [ ] `genesis/` directory deleted

---

## Phase Checklist

### Phase 1: Requirements

- [ ] Gather: project name, title, description, GitHub user/repo
- [ ] Gather: document type, peer site navigation

### Phase 1.5: Domain Research (MANDATORY)

- [ ] 5-7 Perplexity research prompts with user
- [ ] Save to `docs/About.md`
- [ ] Extract: form fields, validator scoring dimensions, red flags

### Phase 2: Copy Templates

- [ ] Copy all from [hello-world](examples/hello-world)
- [ ] `chmod +x scripts/*.sh scripts/lib/*.sh`
- [ ] Add project to `project-diff/diff-projects.js` PROJECTS array
- [ ] Run diff tool - verify "✓ ALL MUST-MATCH FILES ARE IDENTICAL"

> **CHECKPOINT**: Confirm items 1-4 complete before Phase 3.

### Phase 3: Variable Replacement

- [ ] Replace ALL `{{VARIABLES}}`
- [ ] Customize `shared/js/import-document.js`:
  - [ ] Set `DOC_TYPE` to your document type name
  - [ ] Set `DOC_TYPE_SHORT` to abbreviated name
  - [ ] Update `LLM_CLEANUP_PROMPT` with your document structure
- [ ] Run verification scans:

```bash
# 1. No template placeholders
grep -rn "{{" . --include="*.html" --include="*.js" | grep -v node_modules
# 2. No one-pager references
grep -rn "one-pager\|One-Pager" . --include="*.html" --include="*.js" | grep -v "github.io/one-pager"
# 3. Package name correct
grep '"name":' package.json
# 4. IndexedDB names unique
grep -rn "DB_NAME" . --include="*.js" | grep -v node_modules
# 5. Import document customized
grep -n "DOC_TYPE\|DOC_TYPE_SHORT" shared/js/import-document.js
```

> **CHECKPOINT**: Confirm scans 1-5 return expected results before Phase 4.

### Phase 4: Install & Test

- [ ] `npm install`
- [ ] `./scripts/install-hooks.sh`
- [ ] `npm run lint` - zero errors
- [ ] `npm test` - all pass, ≥70% coverage
- [ ] Verify tests check YOUR domain, not template domain

### Phase 5: Git & GitHub

- [ ] `git init && git add . && git commit -m "Initial commit"`
- [ ] Create GitHub repo and push
- [ ] Enable GitHub Pages

### Phase 6: Cleanup

- [ ] `rm -rf genesis/`
- [ ] Commit and push

### Phase 7: Final Verification

- [ ] App works at `https://USER.github.io/REPO/`
- [ ] Smoke test: No console errors
- [ ] Smoke test: Dark mode toggle works
- [ ] Smoke test: "New Project" button works
- [ ] Smoke test: Import tile appears and opens modal
- [ ] Smoke test: Import converts pasted HTML to Markdown

> **CHECKPOINT**: Confirm all 6 smoke tests pass before claiming done.

---

## Completion Checklist

Before claiming the project is complete, confirm ALL items:

```
FINAL CHECKPOINT:
□ 1. All Phase 1-7 checkboxes above are checked
□ 2. `npm run lint && npm test` passes
□ 3. Diff tool shows "✓ ALL MUST-MATCH FILES ARE IDENTICAL"
□ 4. App loads without console errors at live URL
□ 5. Adversarial workflow: 7 steps, Copy Prompt buttons, phase outputs chained

Confirm items 1-5 complete before handoff.
```

---

## Related Docs

- [ADVERSARIAL-WORKFLOW-PATTERN.md](../docs/ADVERSARIAL-WORKFLOW-PATTERN.md) - 7-step workflow
- [UX-PATTERNS.md](../docs/UX-PATTERNS.md) - 8 critical UX patterns

---

## Handoff

```
✅ Your project is ready!
📦 Repository: https://github.com/{user}/{repo}
🌐 Live App: https://{user}.github.io/{repo}/
```

