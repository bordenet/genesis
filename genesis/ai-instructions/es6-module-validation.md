# Genesis AI Instructions: ES6 Module Validation

> Part of [AI Instructions](../01-AI-INSTRUCTIONS.md)

---

## ⚠️ CRITICAL: Module System Validation

**MANDATORY FOR ALL BROWSER-BASED PROJECTS**

All JavaScript files in Genesis web-app templates use **ES6 modules** (`import`/`export`). This is **NOT optional** - it's required for browser compatibility.

### Why ES6 Modules?

- ✅ Native browser support (no bundler needed)
- ✅ Proper dependency management
- ✅ Better performance (parallel loading)
- ✅ Modern JavaScript standard
- ❌ CommonJS (`require`/`module.exports`) **DOES NOT WORK** in browsers

---

## Before Writing ANY JavaScript Code

### STEP 1: Declare Module Type

```javascript
/**
 * Module Name
 *
 * ⚠️ CRITICAL: This file MUST use ES6 modules
 * The browser loads this with <script type="module">
 * DO NOT use CommonJS (require/module.exports)
 */
```

### STEP 2: Use Correct Import/Export Syntax

```javascript
// ✅ CORRECT - ES6 imports
import { storage } from './storage.js';
import { showToast } from './ui.js';

// ✅ CORRECT - ES6 exports
export function myFunction() { }
export const myConstant = 42;
export class MyClass { }

// ❌ WRONG - CommonJS (will break in browser)
const { storage } = require('./storage.js');
module.exports = { myFunction };
```

### STEP 3: Attach Event Listeners

Every DOM-handling function MUST have an `addEventListener()` call:

```javascript
// ✅ CORRECT - Function defined AND attached
export function toggleTheme() {
    document.documentElement.classList.toggle('dark');
}

const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}

// ❌ WRONG - Function defined but never attached
export function toggleTheme() {
    document.documentElement.classList.toggle('dark');
}
// Missing: addEventListener() call - button won't work!
```

### STEP 4: Never Use Node.js Globals Directly

Browser code CANNOT access Node.js globals. Always guard or use alternatives:

```javascript
// ❌ WRONG - Breaks in browser
const mode = process.env.AI_MODE;
const dir = __dirname;

// ✅ CORRECT - Browser-safe with guards
const getEnvVar = (key, defaultValue) => {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
    }
    if (typeof window !== 'undefined' && window.AI_CONFIG && window.AI_CONFIG[key]) {
        return window.AI_CONFIG[key];
    }
    return defaultValue;
};
const mode = getEnvVar('AI_MODE', 'mock');
```

**Node.js Globals to NEVER Use Directly**:
- `process` (process.env, process.cwd, process.platform)
- `__dirname`
- `__filename`
- `require.resolve`
- `Buffer` (use Uint8Array instead)
- `global` (use window or globalThis)

### STEP 5: Validate Template Variables

```bash
# Check for unreplaced variables
grep -r "{{[A-Z_]*}}" .
# Should return: nothing (all variables replaced)
```

---

## Validation Checklist (MANDATORY Before Deployment)

- [ ] All `.js` files use `import`/`export` (no `require()` or `module.exports`)
- [ ] Every DOM-handling function has `addEventListener()` binding
- [ ] All `{{TEMPLATE_VAR}}` replaced with actual values
- [ ] No CommonJS syntax anywhere in browser code
- [ ] No Node.js globals used directly (process, __dirname, __filename)
- [ ] Tested in browser console (no "require is not defined" errors)
- [ ] Dark mode toggle works (requires Tailwind `darkMode: 'class'` config)
- [ ] Footer GitHub link is properly linked

