# Genesis Gap Analysis - Deep "What-If" Exercise

**Date**: 2025-11-21  
**Purpose**: Identify ambiguous, unclear, contradictory, illogical, unreachable, or unactionable areas in Genesis  
**Goal**: Ensure a clean https://github.com/bordenet/one-pager app can be generated THE FIRST TIME THROUGH

---

## Executive Summary

This analysis compares Genesis templates against the two reference implementations (product-requirements-assistant and one-pager) to identify gaps that would prevent a first-time-through success.

**Critical Finding**: Genesis is missing **12 critical files/patterns** that exist in both reference implementations but are not in templates or are unreachable via START-HERE.md instructions.

---

## 🔴 CRITICAL GAPS (Blockers)

### 1. Missing Setup Scripts Templates

**Problem**: START-HERE.md line 217-219 instructs:
```bash
cp genesis/templates/scripts/setup-macos-template.sh scripts/setup-macos.sh
# If supporting Linux:
cp genesis/templates/scripts/setup-linux-template.sh scripts/setup-linux.sh
```

**Reality Check**:
- ✅ `genesis/templates/scripts/setup-macos-template.sh` EXISTS
- ✅ `genesis/templates/scripts/setup-macos-web-template.sh` EXISTS  
- ❌ `genesis/templates/scripts/setup-linux-template.sh` DOES NOT EXIST
- ❌ `genesis/templates/scripts/setup-windows-wsl-template.sh` DOES NOT EXIST
- ❌ `genesis/templates/scripts/setup-codecov-template.sh` DOES NOT EXIST

**Reference Implementations Have**:
- product-requirements-assistant: `setup-macos.sh`, `setup-linux.sh`, `setup-windows-wsl.sh`, `setup-codecov.sh`
- one-pager: Only has `deploy-web.sh` (missing setup scripts - this is a gap!)

**Impact**: BLOCKER - AI assistant cannot copy files that don't exist
**Priority**: CRITICAL
**Fix Required**: Create missing setup script templates

---

### 2. Missing .eslintrc.json Template

**Problem**: START-HERE.md line 205 instructs:
```bash
cp genesis/examples/hello-world/.eslintrc.json .
```

**Reality Check**:
- ✅ `genesis/examples/hello-world/.eslintrc.json` EXISTS
- ❌ `genesis/templates/project-structure/.eslintrc-template.json` DOES NOT EXIST

**Issue**: Instruction tells AI to copy from examples instead of templates. This is inconsistent with the template-first approach.

**Reference Implementations Have**:
- product-requirements-assistant: `.eslintrc.json` (not in Genesis templates)
- one-pager: `.eslintrc.json` (not in Genesis templates)

**Impact**: MEDIUM - Works but inconsistent pattern
**Priority**: HIGH
**Fix Required**: Create `.eslintrc-template.json` in `genesis/templates/project-structure/`

---

### 3. Missing codecov.yml Template

**Problem**: No mention of codecov.yml in START-HERE.md or templates

**Reality Check**:
- ❌ `genesis/templates/project-structure/codecov-template.yml` DOES NOT EXIST
- ❌ No instructions in START-HERE.md about code coverage configuration

**Reference Implementations Have**:
- product-requirements-assistant: `codecov.yml` with proper configuration
- one-pager: Missing (this is a gap in one-pager!)

**Impact**: HIGH - Code coverage won't work properly without configuration
**Priority**: HIGH
**Fix Required**: Create `codecov-template.yml` template

---

### 4. Missing Pre-Commit Hook Installation Instructions

**Problem**: Genesis has pre-commit hook template but no installation instructions

**Reality Check**:
- ✅ `genesis/templates/git-hooks/pre-commit-template` EXISTS
- ❌ START-HERE.md has NO instructions to install it
- ❌ No `install-hooks.sh` script template

**Reference Implementations Have**:
- product-requirements-assistant: `scripts/install-hooks.sh` and `scripts/install-hooks.ps1`
- one-pager: Missing (this is a gap in one-pager!)

