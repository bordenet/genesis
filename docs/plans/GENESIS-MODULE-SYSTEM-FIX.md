# Genesis Bootstrap Quality Fix: Module System & Event Listener Validation

**Status**: DESIGN DOCUMENT  
**Date**: 2025-12-01  
**Severity**: CRITICAL  
**Affected Projects**: All web-app bootstraps (architecture-decision-record, future projects)

---

## Problem Summary

Bootstrap projects created from Genesis web-app templates experience systematic failures at runtime because of **module system mismatches and missing event listener attachments**. These issues create a cascade of broken functionality that developers discover during deployment testing rather than being caught immediately.

### Failure Categories

| Category | Symptom | Root Cause | Impact |
|----------|---------|-----------|--------|
| **Module System Mismatch** | `Cannot find module`, `undefined require` | Template uses ES6 imports; AI generates CommonJS exports; browser expects ES6 with `type="module"` | App doesn't load in browser. Requires bundler workaround |
| **Event Listeners Not Attached** | Buttons don't work (dark mode, export, etc.) | Functions are defined but `addEventListener()` calls are not generated | UI is unresponsive. Silent failure (no errors in console) |
| **Template Variables** | Unreplaced `{{TEMPLATE_VAR}}` strings in output | Insufficient validation before declaring template "complete" | Broken database names, project titles appearing as variables |
| **HTML Structure** | Missing or malformed elements | Template assumptions not met, or element IDs mismatch function lookups | UI elements not found by event listener setup code |

---

## Root Cause Analysis

### 1. Template-AI Module System Mismatch

**The Template Layer** (what Genesis provides):
```javascript
// genesis/templates/web-app/js/app-template.js uses ES6 IMPORTS
import { initRouter } from './router.js';
import { showToast } from './ui.js';
```

**The Index Template** requires ES6 modules:
```html
<!-- type="module" requires native ES6 imports/exports -->
<script type="module" src="js/app.js"></script>
```

**The AI Reality** (what Claude generates without enforcement):
```javascript
// Generated app.js uses CommonJS EXPORTS
const { initRouter } = require('./router.js');
const { showToast } = require('./ui.js');
module.exports = { initApp };
```

**Why This Breaks**:
- Browser `type="module"` scripts cannot use `require()` (Node.js-only)
- CommonJS `module.exports` doesn't work in browser ES6 module context
- Result: Silent module loading failure, application hangs

### 2. Event Listener Generation Is Not Enforced

**The Template Problem**: Templates define functions but don't mandate their attachment to DOM elements.

**Example** (from architecture-decision-record):
```javascript
// ui.js defines toggleTheme function
function toggleTheme() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', newTheme);
}
module.exports = { toggleTheme };

// But the event listener is NEVER attached
// Missing: document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
```

**Why This Breaks**:
- Button exists in HTML
- Function works when called manually
- But nothing attaches the function to the button
- Dark mode toggle appears broken (silently fails)

### 3. Genesis AI Instructions Are Insufficient

**Current AI Instructions** (in genesis/01-AI-INSTRUCTIONS.md):
- "Create responsive UI with dark mode" ✓ (UI exists)
- "Use IndexedDB for storage" ✓ (code written)
- "Follow the template structure" ✓ (sorta)

**Missing Instructions**:
- ❌ "All modules MUST use ES6 import/export syntax - NO CommonJS"
- ❌ "Every DOM-binding function MUST have addEventListener() call immediately after it's defined"
- ❌ "Validate all {{TEMPLATE_VAR}} are replaced before marking complete"
- ❌ "Test in browser with clean local storage first"

---

## Solution Design

### Level 1: Template Enforcement

**Goal**: Make it structurally impossible to generate incorrect code.

#### 1A. Explicit Module System in Templates

**Current**:
```javascript
// storage-template.js has NO indication of module type
module.exports = { storage };
```

**Fixed**:
```javascript
/**
 * Storage Module - IndexedDB client
 * 
 * ⚠️ CRITICAL: This file MUST use ES6 modules
 * The browser loads this with <script type="module">
 * Node.js tests must use compatible transpilation
 */

// ✅ Use ES6 export syntax - REQUIRED FOR BROWSER
export const storage = new Storage();

// ❌ DO NOT use: module.exports = { storage };
// ❌ DO NOT use: CommonJS require() anywhere
```

