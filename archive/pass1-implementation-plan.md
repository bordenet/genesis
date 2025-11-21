# Genesis Implementation Plan - Detailed Step-by-Step

**Date**: 2025-11-21  
**Based On**: GENESIS-GAP-ANALYSIS.md  
**Goal**: Fix all gaps to enable first-time-through success  
**Estimated Time**: 7-10 hours

---

## Overview

This plan addresses 17 identified gaps in Genesis, organized into 3 phases:
1. **Phase 1**: Critical Blockers (MUST FIX) - 5 tasks
2. **Phase 2**: Consistency Improvements (SHOULD FIX) - 4 tasks
3. **Phase 3**: Polish (NICE TO HAVE) - 5 tasks

---

## Phase 1: Critical Blockers (4-6 hours)

### Task 1.1: Create Missing Setup Script Templates

**Gap**: #1 - Missing setup-linux, setup-windows-wsl, setup-codecov templates  
**Priority**: CRITICAL  
**Time**: 2 hours

**Steps**:

1. **Create `genesis/templates/scripts/setup-linux-template.sh`**
   - Copy from `../product-requirements-assistant/scripts/setup-linux.sh`
   - Replace hardcoded values with template variables:
     - Project name → `{{PROJECT_NAME}}`
     - Paths → use `{{PROJECT_NAME}}`
   - Add template header comment
   - Test that all variable placeholders are correct

2. **Create `genesis/templates/scripts/setup-windows-wsl-template.sh`**
   - Copy from `../product-requirements-assistant/scripts/setup-windows-wsl.sh`
   - Replace hardcoded values with template variables
   - Add template header comment
   - Test that all variable placeholders are correct

3. **Create `genesis/templates/scripts/setup-codecov-template.sh`**
   - Copy from `../product-requirements-assistant/scripts/setup-codecov.sh`
   - Replace hardcoded values with template variables
   - Add template header comment
   - Test that all variable placeholders are correct

4. **Update START-HERE.md**
   - Verify instructions at line 217-219 now work
   - Add instructions for setup-windows-wsl.sh
   - Add instructions for setup-codecov.sh

**Verification**:
```bash
# All these files should exist:
ls -la genesis/templates/scripts/setup-linux-template.sh
ls -la genesis/templates/scripts/setup-windows-wsl-template.sh
ls -la genesis/templates/scripts/setup-codecov-template.sh
```

---

### Task 1.2: Create Prompts and Templates Directory Structure

**Gap**: #7 - Missing prompts/ and templates/ directory setup  
**Priority**: CRITICAL  
**Time**: 1.5 hours

**Steps**:

1. **Create `genesis/templates/prompts/` directory**
   ```bash
   mkdir -p genesis/templates/prompts
   ```

2. **Create `genesis/templates/prompts/phase1-template.md`**
   - Copy from `../product-requirements-assistant/prompts/phase1-claude-initial.md`
   - Generalize for any document type (not just PRD)
   - Replace specific sections with template variables:
     - Document type → `{{DOCUMENT_TYPE}}`
     - Sections → `{{SECTION_1}}`, `{{SECTION_2}}`, etc.
   - Add instructions comment at top

3. **Create `genesis/templates/prompts/phase2-template.md`**
   - Copy from `../product-requirements-assistant/prompts/phase2-gemini-review.md`
   - Generalize for any document type
   - Replace specific sections with template variables
   - Add instructions comment at top

4. **Create `genesis/templates/prompts/phase3-template.md`**
   - Copy from `../product-requirements-assistant/prompts/phase3-claude-synthesis.md`
   - Generalize for any document type
   - Replace specific sections with template variables
   - Add instructions comment at top

5. **Create `genesis/templates/document-templates/` directory**
   ```bash
   mkdir -p genesis/templates/document-templates
   ```

6. **Create `genesis/templates/document-templates/generic-template.md`**
   - Create a generic document template with common sections:
     - Title
     - Overview
     - Details
     - Conclusion
   - Use `{variableName}` syntax for template variables
   - Add instructions comment at top

7. **Update START-HERE.md**
   - Add Step 3.5: "Copy Prompts and Templates"
   - Add instructions to copy prompts/ directory
   - Add instructions to copy and customize document template
   - Add instructions to create templates/ directory in project

**Verification**:
```bash
# All these should exist:
ls -la genesis/templates/prompts/phase1-template.md
ls -la genesis/templates/prompts/phase2-template.md
ls -la genesis/templates/prompts/phase3-template.md
ls -la genesis/templates/document-templates/generic-template.md
```

---

### Task 1.3: Create Missing Configuration File Templates

**Gap**: #2, #3, #10 - Missing .eslintrc, codecov.yml, package.json templates  
**Priority**: CRITICAL  
**Time**: 1 hour

**Steps**:

1. **Create `genesis/templates/project-structure/.eslintrc-template.json`**
   - Copy from `genesis/examples/hello-world/.eslintrc.json`
   - No template variables needed (static config)
   - Add comment header explaining purpose

2. **Create `genesis/templates/project-structure/codecov-template.yml`**
   - Copy from `../product-requirements-assistant/codecov.yml`
   - Simplify for web-only projects (remove backend/frontend flags)
   - Add comment header explaining purpose

