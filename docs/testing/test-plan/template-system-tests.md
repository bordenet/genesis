# Test Plan: Template System Tests

> Part of [Genesis Test Plan](../TEST_PLAN.md)

---

## TS-001: Template Variable Replacement (P0, Integration)
**Objective:** Verify all template variables are correctly replaced during project creation

**Test Cases:**
1. Replace all standard variables in HTML templates
   - Input: `{{PROJECT_NAME}}`, `{{PROJECT_TITLE}}`, etc.
   - Expected: All variables replaced with actual values
   - Files: `index-template.html`, `README-template.md`

2. Replace variables in JavaScript templates
   - Files: All `*-template.js` files
   - Verify: No `{{}}` patterns remain after replacement

3. Replace variables in configuration files
   - Files: `package-template.json`, `codecov-template.yml`
   - Verify: Valid JSON/YAML after replacement

4. Handle special characters in replacements
   - Test: Project names with spaces, hyphens, special chars
   - Expected: Proper escaping and valid output

**Status:** ⬜ Not Started

---

## TS-002: Template File Completeness (P0, Integration)
**Objective:** Ensure all required template files are present and accessible

**Test Cases:**
1. Verify mandatory template files exist
   - Core: `.gitignore`, `CLAUDE.md`, `README.md`, `package.json`
   - Web: `index.html`, all `js/*.js` files
   - Tests: All `tests/*.test.js` files

2. Verify optional template files are documented
   - Scripts: `setup-*.sh`, `deploy-*.sh`
   - Docs: Architecture, development guides

3. Check for orphaned templates (exist but not referenced)
   - Use `genesis-validator` tool
   - Expected: Zero orphaned files

4. Check for missing templates (referenced but don't exist)
   - Expected: Zero missing files

**Status:** ⬜ Not Started

---

## TS-003: Template Syntax Validation (P1, Unit)
**Objective:** Validate template syntax before variable replacement

**Test Cases:**
1. Valid JavaScript syntax in all JS templates
   - Use ESLint on template files
   - Expected: No syntax errors

2. Valid HTML in all HTML templates
   - Check for unclosed tags, invalid attributes
   - Expected: Valid HTML5

3. Valid Shell script syntax
   - Use shellcheck on all `*.sh` templates
   - Expected: No errors, minimal warnings

4. Valid JSON/YAML in config templates
   - Parse before and after variable replacement
   - Expected: Valid structure

**Status:** ⬜ Not Started

---

## TS-004: Template Content Consistency (P1, Integration)
**Objective:** Ensure templates are internally consistent and follow best practices

**Test Cases:**
1. Dark mode configuration present in HTML templates
   - Verify: Tailwind `darkMode: 'class'` config
   - Verify: `loadTheme()` function in app.js
   - Files: `index-template.html`

2. Quote style consistency (single quotes in JS)
   - Verify: All JS templates use single quotes
   - ESLint rule: `quotes: ['error', 'single']`

3. Adversarial workflow pattern (NOT auto-fill)
   - Verify: Prompts generated for external AI, not auto-filled
   - Check: Copy-paste instructions present
   - Files: `workflow-template.js`, `views-template.js`

4. Forgiving UX patterns implemented
   - Verify: Auto-generation of missing dependencies
   - Example: Save button generates prompt if not already generated

**Status:** ⬜ Not Started