**Templates to Update**:
- `templates/web-app/js/app-template.js`
- `templates/web-app/js/storage-template.js`
- `templates/web-app/js/ui-template.js`
- `templates/web-app/js/workflow-template.js`
- `templates/web-app/js/views-template.js`
- `templates/web-app/js/router-template.js`
- `templates/web-app/js/projects-template.js`
- `templates/web-app/js/project-view-template.js`
- `templates/web-app/js/phase2-review-template.js`
- `templates/web-app/js/ai-mock-template.js`
- `templates/web-app/js/ai-mock-ui-template.js`
- `templates/web-app/js/same-llm-adversarial-template.js` (phase 2 only)

#### 1B. Event Listener Scaffold in Templates

**Add to each UI module template** (like ui-template.js):

```javascript
/**
 * UI Module
 * 
 * ⚠️ CRITICAL: After defining event-handling functions,
 * immediately attach them to DOM elements using the scaffold below.
 */

export function toggleTheme() {
    // ... implementation
}

export function showToast() {
    // ... implementation
}

/**
 * SCAFFOLD: Attach all functions to DOM elements
 * Execute this immediately when module loads
 * Reference: Product Requirements Assistant
 */
export function setupDOMBindings() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Export button
    const exportBtn = document.getElementById('export-all-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportAllProjects);
    }
    
    // Import button
    const importBtn = document.getElementById('import-btn');
    if (importBtn) {
        importBtn.addEventListener('click', triggerImport);
    }
    
    // Related projects dropdown
    const relatedBtn = document.getElementById('related-projects-btn');
    const relatedMenu = document.getElementById('related-projects-menu');
    if (relatedBtn && relatedMenu) {
        relatedBtn.addEventListener('click', (e) => {
            relatedMenu.classList.toggle('hidden');
        });
        document.addEventListener('click', (e) => {
            if (!e.target.closest('[id*="related"]')) {
                relatedMenu.classList.add('hidden');
            }
        });
    }
}

// Auto-setup when module loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupDOMBindings);
} else {
    setupDOMBindings();
}
```

### Level 2: AI-Level Validation & Instructions

**File**: `genesis/01-AI-INSTRUCTIONS.md` (NEW SECTION)

```markdown
## ⚠️ CRITICAL: Module System Validation

Before generating ANY JavaScript code:

1. **Declare Module Type First**
   - First line of every .js file: `/**` with module docs
   - Include: "This module uses ES6 import/export for browser"
   - NO `require()`, NO `module.exports`

2. **Check Template Imports**
   - Study how templates import from other modules
   - Example: `import { storage } from './storage.js';`
   - Pattern: ALWAYS `import X from './file.js'`
   - Pattern: ALWAYS `export const/function/class X`

3. **Validate Event Listener Pattern**
   - Every function that handles DOM events needs a listener
   - Check: `document.getElementById('btn-id').addEventListener('click', handler);`
   - Don't leave button handlers dangling
   - Pattern: See ui-template.js setupDOMBindings()

4. **Enforce Template Variable Replacement**
   - Before saying "complete", search file for `{{`
   - Pattern match: `{{[A-Z_]+}}`
   - Every match must be replaced
   - Remaining variables = FAILURE

5. **Browser-Compatibility Check**
   - No Node.js APIs (require, fs, path, etc.)
   - No CommonJS (module.exports)
   - Only browser APIs (DOM, localStorage, indexedDB, etc.)
   - Use ES6+ (arrow functions, async/await, classes)

### Validation Checklist (AI Must Verify Before Deployment)
- [ ] All .js files use `import`/`export` (no `require`)
- [ ] Every DOM-handling function has addEventListener binding
- [ ] All `{{TEMPLATE_VAR}}` replaced with actual values
- [ ] No remaining CommonJS syntax anywhere
- [ ] Tested in browser before claiming ready
```

### Level 3: Automated Testing

**Add to Genesis validation** (`genesis-validator/`):

```bash
#!/bin/bash
# validate-module-system.sh
# Runs after bootstrap to catch module system issues

set -euo pipefail

ERRORS=0

# Check 1: No CommonJS exports
echo "✓ Checking for CommonJS exports..."
if grep -r "module\.exports" js/ 2>/dev/null; then
    echo "❌ FAILURE: Found CommonJS 'module.exports' in browser code"
    echo "   Fix: Replace with 'export' (ES6)"
    ERRORS=$((ERRORS + 1))
fi

# Check 2: No require() in browser code
echo "✓ Checking for require() calls..."
if grep -r "require(" js/ 2>/dev/null; then
    echo "❌ FAILURE: Found 'require()' in browser code"
    echo "   Fix: Replace with 'import' (ES6)"
    ERRORS=$((ERRORS + 1))
fi

# Check 3: Unreplaced template variables
echo "✓ Checking for unreplaced template variables..."
if grep -r "{{[A-Z_]*}}" . --include="*.js" --include="*.html" 2>/dev/null; then
    echo "❌ FAILURE: Found unreplaced template variables"
    echo "   Fix: Replace {{VAR}} with actual values in bootstrap script"
    ERRORS=$((ERRORS + 1))
fi

# Check 4: Event listeners defined
echo "✓ Checking for event listener bindings..."
if ! grep -q "addEventListener" js/ui.js 2>/dev/null; then
    echo "⚠️  WARNING: No addEventListener found in ui.js"
    echo "   Verify: Dark mode, export, import buttons are bound to handlers"
fi

exit $ERRORS
```

**Integration**: Add to `scripts/setup-macos.sh` as final validation step.

### Level 4: Reference Implementation Documentation

**File**: `genesis/REFERENCE-IMPLEMENTATIONS.md` (NEW SECTION)

Add explicit module-system examples:

```markdown
## Module System: Browser ES6 Modules

### ✅ Correct Pattern (architecture-decision-record solved this)

**Phase 1**: Define module with ES6 exports
```javascript
// ✅ CORRECT: js/ui.js
export function toggleTheme() { /* ... */ }
export function showToast(msg) { /* ... */ }

