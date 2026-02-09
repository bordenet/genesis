# Troubleshooting: Module & Browser Errors

> **Parent:** [`TROUBLESHOOTING.md`](../TROUBLESHOOTING.md)

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

## Node.js Globals in Browser (process is not defined)

### Symptoms
- Browser console shows: `Uncaught ReferenceError: process is not defined`
- Browser console shows: `Uncaught ReferenceError: __dirname is not defined`
- Browser console shows: `Uncaught ReferenceError: __filename is not defined`
- Code works in Node.js but fails in browser

### Cause
JavaScript files are using Node.js-specific globals (`process`, `__dirname`, `__filename`, etc.) that don't exist in browsers. These globals are only available in Node.js environments.

### Solution

**1. Run the module system validator**:
```bash
./scripts/validate-module-system.sh js/
```

**2. Replace Node.js globals with browser-safe alternatives**:

#### Problem: process.env

❌ **WRONG (breaks in browser)**:
```javascript
const AI_MODE = process.env.AI_MODE || "mock";
const API_KEY = process.env.API_KEY;
```

✅ **CORRECT (works everywhere)**:
```javascript
// Helper function for environment variables
const getEnvVar = (key, defaultValue = null) => {
    // Check if running in Node.js
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
    }
    // Check if running in browser with window.AI_CONFIG
    if (typeof window !== 'undefined' && window.AI_CONFIG && window.AI_CONFIG[key]) {
        return window.AI_CONFIG[key];
    }
    // Fallback to default
    return defaultValue;
};

const AI_MODE = getEnvVar('AI_MODE', 'mock');
const API_KEY = getEnvVar('API_KEY');
```

#### Problem: __dirname and __filename

❌ **WRONG (breaks in browser)**:
```javascript
const configPath = path.join(__dirname, 'config.json');
const currentFile = __filename;
```

✅ **CORRECT (works in browsers)**:
```javascript
// Use import.meta.url for ES6 modules
const currentModuleUrl = import.meta.url;

// Or use relative paths directly
const configPath = './config.json';
```

#### Problem: Other Node.js globals

| Node.js Global | Browser Alternative |
|----------------|---------------------|
| `process.cwd()` | Use relative paths or `window.location` |
| `process.platform` | Use `navigator.platform` or `navigator.userAgent` |
| `Buffer` | Use `Uint8Array` or `TextEncoder/TextDecoder` |
| `global` | Use `window` or `globalThis` |
| `require.resolve()` | Use relative import paths |

**3. Configure environment in HTML (for browser deployments)**:

```html
<!-- index.html -->
<script>
    // Define browser-accessible config
    window.AI_CONFIG = {
        AI_MODE: 'mock',
        API_ENDPOINT: 'https://api.example.com',
        // Add other config here
    };
</script>
<script type="module" src="js/app.js"></script>
```

**4. Or use localStorage for persistent config**:

```javascript
// Set config
localStorage.setItem('AI_MODE', 'mock');

// Get config
const AI_MODE = localStorage.getItem('AI_MODE') || 'mock';
```

### Prevention
- Never use Node.js globals directly in browser code
- Always guard with `typeof process !== 'undefined'` checks
- Use browser-safe alternatives (window, localStorage, HTML data attributes)
- Run `./scripts/validate-module-system.sh` before deployment
- Test in actual browser, not just Node.js

### Reference
- See: `01-AI-INSTRUCTIONS.md` (STEP 4: Never Use Node.js Globals Directly)

---