3. **Create `genesis/templates/project-structure/package-template.json`**
   - Copy from `genesis/examples/hello-world/package.json`
   - Replace hardcoded values with template variables:
     - `"name"` → `"{{PROJECT_NAME}}"`
     - `"description"` → `"{{PROJECT_DESCRIPTION}}"`
     - `"repository"` → `"{{GITHUB_USER}}/{{GITHUB_REPO}}"`
     - `"homepage"` → `"https://{{GITHUB_USER}}.github.io/{{GITHUB_REPO}}/"`
   - Keep all dependencies as-is

4. **Update START-HERE.md**
   - Change line 165-167 to reference templates instead of examples
   - Change line 205 to reference templates instead of examples
   - Add instruction to copy codecov.yml

**Verification**:
```bash
# All these should exist:
ls -la genesis/templates/project-structure/.eslintrc-template.json
ls -la genesis/templates/project-structure/codecov-template.yml
ls -la genesis/templates/project-structure/package-template.json
```

---

### Task 1.4: Create Install-Hooks Script Template

**Gap**: #4 - Missing pre-commit hook installation
**Priority**: CRITICAL
**Time**: 45 minutes

**Steps**:

1. **Create `genesis/templates/scripts/install-hooks-template.sh`**
   - Copy from `../product-requirements-assistant/scripts/install-hooks.sh`
   - Replace hardcoded values with template variables
   - Ensure it copies from `.git/hooks/` or creates symlink
   - Add help and verbose flags
   - Add compact mode support

2. **Update START-HERE.md**
   - Add Step 4.5: "Install Git Hooks"
   - Add instructions:
     ```bash
     # Copy pre-commit hook
     cp genesis/templates/git-hooks/pre-commit-template .git/hooks/pre-commit
     chmod +x .git/hooks/pre-commit

     # Or use install script
     ./scripts/install-hooks.sh
     ```

**Verification**:
```bash
ls -la genesis/templates/scripts/install-hooks-template.sh
```

---



### Task 1.5: Update START-HERE.md to Reference All Template Files

**Gap**: #12 - Unreachable template files  
**Priority**: CRITICAL  
**Time**: 1 hour

**Steps**:

1. **Update Step 3.2: Copy Web App Files**
   - Change from copying from examples/ to copying from templates/
   - Add ALL JavaScript template files
   - Add CSS template file

2. **Update Step 3.3: Copy Tests**
   - Change from copying from examples/ to copying from templates/
   - Add ALL test template files

3. **Create a checklist of all template files**
   - Add to START-HERE.md after Step 3
   - List ALL template files that should be copied

**Verification**:
- Read through START-HERE.md
- Verify every file in `genesis/templates/` is referenced

---

## Phase 2: Consistency Improvements (2-3 hours)

### Task 2.1: Fix Examples vs Templates Inconsistency

**Gap**: #9, #11 - Contradictory instructions  
**Priority**: MEDIUM  
**Time**: 1 hour

**Steps**:

1. **Audit START-HERE.md for all `genesis/examples/` references**
2. **Update all copy instructions to use templates/**
3. **Update examples/ README to clarify purpose**

---

### Task 2.2: Add Concrete Variable Replacement Instructions

**Gap**: #6 - Ambiguous instructions  
**Priority**: MEDIUM  
**Time**: 30 minutes

---

### Task 2.3: Add Style Guide References

**Gap**: #13 - Missing style guide references  
**Priority**: MEDIUM  
**Time**: 15 minutes

---

### Task 2.4: Add Phase Configuration Explanation

**Gap**: #14 - Ambiguous phase configuration  
**Priority**: MEDIUM  
**Time**: 30 minutes

---

## Phase 3: Polish (1-2 hours)

### Task 3.1: Add GitHub Actions Templates
### Task 3.2: Add Navigation Customization Instructions
### Task 3.3: Add Validation Script Instructions
### Task 3.4: Standardize File Naming Conventions
### Task 3.5: Create Template Variables Documentation

---

## Implementation Checklist

### Phase 1: Critical Blockers
- [ ] Task 1.1: Create missing setup script templates (2h)
- [ ] Task 1.2: Create prompts and templates directory structure (1.5h)
- [ ] Task 1.3: Create missing configuration file templates (1h)
- [ ] Task 1.4: Create install-hooks script template (45m)
- [ ] Task 1.5: Update START-HERE.md to reference all template files (1h)

### Phase 2: Consistency Improvements
- [ ] Task 2.1: Fix examples vs templates inconsistency (1h)
- [ ] Task 2.2: Add concrete variable replacement instructions (30m)
- [ ] Task 2.3: Add style guide references (15m)
- [ ] Task 2.4: Add phase configuration explanation (30m)

### Phase 3: Polish
- [ ] Task 3.1: Add GitHub Actions templates (45m)
- [ ] Task 3.2: Add navigation customization instructions (15m)
- [ ] Task 3.3: Add validation script instructions (10m)
- [ ] Task 3.4: Standardize file naming conventions (20m)
- [ ] Task 3.5: Create template variables documentation (15m)

**Total Time**: ~10 hours

---

## Testing Plan

After implementation, create a fresh test project and follow START-HERE.md exactly.

**Success Criteria**: All steps complete without errors, all files present, dark mode works.