export function setupDOMBindings() {
    const themeBtn = document.getElementById('theme-toggle');
    themeBtn?.addEventListener('click', toggleTheme);
}
```

**Phase 2**: Use esbuild bundler to make CommonJS work (workaround only)
```json
{
  "scripts": {
    "build": "esbuild js/app.js --bundle --outfile=app-bundle.js"
  }
}
```

**Phase 3**: Load bundled module in HTML
```html
<script src="app-bundle.js"></script>
```

### ❌ Incorrect Pattern (architecture-decision-record struggled with this)

```javascript
// ❌ WRONG: Using CommonJS in browser code
const { toggleTheme } = require('./ui.js');
module.exports = { toggleTheme };

// ❌ WRONG: Defining button but not attaching listener
export function toggleTheme() { /* ... */ }
// ... never called addEventListener()

// ❌ WRONG: Including unreplaced variables
const DB_NAME = '{{DB_NAME}}';  // Still a template variable!
```

### 🎯 Best Practice Going Forward

**ALWAYS START WITH ES6 MODULES** (no bundler needed):
1. Write all modules with `import`/`export`
2. Use `<script type="module">` in HTML
3. Attach all event listeners in `setupDOMBindings()`
4. Only use bundler if truly needed (code splitting, optimization)
```

---

## Implementation Plan

### Phase 1: Update Templates (2-3 hours)

**Task 1.1**: Add module-system guardrails to all 12 JS templates
- File: Update each `js/*-template.js`
- Change: Add critical comments explaining ES6 requirement
- Change: Replace `module.exports` with `export`
- Change: Replace `require()` with `import`

**Task 1.2**: Add event listener scaffold to ui-template.js
- File: `templates/web-app/js/ui-template.js`
- Add: `setupDOMBindings()` function
- Add: Auto-execute on DOM ready

**Task 1.3**: Update index-template.html comment
- File: `templates/web-app/index-template.html`
- Add: Explanation of `type="module"` requirement
- Add: Link to REFERENCE-IMPLEMENTATIONS.md

### Phase 2: Update AI Instructions (1 hour)

**Task 2.1**: Add module-system validation section to 01-AI-INSTRUCTIONS.md
- Add: "CRITICAL: Module System Validation" section
- Add: Before/after code examples
- Add: Validation checklist

**Task 2.2**: Update REFERENCE-IMPLEMENTATIONS.md
- Add: "Module System: Browser ES6 Modules" section
- Add: Correct vs. incorrect patterns
- Add: Link to architecture-decision-record as solved example

### Phase 3: Add Automated Validation (1-2 hours)

**Task 3.1**: Create validate-module-system.sh
- File: `genesis-validator/scripts/validate-module-system.sh`
- Checks: CommonJS exports, require() calls, template variables, event listeners

**Task 3.2**: Integrate into setup script
- File: `scripts/setup-macos.sh`
- Add: Validation step before "Setup complete"
- Output: Clear error messages if module system incorrect

### Phase 4: Test Against architecture-decision-record (1-2 hours)

**Task 4.1**: Verify fix would have caught the original issue
- Scenario: Fresh bootstrap, no bundler
- Expectation: Validation catches "module.exports" and "require()"
- Expectation: Catches missing event listeners
- Result: Forces correct ES6 module code

**Task 4.2**: Test with reference implementations
- product-requirements-assistant (should pass)
- one-pager (should pass)
- Verify validation is not too strict

