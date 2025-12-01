# Genesis Module System Fix: Implementation Checklist

**Design Document**: `/docs/plans/GENESIS-MODULE-SYSTEM-FIX.md`  
**Status**: Ready to implement  
**Estimated Time**: 8-10 hours (can be split across sessions)  

---

## PHASE 1: UPDATE TEMPLATES (2-3 hours)

### Task 1.1: Update app-template.js
- [ ] File: `genesis/templates/web-app/js/app-template.js`
- [ ] Change: Replace `require()` with `import`
- [ ] Change: Replace `module.exports` with `export`
- [ ] Add: Comment explaining ES6 requirement
- [ ] Verify: Syntax is valid JavaScript
- [ ] Commit: "refactor: convert app template to ES6 modules"

### Task 1.2: Update storage-template.js
- [ ] File: `genesis/templates/web-app/js/storage-template.js`
- [ ] Change: Replace `module.exports = { storage }` with `export { storage }`
- [ ] Verify: Class definition unchanged
- [ ] Verify: All methods preserved
- [ ] Commit: "refactor: convert storage template to ES6 modules"

### Task 1.3: Update ui-template.js (CRITICAL - includes new scaffold)
- [ ] File: `genesis/templates/web-app/js/ui-template.js`
- [ ] Change: Replace `module.exports` with `export`
- [ ] Add: New `setupDOMBindings()` function that includes:
  - [ ] Theme toggle button listener
  - [ ] Export button listener
  - [ ] Import button listener
  - [ ] Related projects dropdown listeners
- [ ] Add: Auto-execute `setupDOMBindings()` on DOM ready
- [ ] Verify: All button IDs match index-template.html
- [ ] Commit: "refactor: convert ui template to ES6 modules + add event listener scaffold"

### Task 1.4: Update workflow-template.js
- [ ] File: `genesis/templates/web-app/js/workflow-template.js`
- [ ] Change: Replace `require()` with `import`
- [ ] Change: Replace `module.exports` with `export`
- [ ] Verify: Exported names match their usages
- [ ] Commit: "refactor: convert workflow template to ES6 modules"

### Task 1.5: Update views-template.js
- [ ] File: `genesis/templates/web-app/js/views-template.js`
- [ ] Change: Replace `require()` with `import`
- [ ] Change: Replace `module.exports` with `export`
- [ ] Verify: All functions exported
- [ ] Commit: "refactor: convert views template to ES6 modules"

### Task 1.6: Update router-template.js
- [ ] File: `genesis/templates/web-app/js/router-template.js`
- [ ] Change: Replace `require()` with `import`
- [ ] Change: Replace `module.exports` with `export`
- [ ] Verify: Router class properly exported
- [ ] Commit: "refactor: convert router template to ES6 modules"

### Task 1.7: Update projects-template.js
- [ ] File: `genesis/templates/web-app/js/projects-template.js`
- [ ] Change: Replace `require()` with `import`
- [ ] Change: Replace `module.exports` with `export`
- [ ] Verify: ProjectManager class exported
- [ ] Commit: "refactor: convert projects template to ES6 modules"

### Task 1.8: Update project-view-template.js
- [ ] File: `genesis/templates/web-app/js/project-view-template.js`
- [ ] Change: Replace `require()` with `import`
- [ ] Change: Replace `module.exports` with `export`
- [ ] Verify: ProjectView class exported
- [ ] Commit: "refactor: convert project-view template to ES6 modules"

### Task 1.9: Update phase2-review-template.js (or similar)
- [ ] File: Locate phase2 review template
- [ ] Change: Replace `require()` with `import`
- [ ] Change: Replace `module.exports` with `export`
- [ ] Commit: "refactor: convert phase2-review template to ES6 modules"

### Task 1.10: Update ai-mock-template.js
- [ ] File: `genesis/templates/web-app/js/ai-mock-template.js`
- [ ] Change: Replace `module.exports` with `export`
- [ ] Verify: Mock functions properly exported
- [ ] Commit: "refactor: convert ai-mock template to ES6 modules"

### Task 1.11: Update ai-mock-ui-template.js
- [ ] File: `genesis/templates/web-app/js/ai-mock-ui-template.js`
- [ ] Change: Replace `module.exports` with `export`
- [ ] Verify: UI functions exported
- [ ] Commit: "refactor: convert ai-mock-ui template to ES6 modules"

### Task 1.12: Update same-llm-adversarial-template.js
- [ ] File: `genesis/templates/web-app/js/same-llm-adversarial-template.js`
- [ ] Change: Replace `module.exports` with `export`
- [ ] Verify: All functions exported
- [ ] Commit: "refactor: convert same-llm-adversarial template to ES6 modules"

### Task 1.13: Update index-template.html
- [ ] File: `genesis/templates/web-app/index-template.html`
- [ ] Change: Enhance Tailwind config comment section
- [ ] Add: Explanation of `type="module"` requirement
- [ ] Add: Link to REFERENCE-IMPLEMENTATIONS.md module-system section
- [ ] Verify: Script tags still present with `type="module"`
- [ ] Commit: "docs: clarify ES6 module requirements in index template"