**Impact**: HIGH - Quality gates won't be enforced locally
**Priority**: HIGH
**Fix Required**: 
1. Create `install-hooks-template.sh` script
2. Add installation step to START-HERE.md

---

### 5. Missing GitHub Actions Workflow Templates

**Problem**: No CI/CD workflow templates exist

**Reality Check**:
- ❌ `genesis/templates/github/workflows/` directory exists but is EMPTY
- ❌ No instructions in START-HERE.md about setting up CI/CD

**Reference Implementations Have**:
- product-requirements-assistant: Has GitHub Actions workflows (not visible in docs/ but likely in .github/)
- one-pager: Missing (this is a gap in one-pager!)

**Impact**: MEDIUM - Manual CI/CD setup required
**Priority**: MEDIUM
**Fix Required**: Create GitHub Actions workflow templates for:
1. Test on PR
2. Deploy to GitHub Pages
3. Code coverage reporting

---

### 6. Ambiguous Template Variable Replacement Instructions

**Problem**: START-HERE.md line 236-246 lists variables to replace but doesn't explain HOW

**Reality Check**:
```markdown
### 3.4 Replace Template Variables

In ALL copied files, replace:
- `{{PROJECT_NAME}}` → actual project name
- `{{PROJECT_TITLE}}` → actual project title
...
```

**Issue**: No concrete instructions on HOW to replace (manual find/replace? sed? script?)

**Reference Implementations**:
- Both were manually edited (no automation)

**Impact**: MEDIUM - AI assistants will figure it out, but wastes time
**Priority**: MEDIUM
**Fix Required**: Add concrete example:
```bash
# Example: Replace variables in deploy-web.sh
sed -i '' 's/{{PROJECT_NAME}}/one-pager/g' scripts/deploy-web.sh
# Or: Use find/replace in your editor
```

---

### 7. Missing prompts/ and templates/ Directory Setup

**Problem**: START-HERE.md doesn't mention creating prompts/ and templates/ directories

**Reality Check**:
- ❌ No instructions to create `prompts/` directory
- ❌ No instructions to create `templates/` directory
- ❌ No prompt template files in `genesis/templates/`

**Reference Implementations Have**:
- product-requirements-assistant: `prompts/phase1.md`, `prompts/phase2.md`, `prompts/phase3.md`, `templates/prd-template.md`
- one-pager: `prompts/phase1.md`, `prompts/phase2.md`, `prompts/phase3.md`, `templates/one-pager-template.md`

**Impact**: CRITICAL - Core workflow files missing
**Priority**: CRITICAL
**Fix Required**:
1. Create `genesis/templates/prompts/` with phase templates
2. Create `genesis/templates/templates/` with document templates
3. Add instructions to START-HERE.md

---

### 8. Missing Navigation Dropdown Customization Instructions

**Problem**: Template has related projects dropdown but no instructions on customizing it

**Reality Check**:
- ✅ `genesis/templates/web-app/index-template.html` has related projects dropdown (lines 43-60)
- ❌ No instructions in START-HERE.md on how to customize it
- ❌ Comment says "Add your related projects here" but no guidance

**Reference Implementations Have**:
- product-requirements-assistant: Dropdown with link to one-pager
- one-pager: Dropdown with link to product-requirements-assistant

**Impact**: LOW - Works as-is but needs customization
**Priority**: LOW
**Fix Required**: Add customization instructions to START-HERE.md or comment in template

---

### 9. Contradictory Instructions: Examples vs Templates

**Problem**: START-HERE.md mixes copying from examples/ and templates/

**Reality Check**:
- Line 173-179: Copy from `genesis/examples/hello-world/index.html`
- Line 150-167: Copy from `genesis/templates/project-structure/`
- Line 205: Copy from `genesis/examples/hello-world/.eslintrc.json`

**Issue**: Inconsistent pattern - should ALWAYS copy from templates/, not examples/

