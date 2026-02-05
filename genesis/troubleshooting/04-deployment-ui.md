# Troubleshooting: Deployment & UI

> **Parent:** [`TROUBLESHOOTING.md`](../TROUBLESHOOTING.md)

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
   - `genesis/CHECKLIST.md`
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