### Phase 1 Completion Criteria
- [ ] All 12 templates use `export` syntax (no `module.exports`)
- [ ] All 12 templates use `import` syntax (no `require()`)
- [ ] setupDOMBindings() scaffold present in ui-template.js
- [ ] All commits follow pattern: "refactor: convert X template to ES6 modules"
- [ ] index-template.html has enhanced documentation

---

## PHASE 2: UPDATE AI INSTRUCTIONS (1 hour)

### Task 2.1: Add module-system validation to 01-AI-INSTRUCTIONS.md
- [ ] File: `genesis/01-AI-INSTRUCTIONS.md`
- [ ] Add: New section "⚠️ CRITICAL: Module System Validation"
- [ ] Include: 5 validation checks:
  - [ ] "Declare Module Type First"
  - [ ] "Check Template Imports"
  - [ ] "Validate Event Listener Pattern"
  - [ ] "Enforce Template Variable Replacement"
  - [ ] "Browser-Compatibility Check"
- [ ] Include: Validation checklist (7 items)
- [ ] Add: Code examples (before/after)
- [ ] Commit: "docs: add critical module-system validation section to AI instructions"

### Task 2.2: Update REFERENCE-IMPLEMENTATIONS.md
- [ ] File: `genesis/REFERENCE-IMPLEMENTATIONS.md`
- [ ] Add: New section "Module System: Browser ES6 Modules"
- [ ] Include: "✅ Correct Pattern" subsection
- [ ] Include: "❌ Incorrect Pattern" subsection
- [ ] Include: "🎯 Best Practice Going Forward" subsection
- [ ] Add: Links to reference implementations (PRA, one-pager, architecture-decision-record)
- [ ] Commit: "docs: add module-system reference guide with correct patterns"

### Phase 2 Completion Criteria
- [ ] AI instructions have dedicated module-system section
- [ ] Validation checklist is explicit and enforceable
- [ ] Reference guide shows correct vs. incorrect patterns
- [ ] Links to working examples provided

---

## PHASE 3: ADD AUTOMATED VALIDATION (1-2 hours)

### Task 3.1: Create validate-module-system.sh
- [ ] File: Create `genesis-validator/scripts/validate-module-system.sh`
- [ ] Implement: Check 1 - No CommonJS exports
  ```bash
  grep -r "module\.exports" js/ → ERROR if found
  ```
- [ ] Implement: Check 2 - No require() calls
  ```bash
  grep -r "require(" js/ → ERROR if found
  ```
- [ ] Implement: Check 3 - No unreplaced template variables
  ```bash
  grep -r "{{[A-Z_]*}}" . → ERROR if found
  ```
- [ ] Implement: Check 4 - Event listeners defined
  ```bash
  grep "addEventListener" js/ui.js → WARNING if not found
  ```
- [ ] Commit: "feat: add module-system validation script"

### Task 3.2: Integrate validation into setup scripts
- [ ] File: `scripts/setup-macos.sh`
- [ ] Add: Call to `validate-module-system.sh` at end
- [ ] Add: Clear error messages if validation fails
- [ ] Add: Help text pointing to fix documentation
- [ ] Verify: Validation runs before "Setup complete" message
- [ ] Commit: "feat: integrate module-system validation into setup process"

### Task 3.3: Update setup-linux.sh (if exists)
- [ ] File: `scripts/setup-linux.sh` (if applicable)
- [ ] Add: Same validation integration as macOS script
- [ ] Commit: "feat: add module-system validation to Linux setup"

### Phase 3 Completion Criteria
- [ ] Validation script exists and is executable
- [ ] Catches CommonJS exports, require() calls, template variables
- [ ] Integrated into setup scripts
- [ ] Clear error messages guide users to fix issues
- [ ] Validation runs before declaring setup "complete"

---

## PHASE 4: TEST AGAINST EXISTING FAILURES (1-2 hours)

### Task 4.1: Test against architecture-decision-record
- [ ] Goal: Verify new validation would have caught original issues
- [ ] Step 1: Copy new templates to /tmp
- [ ] Step 2: Simulate fresh bootstrap with old AI code
- [ ] Step 3: Run validation script
- [ ] Expected: Validation catches `module.exports` in js/storage.js
- [ ] Expected: Validation catches missing event listeners
- [ ] Document: Test results in TESTING-RESULTS.md
- [ ] Commit: "test: verify module-system validation catches architecture-decision-record issues"

### Task 4.2: Test against product-requirements-assistant
- [ ] Goal: Ensure validation doesn't break good projects
- [ ] Step 1: Get fresh PRA code
- [ ] Step 2: Run new validation
- [ ] Expected: All checks PASS
- [ ] Document: Test results
- [ ] Commit: "test: verify module-system validation passes on PRA"