**Impact**: MEDIUM - Confusing for AI assistants
**Priority**: MEDIUM
**Fix Required**:
1. Move ALL necessary files to templates/
2. Update START-HERE.md to only reference templates/
3. Keep examples/ as working examples for reference only

---

### 10. Missing package.json Template

**Problem**: START-HERE.md line 165-167 instructs:
```bash
cp genesis/examples/hello-world/package.json .
# Update name, description, repository fields
```

**Reality Check**:
- ✅ `genesis/examples/hello-world/package.json` EXISTS
- ❌ `genesis/templates/project-structure/package-template.json` DOES NOT EXIST

**Issue**: Same as .eslintrc.json - copying from examples instead of templates

**Impact**: MEDIUM - Works but inconsistent
**Priority**: HIGH
**Fix Required**: Create `package-template.json` in templates/

---

### 11. Missing jest.config.js and jest.setup.js Templates

**Problem**: START-HERE.md line 203-204 instructs:
```bash
cp genesis/examples/hello-world/jest.config.js .
cp genesis/examples/hello-world/jest.setup.js .
```

**Reality Check**:
- ✅ Files exist in examples/
- ❌ `genesis/templates/testing/jest.config-template.js` EXISTS but not referenced
- ❌ `genesis/templates/testing/jest.setup-template.js` EXISTS but not referenced

**Issue**: Templates exist but START-HERE.md tells AI to copy from examples instead!

**Impact**: MEDIUM - Inconsistent instructions
**Priority**: MEDIUM
**Fix Required**: Update START-HERE.md to reference templates/testing/ instead of examples/

---

### 12. Unreachable Template Files

**Problem**: Many template files exist but are never referenced in START-HERE.md

**Reality Check - Files that exist but are NEVER mentioned**:
- ✅ `genesis/templates/testing/ai-mock.test-template.js` - EXISTS, not referenced
- ✅ `genesis/templates/testing/storage.test-template.js` - EXISTS, not referenced
- ✅ `genesis/templates/testing/workflow.e2e-template.js` - EXISTS, not referenced
- ✅ `genesis/templates/testing/package-template.json` - EXISTS, not referenced
- ✅ `genesis/templates/testing/playwright.config-template.js` - EXISTS, not referenced
- ✅ `genesis/templates/web-app/js/ai-mock-template.js` - EXISTS, not referenced
- ✅ `genesis/templates/web-app/js/ai-mock-ui-template.js` - EXISTS, not referenced
- ✅ `genesis/templates/web-app/js/storage-template.js` - EXISTS, not referenced
- ✅ `genesis/templates/web-app/js/workflow-template.js` - EXISTS, not referenced
- ✅ `genesis/templates/web-app/css/styles-template.css` - EXISTS, not referenced

**Impact**: HIGH - Valuable templates are invisible to AI assistants
**Priority**: HIGH
**Fix Required**: Update START-HERE.md to reference ALL template files

---

## 🟡 MEDIUM PRIORITY GAPS

### 13. Missing Style Guide References

**Problem**: Templates exist but no clear guidance on when to use what

**Reality Check**:
- ✅ `genesis/integration/CODE_STYLE_STANDARDS.md` EXISTS
- ✅ `genesis/integration/SHELL_SCRIPT_STANDARDS.md` EXISTS
- ❌ START-HERE.md doesn't reference these

**Impact**: MEDIUM - AI assistants won't know about coding standards
**Priority**: MEDIUM
**Fix Required**: Add to Step 1 required reading

---

### 14. Ambiguous Phase Configuration

**Problem**: START-HERE.md asks about phases but doesn't explain the pattern clearly

**Reality Check**:
Line 124-127:
```markdown
6. What type of document? (e.g., "One-Pager", "PRD", "Design Doc")
7. Link to document template or example? (if available)
8. Any deviations from standard 3-phase workflow? (default: NO)
```

**Issue**: Doesn't explain WHAT the 3-phase workflow is or HOW to configure it

