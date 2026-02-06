# Genesis Checklist

**Purpose**: Single consolidated checklist for AI assistants creating projects from Genesis templates.

> **Note**: This consolidates the former `00-AI-MUST-READ-FIRST.md`, `GENESIS-SUCCESS-CHECKLIST.md`, and `FIRST-RUN-CHECKLIST.md` into one document.

---

## 🚨 MANDATORY: CONTINUOUS IMPROVEMENT TRACKING

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  EVERY genesis child creation MUST maintain CONTINUOUS_IMPROVEMENT.md       ║
║                                                                              ║
║  Location: genesis-tools/genesis/CONTINUOUS_IMPROVEMENT.md                  ║
║                                                                              ║
║  As you encounter ANY friction, obstacle, or gap:                           ║
║  1. IMMEDIATELY add it to CONTINUOUS_IMPROVEMENT.md                         ║
║  2. Categorize by phase (Immediate Fixes, Documentation Gaps, etc.)         ║
║  3. Include: what happened, expected behavior, suggested fix                ║
║                                                                              ║
║  This is NOT optional. This is how genesis improves.                        ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 🚨 MANDATORY: DIFF TOOL USAGE

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  LLMs are STOCHASTIC. Inconsistency is INEVITABLE without verification.     ║
║                                                                              ║
║  Run the diff tool AGGRESSIVELY throughout development:                     ║
║                                                                              ║
║  cd genesis-tools/genesis/project-diff && node diff-projects.js             ║
║                                                                              ║
║  WHEN TO RUN:                                                                ║
║  ✓ After copying templates (Phase 2)                                        ║
║  ✓ After EVERY significant change                                           ║
║  ✓ Before EVERY commit                                                      ║
║  ✓ When modifying files that exist across multiple projects                 ║
║  ✓ When uncertain if a change should propagate                              ║
║                                                                              ║
║  ⛔ DO NOT PROCEED if MUST_MATCH files show divergence!                     ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 🚨 BEFORE YOU START

### Essential Reading (in order):
1. **[`docs/AI-QUICK-REFERENCE.md`](docs/AI-QUICK-REFERENCE.md)** - Cheat sheet (~130 lines)
2. **[`docs/ADVERSARIAL-WORKFLOW-PATTERN.md`](docs/ADVERSARIAL-WORKFLOW-PATTERN.md)** - The 7-step pattern
3. **[`docs/ANTI-PATTERNS.md`](docs/ANTI-PATTERNS.md)** - What NOT to do
4. **[`docs/UX-PATTERNS.md`](docs/UX-PATTERNS.md)** - 8 critical UX patterns

### Reference Implementation:
Study https://github.com/bordenet/product-requirements-assistant - especially:
- `js/workflow.js` - Phase architecture
- `prompts/phase1.md` - Prompt template pattern
- `docs/index.html` lines 9-15 - Tailwind dark mode config

### Key Concepts:

| Concept | Summary |
|---------|---------|
| 7-Step Workflow | User Input → Prompt → Claude → Prompt → Gemini → Prompt → Claude |
| Apps generate PROMPTS | NOT AI responses - user copies to external AI |
| Template variables | `{project_name}`, `{phase1_output}`, `{phase2_output}` |
| Dark mode | Tailwind `darkMode: 'class'` + loadTheme() in head |
| Event handlers | Wire ALL buttons immediately after rendering |

---

## ✅ SUCCESS CRITERIA

A Genesis project is complete when:
- [ ] All tests pass with ≥50% coverage (enforced in jest.config.js)
- [ ] All linting passes with zero errors
- [ ] Pre-commit hooks installed and working
- [ ] GitHub Actions CI/CD passes
- [ ] Web app loads without console errors
- [ ] No template variables remain (`{{...}}`)
- [ ] `genesis/` directory deleted

---

## 📋 PHASE-BY-PHASE CHECKLIST

### Phase 1: Requirements
- [ ] Asked user for: project name, title, description, GitHub user/repo
- [ ] Asked user for: document type, peer site navigation, GitHub Pages architecture
- [ ] Did NOT ask questions answered by reference implementation

### Phase 1.5: Domain Research 🔬 (MANDATORY)
- [ ] Identified 5-7 progressive research prompts with user
- [ ] Conducted Perplexity research for each prompt
- [ ] Saved all prompts and answers to `docs/{DOCUMENT_TYPE}-RESEARCH-{YEAR}.md`
- [ ] Extracted form fields from research findings
- [ ] Extracted validator scoring dimensions from research
- [ ] Extracted LLM prompt guidance from research
- [ ] Identified red flags and anti-patterns to detect
- [ ] Committed research file to git