### Task 4.3: Test against one-pager
- [ ] Goal: Ensure validation works across different project types
- [ ] Step 1: Get fresh one-pager code
- [ ] Step 2: Run validation
- [ ] Expected: All checks PASS
- [ ] Document: Test results
- [ ] Commit: "test: verify module-system validation passes on one-pager"

### Task 4.4: Fresh bootstrap simulation
- [ ] Goal: Verify new templates + validation work together
- [ ] Step 1: Use updated templates from Phase 1
- [ ] Step 2: Simulate bootstrap with new guidelines
- [ ] Step 3: Run validation
- [ ] Expected: All checks PASS
- [ ] Expected: App loads in browser without bundler
- [ ] Document: Results
- [ ] Commit: "test: verify fresh bootstrap with new templates passes validation"

### Phase 4 Completion Criteria
- [ ] Validation catches original failures (CommonJS, missing listeners)
- [ ] Validation passes on working projects (PRA, one-pager)
- [ ] Fresh bootstrap creates ES6-only code
- [ ] All test results documented

---

## PHASE 5: DOCUMENTATION & HANDOFF (30 min)

### Task 5.1: Update TROUBLESHOOTING.md
- [ ] File: `genesis/TROUBLESHOOTING.md`
- [ ] Add: New section "App doesn't load in browser"
  - [ ] Symptom: "Cannot find module" error
  - [ ] Cause: CommonJS vs ES6 mismatch
  - [ ] Fix: Ensure all .js files use `import`/`export`
- [ ] Add: New section "Dark mode/buttons don't work"
  - [ ] Symptom: Buttons exist but don't respond
  - [ ] Cause: Event listeners not attached
  - [ ] Fix: Check setupDOMBindings() is called
- [ ] Add: Link to REFERENCE-IMPLEMENTATIONS.md module-system section
- [ ] Commit: "docs: add module-system troubleshooting section"

### Task 5.2: Update CHANGELOG.md
- [ ] File: `CHANGELOG.md` or `GENESIS-CHANGELOG.md`
- [ ] Add: Entry under next version
- [ ] Title: "CRITICAL: Enforce ES6 modules in browser templates"
- [ ] Include: Summary of issue (CommonJS vs ES6 mismatch)
- [ ] Include: What changed (template updates, validation, documentation)
- [ ] Include: Breaking change notice (projects must use ES6)
- [ ] Include: Benefit (no bundler needed, fewer hidden failures)
- [ ] Commit: "docs: add module-system fix to changelog"

### Task 5.3: Create final commit message
- [ ] Compose comprehensive commit message
- [ ] Include: Problem statement
- [ ] Include: Solution overview (4 levels)
- [ ] Include: Implementation summary (5 phases)
- [ ] Include: Testing results
- [ ] Include: Link to design document
- [ ] Commit: Major commit summarizing all changes

### Phase 5 Completion Criteria
- [ ] TROUBLESHOOTING.md has module-system debugging guide
- [ ] CHANGELOG.md documents the fix and breaking changes
- [ ] Final commit message comprehensive and informative

---

## FINAL VERIFICATION

After completing all phases:

```bash
# 1. Verify all templates use ES6
cd genesis/templates/web-app/js
grep -l "module\.exports" *.js
# → Should print: nothing (no matches)

grep -l "require(" *.js
# → Should print: nothing (no matches)

# 2. Verify validation script exists
ls -la genesis-validator/scripts/validate-module-system.sh
# → Should exist and be executable

# 3. Verify documentation updated
grep -l "Module System" genesis/01-AI-INSTRUCTIONS.md genesis/REFERENCE-IMPLEMENTATIONS.md
# → Should match both files

# 4. Run full test
cd /tmp && rm -rf test-bootstrap
mkdir test-bootstrap && cd test-bootstrap
bash /Users/matt/GitHub/Personal/genesis/genesis-validator/scripts/validate-module-system.sh
# → Should complete with no errors
```

---

## Session Management

### Session 1 (8+ hours available)
- Complete Phases 1-5 in one session

### Session 1 (4-5 hours available)
- Do Phase 1 (templates)
- Do Phase 2 (instructions)
- Defer Phase 3-5 to next session

### Session 2 (4-5 hours available)
- Do Phase 3 (validation)
- Do Phase 4 (testing)
- Do Phase 5 (documentation)

### Checkpoint for Mid-Session Breaks
After each phase:
```bash
cd /Users/matt/GitHub/Personal/genesis
git status  # Should be clean (all committed)
git log --oneline | head -10  # Verify commits
```

---

## Rollback Instructions (If Needed)

```bash
# If something breaks, rollback to design-only state
cd /Users/matt/GitHub/Personal/genesis

# See what was committed
git log --oneline | head -20

# Rollback to before implementation started
git reset --hard 3d0fa8f  # Reset to design document commit

# Verify rollback
git log --oneline | head -5
```

---

**Checklist Created**: 2025-12-01  
**Status**: Ready to implement after reboot  
**Estimated Total Time**: 8-10 hours  
**Can Be Split Across**: 2 sessions of 4-5 hours each
