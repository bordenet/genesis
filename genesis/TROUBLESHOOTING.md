# Genesis Troubleshooting Guide

Common issues when creating projects from Genesis templates and how to fix them.

---

## Table of Contents

1. [Module System Errors (require is not defined)](#module-system-errors-require-is-not-defined)
2. [Template Variables Not Replaced](#template-variables-not-replaced)
3. [Badges Show "Unknown"](#badges-show-unknown)
4. [GitHub Actions Workflow Fails](#github-actions-workflow-fails)
5. [npm install Fails](#npm-install-fails)
6. [Linting Errors](#linting-errors)
7. [Tests Fail](#tests-fail)
8. [Dark Mode Doesn't Work](#dark-mode-doesnt-work)
9. [GitHub Pages 404 Error](#github-pages-404-error)
10. [Missing Files](#missing-files)
11. [Deployment Script Fails](#deployment-script-fails)
12. [Event Listeners Not Working](#event-listeners-not-working)

---

## Module System Errors (require is not defined)

### Symptoms
- Browser console shows: `Uncaught ReferenceError: require is not defined`
- Browser console shows: `Uncaught ReferenceError: module is not defined`
- JavaScript files don't load in the browser
- App doesn't initialize

### Cause
JavaScript files are using CommonJS syntax (`require()`, `module.exports`) instead of ES6 modules (`import`, `export`). Browsers only support ES6 modules when using `<script type="module">`.

### Solution

**1. Run the module system validator**:
```bash
./scripts/validate-module-system.sh js/
```

**2. Replace CommonJS with ES6 modules**:

❌ **WRONG (CommonJS - doesn't work in browsers)**:
```javascript
// storage.js
const { showToast } = require('./ui.js');
module.exports = { storage };
```

✅ **CORRECT (ES6 modules - works in browsers)**:
```javascript
// storage.js
import { showToast } from './ui.js';
export const storage = new Storage();
```

**3. Common replacements**:

| CommonJS (❌ Wrong) | ES6 Modules (✅ Correct) |
|---------------------|--------------------------|
| `const { x } = require('./file.js')` | `import { x } from './file.js'` |
| `const x = require('./file.js')` | `import x from './file.js'` |
| `module.exports = { x }` | `export { x }` |
| `module.exports.x = ...` | `export const x = ...` |
| `exports.x = ...` | `export const x = ...` |

**4. Verify HTML uses `type="module"`**:
```html
<!-- ✅ CORRECT -->
<script type="module" src="js/app.js"></script>

<!-- ❌ WRONG -->
<script src="js/app.js"></script>
```

**5. Always include `.js` extension in imports**:
```javascript
// ✅ CORRECT
import { storage } from './storage.js';

// ❌ WRONG (works in Node.js, not browsers)
import { storage } from './storage';
```

### Prevention
- Use the Genesis templates (already use ES6 modules)
- Run `./scripts/validate-module-system.sh` before deployment
- Check browser console for errors during development

### Reference
- See: `REFERENCE-IMPLEMENTATIONS.md` (Module System section)
- See: `01-AI-INSTRUCTIONS.md` (Module System Validation section)

---

## Template Variables Not Replaced

### Symptoms
- Files contain `{{PROJECT_NAME}}` or other `{{VARIABLES}}`
- npm commands fail with syntax errors
- Linting shows errors in template syntax

### Cause
Forgot to replace template variables with actual values

### Solution

1. **Find all unreplaced variables**:
   ```bash
   grep -r "{{" . --exclude-dir=node_modules --exclude-dir=genesis
   ```

2. **Replace each variable**:
   - `{{PROJECT_NAME}}` → your project name (e.g., "my-app")
   - `{{PROJECT_TITLE}}` → your project title (e.g., "My App")
   - `{{PROJECT_DESCRIPTION}}` → your description
   - `{{GITHUB_USER}}` → your GitHub username
   - `{{GITHUB_REPO}}` → your repository name
   - `{{GITHUB_PAGES_URL}}` → https://USERNAME.github.io/REPO/
   - `{{HEADER_EMOJI}}` → emoji for header (e.g., "🚀")
   - `{{FAVICON_EMOJI}}` → emoji for favicon (e.g., "🚀")
   - `{{DEPLOY_FOLDER}}` → "." for root or "docs" for docs folder

3. **Verify all replaced**:
   ```bash
   grep -r "{{" . --exclude-dir=node_modules --exclude-dir=genesis
   # Should return NO results
   ```

---

## Badges Show "Unknown"

### Symptoms
- README badges show "unknown" or "no status"
- Clicking badge shows 404 error

### Cause
GitHub Actions workflow hasn't run yet, or workflow file is missing

### Solution

1. **Verify workflow file exists**:
   ```bash
   ls -la .github/workflows/ci.yml
   ```

2. **If missing, copy from template**:
   ```bash
   mkdir -p .github/workflows
   cp genesis/templates/github/workflows/ci-template.yml .github/workflows/ci.yml
   ```

3. **Replace {{DEPLOY_FOLDER}} in ci.yml**:
   ```bash
   # Change line 105: path: '{{DEPLOY_FOLDER}}'
   # To: path: '.'  (for root deployment)
   ```

4. **Push to GitHub to trigger workflow**:
   ```bash
   git add .github/workflows/ci.yml
   git commit -m "Add CI/CD workflow"
   git push
   ```

5. **Wait 2-3 minutes** for workflow to run

6. **Check Actions tab**: https://github.com/USERNAME/REPO/actions

---

## GitHub Actions Workflow Fails

### Symptoms
- Workflow shows red X in Actions tab
- Deployment doesn't happen automatically

### Common Causes & Solutions

#### Cause 1: GitHub Pages not configured correctly

**Solution**:
1. Go to: https://github.com/USERNAME/REPO/settings/pages
2. Source: **GitHub Actions** (NOT "Deploy from a branch")
3. Save

#### Cause 2: {{DEPLOY_FOLDER}} not replaced

**Solution**:
```bash
# Edit .github/workflows/ci.yml
# Line 105: path: '{{DEPLOY_FOLDER}}'
# Change to: path: '.'
```

#### Cause 3: Test job removed but coverage job still references it

**Solution**:
```bash
# Edit .github/workflows/ci.yml
# If you removed the test job (lines 32-56), also remove the coverage job (lines 58-85)
```

#### Cause 4: Missing CODECOV_TOKEN secret

**Solution**:
- Either remove the coverage job from ci.yml
- Or add CODECOV_TOKEN to repository secrets

---

## npm install Fails

### Symptoms
- `npm install` shows errors
- Dependencies don't install

### Cause
Template variables in package.json not replaced

### Solution

1. **Check package.json**:
   ```bash
   grep "{{" package.json
   ```

2. **Replace all variables**:
   - `{{PROJECT_NAME}}` → "my-app"
   - `{{PROJECT_DESCRIPTION}}` → "My app description"
   - `{{GITHUB_USER}}` → your username
   - `{{GITHUB_REPO}}` → your repo name
   - `{{GITHUB_PAGES_URL}}` → https://USERNAME.github.io/REPO/

3. **Try again**:
   ```bash
   npm install
   ```

---

## Linting Errors

### Symptoms
- `npm run lint` shows errors
- Pre-commit hook blocks commits

### Common Causes & Solutions

#### Cause 1: Template variables in JS files

**Solution**:
```bash
# Find all {{VARIABLES}} in JS files
grep -r "{{PROJECT_NAME}}" js/ tests/

# Replace with actual project name
```

#### Cause 2: Syntax errors in customized code

**Solution**:
```bash
# Run linter with auto-fix
npm run lint -- --fix

# Check remaining errors
npm run lint
```

---

## Tests Fail

### Symptoms
- `npm test` shows failures
- Coverage below threshold

### Common Causes & Solutions

#### Cause 1: Template variables in test files

**Solution**:
```bash
grep "{{PROJECT_NAME}}" tests/
# Replace all occurrences with actual project name
```

#### Cause 2: Tests not customized for your workflow

**Solution**:
```bash
# Edit tests/workflow.test.js
# Update test cases to match your actual workflow phases and form fields
```

#### Cause 3: Missing test dependencies

**Solution**:
```bash
npm install
```

---

## Dark Mode Doesn't Work

### Symptoms
- Dark mode toggle button doesn't change theme
- Theme stuck in light or dark mode

### Cause
Missing Tailwind dark mode configuration

### Solution

1. **Check index.html** (lines 10-18):
   ```html
   <script>
       tailwind.config = {
           darkMode: 'class'
       }
   </script>
   ```

2. **If missing, add after Tailwind CDN**:
   ```html
   <script src="https://cdn.tailwindcss.com"></script>
   <script>
       tailwind.config = {
           darkMode: 'class'
       }
   </script>
   ```

---

## GitHub Pages 404 Error

### Symptoms
- Site shows 404 Not Found
- https://USERNAME.github.io/REPO/ doesn't load

### Common Causes & Solutions

#### Cause 1: GitHub Pages not enabled

**Solution**:
1. Go to: https://github.com/USERNAME/REPO/settings/pages
2. Source: GitHub Actions
3. Save
4. Wait 2 minutes

#### Cause 2: index.html not in root

**Solution**:
```bash
ls -la index.html
# Should exist in root directory
```

#### Cause 3: Workflow hasn't run yet

**Solution**:
1. Go to: https://github.com/USERNAME/REPO/actions
2. Check if workflow ran successfully
3. If not, push a commit to trigger it

---

## Missing Files

### Symptoms
- Reference errors in console
- 404 errors for CSS/JS files
- Features don't work

### Solution

Run verification:
```bash
# Check critical files
ls -la .gitignore CLAUDE.md README.md package.json .eslintrc.json
ls -la .github/workflows/ci.yml
ls -la index.html css/styles.css .nojekyll
ls -la js/app.js js/workflow.js js/storage.js
ls -la tests/ai-mock.test.js prompts/phase1.md
ls -la scripts/deploy-web.sh scripts/install-hooks.sh
```

If any missing, copy from Genesis templates:
```bash
cp genesis/templates/PATH/TO/FILE-template DESTINATION
```

---

## Deployment Script Fails

### Symptoms
- `./scripts/deploy-web.sh` shows errors
- Deployment doesn't complete

### Common Causes & Solutions

#### Cause 1: Script not executable

**Solution**:
```bash
chmod +x scripts/*.sh scripts/lib/*.sh
```

#### Cause 2: Template variables not replaced

**Solution**:
```bash
grep "{{" scripts/deploy-web.sh
# Replace all variables with actual values
```

#### Cause 3: Linting or tests failing

**Solution**:
```bash
# Fix linting errors
npm run lint -- --fix

# Fix test failures
npm test

# Then try deployment again
./scripts/deploy-web.sh
```

---

## Still Having Issues?

1. **Check Genesis documentation**:
   - `genesis/START-HERE.md`
   - `genesis/00-AI-MUST-READ-FIRST.md`
   - `genesis/TESTING-PROCEDURE.md`

2. **Compare with reference implementations**:
   - [one-pager](https://github.com/bordenet/one-pager)
   - [product-requirements-assistant](https://github.com/bordenet/product-requirements-assistant)

3. **Run verification scripts**:
   ```bash
   ./genesis/scripts/verify-templates.sh
   ./genesis/scripts/test-genesis.sh
   ```

4. **Create an issue**: Document the problem with steps to reproduce

---

## Event Listeners Not Working

### Symptoms
- Buttons don't respond to clicks
- Dark mode toggle doesn't work
- Dropdowns don't open
- No errors in browser console
- Functions are defined but not executing

### Cause
Event listener functions are defined but never attached to DOM elements with `addEventListener()`.

### Solution

**1. Check if event listeners are attached**:

❌ **WRONG (function defined but not attached)**:
```javascript
// ui.js
export function toggleTheme() {
    document.documentElement.classList.toggle('dark');
}
// Missing: addEventListener() call - button won't work!
```

✅ **CORRECT (function defined AND attached)**:
```javascript
// ui.js
export function toggleTheme() {
    document.documentElement.classList.toggle('dark');
}

// Attach listener immediately
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}
```

**2. Verify DOM elements exist**:
```javascript
// Always check element exists before attaching
const button = document.getElementById('my-button');
if (button) {
    button.addEventListener('click', handleClick);
} else {
    console.warn('Button #my-button not found in DOM');
}
```

**3. Check timing (DOM must be loaded first)**:
```javascript
// ✅ CORRECT - Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

// ❌ WRONG - Might run before DOM loads
setupEventListeners();
```

**4. Use browser DevTools to debug**:
```javascript
// Add console.log to verify function is called
function toggleTheme() {
    console.log('toggleTheme called');  // Debug line
    document.documentElement.classList.toggle('dark');
}
```

### Common Patterns

**Pattern 1: Centralized setup function**:
```javascript
// app.js
function setupGlobalEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Export button
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExport);
    }
}

// Call on page load
document.addEventListener('DOMContentLoaded', setupGlobalEventListeners);
```

**Pattern 2: Module-level attachment**:
```javascript
// ui.js
export function toggleTheme() { /* ... */ }

// Attach immediately (if DOM already loaded)
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}
```

### Prevention
- Use Genesis templates (include proper event listener setup)
- Test all UI interactions in browser
- Check browser console for warnings
- Use `setupGlobalEventListeners()` pattern from templates

### Reference
- See: `templates/web-app/js/app-template.js` (lines 50-141)
- See: `REFERENCE-IMPLEMENTATIONS.md` (Event Listener section)

---