> **Why This Matters**: Without domain research, validator will use generic one-pager
> criteria instead of document-specific criteria. Research is the #1 predictor of quality.
> See `jd-assistant/docs/JD-RESEARCH-2025.md` for reference.

### Phase 2: Copy Templates
- [ ] Copied all core files (.gitignore, CLAUDE.md, DESIGN-PATTERNS.md, README.md, package.json, etc.)
- [ ] Copied all web app files (index.html, js/*.js, css/*.css)
- [ ] Copied all test files (tests/*.test.js)
- [ ] Copied all prompt files (prompts/*.md)
- [ ] Copied all scripts (scripts/*.sh, scripts/lib/*.sh)
- [ ] Made all scripts executable: `chmod +x scripts/*.sh scripts/lib/*.sh`
- [ ] **MANDATORY**: Added project to `genesis/project-diff/diff-projects.js` PROJECTS array
- [ ] **MANDATORY**: Ran `node genesis/project-diff/diff-projects.js` and verified new project appears in output

#### 🚨 CHECKPOINT: After Phase 2 (Template Copying)
```bash
cd genesis-tools/genesis/project-diff && node diff-projects.js
```
- [ ] Output shows: "✓ ALL MUST-MATCH FILES ARE IDENTICAL"
- [ ] Output shows: "✓ NO STUB VALIDATORS DETECTED" (or only hello-world flagged)
- [ ] ❌ **DO NOT PROCEED** if divergent files exist

### Phase 3: Variable Replacement
- [ ] Replaced ALL `{{VARIABLES}}` in all files
- [ ] Verified: `grep -r "{{" . --exclude-dir=node_modules --exclude-dir=genesis` returns nothing
- [ ] **Template field validation**: Search for template-specific field names:
  ```bash
  grep -rn "dealershipName\|proposalTitle\|onePagerTitle\|problemClarity\|solutionFit" . --exclude-dir=node_modules
  ```
- [ ] Replace ALL template-specific field names with your domain-specific names
- [ ] Verify import/export validation uses YOUR field names (check `projects.js` importProjects function)

#### 🚨 MANDATORY: Post-Template Verification Scans

**Why This Exists**: On 2026-02-06, `business-justification-assistant` was discovered to have been created from hello-world but NEVER CUSTOMIZED. Only README.md was updated - all app code retained template placeholders and the validator scored documents against one-pager criteria!

**Run these scans IMMEDIATELY after Phase 3 variable replacement:**

```bash
# 1. Check for ANY remaining template placeholders
grep -rn "{{" . --include="*.html" --include="*.js" --include="*.json" | grep -v node_modules | grep -v "\.test\." | grep -v "// " | grep -v "prompts.js.*VAR_NAME"
# Expected: EMPTY output (no template placeholders remaining)

# 2. Check for one-pager references in non-navigation code
grep -rn "one-pager\|One-Pager\|One Pager" . --include="*.html" --include="*.js" --include="*.json" | grep -v node_modules | grep -v "github.io/one-pager"
# Expected: Only navigation links to one-pager tool (if any)

# 3. Verify package.json name is NOT hello-world
grep '"name":' package.json
# Expected: YOUR project name, NOT "hello-world-genesis-example"

# 4. Verify IndexedDB names are unique (CRITICAL - prevents data collision!)
grep -rn "DB_NAME\|createStorage" . --include="*.js" | grep -v node_modules | grep -v "\.test\."
# Expected: YOUR project name in DB_NAME, NOT "one-pager" or "hello-world"
```

- [ ] **SCAN 1**: No template placeholders remaining
- [ ] **SCAN 2**: No one-pager references (except navigation links)
- [ ] **SCAN 3**: package.json name is YOUR project name
- [ ] **SCAN 4**: IndexedDB names use YOUR project name (format: `{project-name}-db`)

### Phase 4: Install & Test
- [ ] Ran `npm install`
- [ ] Ran `./scripts/install-hooks.sh`
- [ ] Ran `npm run lint` - zero errors
- [ ] Ran `npm test` - all pass, ≥50% coverage (enforced in jest.config.js)
- [ ] **Test template mismatch check**: Review ALL test files for domain-specific assertions
- [ ] Validator tests check YOUR domain dimensions (not generic one-pager dimensions)
- [ ] Run tests and verify they test YOUR domain, not template domain

#### 🚨 CHECKPOINT: Before Every Commit
```bash
cd genesis-tools/genesis/project-diff && node diff-projects.js
```
- [ ] Output shows: "✓ ALL MUST-MATCH FILES ARE IDENTICAL"
- [ ] ❌ **COMMIT BLOCKED** if divergent files exist
- [ ] If divergent: Fix files to match reference implementation before committing

### Phase 5: Git & GitHub
- [ ] `git init && git add . && git commit -m "Initial commit from Genesis"`
- [ ] Created GitHub repo and pushed
- [ ] Enabled GitHub Pages (Settings → Pages → Branch: main)

### Phase 6: Cleanup
- [ ] `rm -rf genesis/`
- [ ] `git add . && git commit -m "Remove genesis template directory" && git push`

### Phase 7: Final Verification
- [ ] App works at `https://USER.github.io/REPO/`
- [ ] Deployment script works: `./scripts/deploy-web.sh`
- [ ] No `node_modules/` or `coverage/` in git
- [ ] Created `REVERSE-INTEGRATION-NOTES.md` documenting Genesis gaps
- [ ] Smoke test: Open app in browser, verify NO console errors
- [ ] Smoke test: Verify body content renders (not just header/footer)
- [ ] Smoke test: Verify dark mode toggle works (click and see change)
- [ ] Smoke test: Verify "New Project" button works (click and see form)

---

## 🚨 ADVERSARIAL WORKFLOW REQUIREMENTS

**Your app MUST implement all 7 steps:**
1. [ ] Gather input from user via form
2. [ ] Generate prompt for Claude with "ask questions" instruction
3. [ ] Collect markdown from Claude (user copies/pastes)
4. [ ] Generate adversarial prompt for Gemini with "critique + improve" instruction
5. [ ] Collect improved markdown from Gemini (user copies/pastes)
6. [ ] Generate synthesis prompt for Claude with BOTH previous drafts
7. [ ] Collect final synthesized document from Claude

**Verification:**
- [ ] App has "Copy Prompt" buttons (NOT "Generate with AI")
- [ ] Different AIs used: Phase 1 (Claude) → Phase 2 (Gemini) → Phase 3 (Claude)
- [ ] Each prompt includes previous phase outputs
- [ ] App stores user's pasted responses (doesn't generate them)

---

## 🎨 UX PATTERNS VERIFICATION

**Verify all 8 critical UX patterns are working.** See [`docs/UX-PATTERNS.md`](docs/UX-PATTERNS.md) for details.

- [ ] **Sequential Button Reveal**: Open AI button disabled until Copy Prompt clicked
- [ ] **Sequential Textarea Enable**: Response textarea disabled until prompt copied
- [ ] **Shared Browser Tab**: All AI links use `target="ai-assistant-tab"`
- [ ] **Auto-Advance on Save**: Saving response auto-advances to next phase
- [ ] **Step A/B Labeling**: Sub-steps use letters (A/B), not numbers
- [ ] **Dynamic AI Name Labels**: Show "Claude"/"Gemini", not generic "AI"
- [ ] **Footer Stats Auto-Update**: Project count updates after create/delete
- [ ] **Phase Tab Underline Sync**: Active tab underline updates from all navigation

---

## 🚨 COMMON PITFALLS

| Pitfall | Prevention |
|---------|------------|
| Template variables not replaced | Run `grep -r "{{" .` before committing |
| Pre-commit hooks not installed | Run `./scripts/install-hooks.sh` after git init |
| Scripts not executable | Run `chmod +x scripts/*.sh scripts/lib/*.sh` |
| Low test coverage | Write tests alongside features |
| Console errors in web app | Test in browser before committing |
| .env file committed | Ensure `.env` in `.gitignore` BEFORE creating |
| Buttons without handlers | Wire `addEventListener()` immediately after render |
| App deployed but broken | Test in actual browser before claiming done |
| Tests pass, app broken | Unit tests mock DOM - always test in real browser |
| Silent JS failures | ES module imports fail silently - check console |

---

## 📝 HANDOFF TO USER

When complete, tell the user:
```
✅ Your project is ready!

📦 Repository: https://github.com/{user}/{repo}
🌐 Live App: https://{user}.github.io/{repo}/
📋 Next Steps: Review CLAUDE.md for development guidance
📊 Quality: All tests pass (X% coverage), linting clean, CI/CD configured

Use ./scripts/deploy-web.sh for future deployments.
```

---

## 🔄 REVERSE-INTEGRATION

Before finishing:
- [ ] Created `REVERSE-INTEGRATION-NOTES.md` documenting what Genesis is missing
- [ ] Counted references to product-requirements-assistant (if many → Genesis gap!)
- [ ] Told user: "📝 Created [N] reverse-integration notes for Genesis improvements"