### Phase 5: Documentation & Handoff (30 min)

**Task 5.1**: Update TROUBLESHOOTING.md
- Add: "App doesn't load in browser" section
- Add: "Dark mode button doesn't work" section
- Link to module-system fix

**Task 5.2**: Add to CHANGELOG.md
- Version: Next release
- Entry: "CRITICAL: Enforce ES6 modules in browser templates"

---

## Success Criteria

After implementation, projects bootstrapped from Genesis must:

✅ **Load in browser without errors**
- No `Cannot find module` errors
- No `require is not defined` errors
- All modules properly imported

✅ **All UI features work immediately**
- Dark mode toggle works
- Export button works
- Import button works
- Related projects dropdown works
- All buttons are responsive

✅ **No template variables remain**
- No `{{PROJECT_TITLE}}` in output
- No `{{DB_NAME}}` in code
- No `{{FAVICON_EMOJI}}` in HTML

✅ **Automated validation prevents regression**
- Setup script validates module system
- CI/CD catches CommonJS in browser code
- Deployment blocked if event listeners missing

✅ **AI cannot generate incorrect code**
- Templates have explicit module-system markers
- AI instructions have dedicated validation section
- Reference implementations show correct patterns

---

## Files to Create/Modify

### New Files
- `docs/plans/GENESIS-MODULE-SYSTEM-FIX.md` (this document)
- `genesis-validator/scripts/validate-module-system.sh`

### Modified Files
- `templates/web-app/js/app-template.js` - Add ES6 guardrail comments
- `templates/web-app/js/storage-template.js` - Replace module.exports with export
- `templates/web-app/js/ui-template.js` - Add setupDOMBindings scaffold
- `templates/web-app/js/workflow-template.js` - Replace module.exports with export
- `templates/web-app/js/views-template.js` - Replace module.exports with export
- `templates/web-app/js/router-template.js` - Replace module.exports with export
- `templates/web-app/js/projects-template.js` - Replace module.exports with export
- `templates/web-app/js/project-view-template.js` - Replace module.exports with export
- `templates/web-app/js/phase2-review-template.js` - Replace module.exports with export
- `templates/web-app/js/ai-mock-template.js` - Replace module.exports with export
- `templates/web-app/js/ai-mock-ui-template.js` - Replace module.exports with export
- `templates/web-app/js/same-llm-adversarial-template.js` - Replace module.exports with export
- `templates/web-app/index-template.html` - Add type="module" documentation
- `genesis/01-AI-INSTRUCTIONS.md` - Add "CRITICAL: Module System Validation" section
- `genesis/REFERENCE-IMPLEMENTATIONS.md` - Add "Module System: Browser ES6 Modules" section
- `genesis/TROUBLESHOOTING.md` - Add module system debugging section
- `scripts/setup-macos.sh` - Integrate validation step
- `CHANGELOG.md` - Document breaking change

---

## Risk Assessment

### Low Risk
- Template comments don't affect functionality
- Adding validation script only blocks bad bootstraps
- Reference examples don't break existing projects

### Medium Risk
- Changing templates affects all future bootstraps
- AI instructions more restrictive (less freedom)
- Must test against multiple projects

### High Risk
- **None identified** - this is fixing broken behavior, not changing working behavior

---

## Validation Against Architecture-Decision-Record

**Hypothesis**: If this design had been in place, the issues would have been caught earlier.

**Scenario**: Fresh bootstrap with design in place

1. **Setup script runs validation**
   ```
   ✓ Checking for CommonJS exports...
   ❌ FAILURE: Found CommonJS 'module.exports' in js/storage.js
   Fix: Replace with 'export' (ES6)
   ```

2. **AI instructions prevent issue**
   - Template has warning comment: "This module MUST use ES6"
   - AI validation checklist: "[ ] All .js files use `import`/`export`"
   - Before deploying, AI explicitly checks this

3. **Event listeners caught**
   - Template includes setupDOMBindings() scaffold
   - AI knows to fill in all button bindings
   - Missing listener = validation error

**Outcome**: Issues caught during bootstrap, not during deployment testing.

---

## Next Steps After Design Approval

1. **Code Review**: Review this design with Genesis maintainers
2. **Feedback Integration**: Incorporate suggestions
3. **Implementation**: Execute Phase 1-5 tasks
4. **Testing**: Validate against architecture-decision-record
5. **Deployment**: Merge templates and update Genesis
6. **Announcement**: Update CHANGELOG, notify users

---

**Document Owner**: Architecture Decision Record Bootstrap Investigation  
**Last Updated**: 2025-12-01  
**Status**: READY FOR IMPLEMENTATION