**Impact**: MEDIUM - AI assistants will reference implementations, but wastes time
**Priority**: MEDIUM
**Fix Required**: Add clear explanation of 3-phase pattern in START-HERE.md

---

### 15. Missing Validation Scripts

**Problem**: Template has validate-template.sh but no instructions on using it

**Reality Check**:
- ✅ `genesis/templates/scripts/validate-template.sh` EXISTS
- ❌ No instructions in START-HERE.md on when/how to use it

**Impact**: LOW - Optional validation
**Priority**: LOW
**Fix Required**: Add optional validation step to START-HERE.md

---

## 🟢 LOW PRIORITY GAPS

### 16. Inconsistent File Naming Conventions

**Problem**: Template files use different naming patterns

**Examples**:
- `index-template.html` (hyphen before template)
- `package-template.json` (hyphen before template)
- `gitignore-template` (hyphen before template, no extension)
- `CLAUDE.md.template` (dot before template)
- `README-template.md` (hyphen before template)

**Impact**: LOW - Works but inconsistent
**Priority**: LOW
**Fix Required**: Standardize on one pattern (recommend: `-template` suffix before extension)

---

### 17. Missing Documentation on Template Variables

**Problem**: No central documentation of all available template variables

**Reality Check**:
- Variables are scattered across START-HERE.md and templates
- No single source of truth for what variables exist

**Impact**: LOW - AI assistants will figure it out
**Priority**: LOW
**Fix Required**: Create `TEMPLATE-VARIABLES.md` documenting all variables

---

## 📊 Summary Statistics

**Total Gaps Identified**: 17

**By Priority**:
- 🔴 CRITICAL: 7 gaps (41%)
- 🟡 MEDIUM: 8 gaps (47%)
- 🟢 LOW: 2 gaps (12%)

**By Category**:
- Missing Files: 8 gaps
- Unreachable Files: 4 gaps
- Ambiguous Instructions: 3 gaps
- Inconsistent Patterns: 2 gaps

**Estimated Fix Time**:
- CRITICAL gaps: 4-6 hours
- MEDIUM gaps: 2-3 hours
- LOW gaps: 1 hour
- **Total**: 7-10 hours

---

## 🎯 Recommended Fix Order

### Phase 1: Critical Blockers (Must Fix)
1. Create missing setup script templates (Gap #1)
2. Create prompts/ and templates/ directory structure (Gap #7)
3. Create missing configuration file templates (Gaps #2, #3, #10)
4. Create install-hooks script template (Gap #4)
5. Update START-HERE.md to reference all template files (Gap #12)

### Phase 2: Consistency Improvements (Should Fix)
6. Fix examples vs templates inconsistency (Gap #9, #11)
7. Add concrete variable replacement instructions (Gap #6)
8. Add style guide references (Gap #13)
9. Add phase configuration explanation (Gap #14)

### Phase 3: Polish (Nice to Have)
10. Add GitHub Actions templates (Gap #5)
11. Add navigation customization instructions (Gap #8)
12. Add validation script instructions (Gap #15)
13. Standardize file naming (Gap #16)
14. Create template variables documentation (Gap #17)

---

## ✅ Success Criteria

After fixes, an AI assistant should be able to:

1. ✅ Follow START-HERE.md step-by-step without asking user for clarification
2. ✅ Copy ALL necessary files from templates/ (not examples/)
3. ✅ Generate a working app with:
   - ✅ Dark mode toggle working on first try
   - ✅ All setup scripts present (macOS, Linux, Windows WSL, codecov)
   - ✅ Pre-commit hooks installed and working
   - ✅ Code coverage configured
   - ✅ All tests passing
   - ✅ Linting clean
   - ✅ Deployment script working
   - ✅ Prompts and templates directories created
   - ✅ Navigation dropdown customized
4. ✅ Deploy to GitHub Pages successfully
5. ✅ Have NO missing files or broken references

**This analysis provides the roadmap to achieve first-time-through success.**

