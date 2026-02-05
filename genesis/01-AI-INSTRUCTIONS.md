# Genesis Project Template - AI Instructions

**Version**: 2.1
**Last Updated**: 2026-02-05
**Purpose**: Instructions for AI assistants creating **paired assistant+validator** projects

---

## 🚨 TWO NON-NEGOTIABLE MANDATES

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  MANDATE 1: CONTINUOUS IMPROVEMENT TRACKING                                 ║
║                                                                              ║
║  Maintain: genesis-tools/genesis/CONTINUOUS_IMPROVEMENT.md                  ║
║                                                                              ║
║  As you encounter ANY friction, obstacle, or gap:                           ║
║  → IMMEDIATELY add it to CONTINUOUS_IMPROVEMENT.md                          ║
║  → Include: what happened, expected behavior, suggested fix                 ║
║                                                                              ║
║  This is how genesis improves. NOT optional.                                ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  MANDATE 2: AGGRESSIVE DIFF TOOL USAGE                                      ║
║                                                                              ║
║  cd genesis-tools/genesis/project-diff && node diff-projects.js             ║
║                                                                              ║
║  Run this:                                                                   ║
║  ✓ After copying templates                                                  ║
║  ✓ After EVERY significant change                                           ║
║  ✓ Before EVERY commit                                                      ║
║  ✓ When modifying shared files                                              ║
║                                                                              ║
║  LLMs are stochastic. The diff tool catches inevitable inconsistencies.     ║
║  ⛔ DO NOT PROCEED if MUST_MATCH files show divergence!                     ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

**⚠️ CRITICAL - READ FIRST**: Before starting ANY work on a Genesis-created project:
1. **Read `CODE-CONSISTENCY-MANDATE.md`** - Deviation from hello-world is FORBIDDEN
2. Read `CLAUDE.md` in the target repository
3. Follow the mandatory workflow: **lint → test → proactively communicate what's left**
4. NEVER include `node_modules/` or build artifacts
5. ALWAYS create `.gitignore` files
6. **Run `project-diff --ci` REPEATEDLY** during development (compares all projects)

---

## 🏗️ Paired Architecture

**All Genesis projects use the paired model with real directories:**

```
my-project/
├── assistant/              # Document creation workflow
│   ├── index.html
│   ├── js/
│   │   ├── app.js
│   │   ├── workflow.js
│   │   ├── storage.js
│   │   └── ...
│   └── tests/
├── validator/              # Document validation/scoring
│   ├── index.html
│   ├── js/
│   │   ├── app.js
│   │   └── validator.js
│   └── testdata/
├── js/                     # Mirror of assistant/js/ (for root deployment)
├── package.json            # Unified scripts
└── .github/workflows/ci.yml
```

### Quick Start for New Projects

```bash
# Copy from hello-world template
cp -r genesis/examples/hello-world my-new-tool

# Customize for your document type
cd my-new-tool
# Edit prompts/, js/workflow.js, validator/js/validator.js
```

### Self-Contained Projects

Each project is self-contained with real directories (no symlinks). Benefits:
- **Simple setup**: Clone and run, no external dependencies
- **Clear git history**: All changes tracked in one repo
- **Easy CI/CD**: No special symlink handling needed

### Maintaining Consistency

Use the `project-diff` tools to keep projects aligned:

```bash
# From genesis/project-diff directory
node diff-projects.js --ci    # Check for divergent MUST_MATCH files
node find-orphans.js          # Find unused JS files
```

**Run these tools REPEATEDLY during development** - at least:
1. After initial scaffolding
2. Before every commit
3. Before creating a PR

**See `CODE-CONSISTENCY-MANDATE.md` for complete consistency rules.**

---

## 🎯 Your Mission

You are an AI assistant helping create **paired assistant+validator** projects from Genesis templates. Each project includes:
- **Assistant** - 3-phase AI workflow for document creation
- **Validator** - Quality scoring for completed documents

**Success Criteria**: Create a fully working paired project with GitHub Pages deployment in <2 hours.

---

## ⚠️ Professional Standards - READ FIRST

**CRITICAL**: Projects created with Genesis will be viewed by colleagues and the broader community. They reflect the developer's commitment to code quality and professional communication.

**Before starting, read and commit to**:
1. **`05-QUALITY-STANDARDS.md`** - Professional standards document
2. **`02-DEPENDENCY-MANAGEMENT.md`** - **THE IRON LAW OF DEPENDENCIES** (MANDATORY - Read this NOW)
3. **`templates/docs/SHELL_SCRIPT_STANDARDS-template.md`** - Shell script standards (MANDATORY for all scripts)
4. **85% code coverage** minimum for all logic and branches
5. **Clear, factual language** - No hyperbole, no unsubstantiated claims
6. **Validate all cross-references** - Every link, import, and script reference must work
7. **Test all code paths** - Unit, integration, and end-to-end tests

### 🚨 THE IRON LAW OF DEPENDENCIES

**EVERY dependency MUST be added to `./scripts/setup-*.sh`**

This is **NOT optional**. This is an **ABSOLUTE REQUIREMENT**.

When you add a feature that requires a new dependency:
1. **STOP** - Do not proceed with implementation
2. Update `./scripts/setup-macos.sh` (and `setup-linux.sh` if applicable)
3. Add the dependency installation steps
4. **THEN** proceed with feature implementation
5. Commit setup script AND feature code together

Read `02-DEPENDENCY-MANAGEMENT.md` for complete details.
7. **Professional documentation** - Clear, accurate, helpful

**Writing Standards**:
- ❌ Avoid: "amazing", "revolutionary", "production-grade", "enterprise-ready"
- ✅ Use: Clear, factual statements with specific, measurable claims

**Quality Checklist**:
- [ ] All tests pass
- [ ] Code coverage ≥ 85%
- [ ] All hyperlinks validated
- [ ] Cross-browser tested
- [ ] Accessibility verified
- [ ] Documentation accurate and complete

---

## ⚠️ CRITICAL: Module System Validation

**MANDATORY FOR ALL BROWSER-BASED PROJECTS**

All JavaScript files in Genesis web-app templates use **ES6 modules** (`import`/`export`). This is **NOT optional** - it's required for browser compatibility.

### Why ES6 Modules?

- ✅ Native browser support (no bundler needed)
- ✅ Proper dependency management
- ✅ Better performance (parallel loading)
- ✅ Modern JavaScript standard
- ❌ CommonJS (`require`/`module.exports`) **DOES NOT WORK** in browsers with `<script type="module">`

### Before Writing ANY JavaScript Code

**STEP 1: Declare Module Type**
```javascript
/**
 * Module Name
 *
 * ⚠️ CRITICAL: This file MUST use ES6 modules
 * The browser loads this with <script type="module">
 * DO NOT use CommonJS (require/module.exports)
 */
```

**STEP 2: Use Correct Import/Export Syntax**
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

**STEP 3: Attach Event Listeners**

Every DOM-handling function MUST have an `addEventListener()` call:

```javascript
// ✅ CORRECT - Function defined AND attached
export function toggleTheme() {
    document.documentElement.classList.toggle('dark');
}

// Attach listener immediately
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

**STEP 4: Never Use Node.js Globals Directly**

Browser code CANNOT access Node.js globals. Always guard or use browser-safe alternatives:

```javascript
// ❌ WRONG - Breaks in browser
const mode = process.env.AI_MODE;
const dir = __dirname;
const file = __filename;

// ✅ CORRECT - Browser-safe with guards
const getEnvVar = (key, defaultValue) => {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
    }
    // Browser fallback: check window.AI_CONFIG or use default
    if (typeof window !== 'undefined' && window.AI_CONFIG && window.AI_CONFIG[key]) {
        return window.AI_CONFIG[key];
    }
    return defaultValue;
};
const mode = getEnvVar('AI_MODE', 'mock');

// ✅ CORRECT - Browser-safe alternatives
// Instead of process.env: Use window.AI_CONFIG, localStorage, or HTML data attributes
// Instead of __dirname: Use import.meta.url or relative paths
// Instead of __filename: Use import.meta.url
```

**Node.js Globals to NEVER Use Directly**:
- `process` (process.env, process.cwd, process.platform)
- `__dirname`
- `__filename`
- `require.resolve`
- `Buffer` (use Uint8Array instead)
- `global` (use window or globalThis)

**STEP 5: Validate Template Variables**

Before marking ANY file complete, search for unreplaced template variables:

```bash
# Check for unreplaced variables
grep -r "{{[A-Z_]*}}" .
# Should return: nothing (all variables replaced)
```

### Validation Checklist (MANDATORY Before Deployment)

- [ ] All `.js` files use `import`/`export` (no `require()` or `module.exports`)
- [ ] Every DOM-handling function has `addEventListener()` binding
- [ ] All `{{TEMPLATE_VAR}}` replaced with actual values
- [ ] No CommonJS syntax anywhere in browser code
- [ ] No Node.js globals used directly (process, __dirname, __filename)
- [ ] All environment config uses browser-safe alternatives
- [ ] Tested in browser console (no "require is not defined" or "process is not defined" errors)
- [ ] Dark mode toggle works (requires Tailwind `darkMode: 'class'` config)
- [ ] All UI buttons/controls are responsive
- [ ] Footer GitHub link is properly linked (not just gray text)

### Reference Implementations (Paired Projects)

**⭐ PRIMARY REFERENCE** (study this first):
- [one-pager](https://github.com/bordenet/one-pager) - **Complete paired assistant+validator project**
  - Assistant: https://bordenet.github.io/one-pager/
  - Validator: https://bordenet.github.io/one-pager/validator/

**✅ All Paired Projects**:

| Project | Assistant | Validator |
|---------|-----------|-----------|
| [one-pager](https://github.com/bordenet/one-pager) | [Demo](https://bordenet.github.io/one-pager/) | [Demo](https://bordenet.github.io/one-pager/validator/) |
| [product-requirements-assistant](https://github.com/bordenet/product-requirements-assistant) | [Demo](https://bordenet.github.io/product-requirements-assistant/) | [Demo](https://bordenet.github.io/product-requirements-assistant/validator/) |
| [architecture-decision-record](https://github.com/bordenet/architecture-decision-record) | [Demo](https://bordenet.github.io/architecture-decision-record/) | [Demo](https://bordenet.github.io/architecture-decision-record/validator/) |
| [strategic-proposal](https://github.com/bordenet/strategic-proposal) | [Demo](https://bordenet.github.io/strategic-proposal/) | [Demo](https://bordenet.github.io/strategic-proposal/validator/) |
| [pr-faq-assistant](https://github.com/bordenet/pr-faq-assistant) | [Demo](https://bordenet.github.io/pr-faq-assistant/) | [Demo](https://bordenet.github.io/pr-faq-assistant/validator/) |
| [power-statement-assistant](https://github.com/bordenet/power-statement-assistant) | [Demo](https://bordenet.github.io/power-statement-assistant/) | [Demo](https://bordenet.github.io/power-statement-assistant/validator/) |

**❌ What NOT to Do**:
- Using `require()` in browser code
- Using `module.exports` in browser code
- Defining event handlers without attaching them
- Leaving `{{TEMPLATE_VAR}}` unreplaced
- Creating standalone assistant-only or validator-only projects (use paired model)

### Common Failures and Fixes

| Symptom | Cause | Fix |
|---------|-------|-----|
| "require is not defined" | CommonJS in browser | Replace with ES6 `import` |
| "process is not defined" | Node.js globals in browser | Guard with `typeof process !== 'undefined'` |
| "Cannot find module" | Wrong module syntax | Use ES6 `export` |
| Buttons don't work | Missing event listeners | Add `addEventListener()` calls |
| Dark mode broken | Missing Tailwind config | Add `tailwind.config = { darkMode: 'class' }` |
| `{{VAR}}` in output | Template not replaced | Replace all template variables |
| Gray GitHub text | Footer link not styled | Ensure `<a>` tag wraps GitHub text |

---

## 🚀 Step-by-Step Process

> **⚠️ IMPORTANT:** The step-by-step process has been modularized into smaller files.
>
> **Start here:** [`START-HERE.md`](START-HERE.md)
>
> The orchestrator guides you through 6 step files in `steps/`:
> - `00-prerequisites.md` - Understand workflow and architecture
> - `01-requirements.md` - Gather template variables
> - `02-domain-research.md` - Research document type
> - `03-copy-templates.md` - Copy from hello-world
> - `04-install-test.md` - Install, test, lint
> - `05-deploy.md` - Deploy to GitHub Pages

---

## 🔄 Ongoing Development - MANDATORY RULES

**CRITICAL**: After the initial project is created, these rules apply to ALL future development.

### Rule 1: The Iron Law of Dependencies

**EVERY time you add a dependency, you MUST update `./scripts/setup-*.sh`**

#### Workflow for Adding Dependencies:

1. **User asks for a feature** (e.g., "Add PDF export")
2. **You identify dependency needed** (e.g., `jspdf` npm package)
3. **STOP - Do not implement yet**
4. **Tell user**: "This requires the jspdf package. I will add it to package.json and update scripts/setup-macos.sh."
5. **Update package file**: Add to `package.json` (or `requirements.txt`, etc.)
6. **Update setup script**: Add installation to `scripts/setup-macos.sh`
7. **Show both changes to user**
8. **THEN implement the feature**
9. **Commit package file AND setup script together**

#### Example Dialogue:

```
User: "Add support for exporting to PDF"

AI: "PDF export requires the jspdf library. I will:
     1. Add jspdf to package.json
     2. Update scripts/setup-macos.sh to install it
     3. Implement the PDF export feature"

AI: [Shows package.json changes]
AI: [Shows setup-macos.sh changes]
AI: "Setup script updated. New developers can run
     ./scripts/setup-macos.sh to get all dependencies."

AI: [Implements PDF export feature]
```

#### What Counts as a Dependency:

- ✅ npm/pip/gem packages
- ✅ System packages (Homebrew, apt, etc.)
- ✅ Command-line tools
- ✅ Database servers
- ✅ Runtime environments
- ✅ Development tools (linters, formatters)
- ✅ **ANYTHING not in the repository that the project needs**

#### Verification:

Before committing code that uses a new dependency:
- [ ] Dependency added to package file
- [ ] **`./scripts/setup-macos.sh` updated**
- [ ] **`./scripts/setup-linux.sh` updated (if project supports Linux)**
- [ ] Setup script tested
- [ ] Both files committed together

**Read `02-DEPENDENCY-MANAGEMENT.md` for complete details.**

### Rule 2: Quality Gates Always Apply

Every commit must pass:
- [ ] ShellCheck (zero warnings)
- [ ] JavaScript syntax validation
- [ ] Shell script standards (timer, help, verbose)
- [ ] No TODO/FIXME comments
- [ ] No console.log statements
- [ ] Pre-commit hook passes
- [ ] CI/CD pipeline passes

### Rule 3: Test Before Committing

- [ ] Run `./scripts/validate.sh` - must pass
- [ ] Run `shellcheck scripts/*.sh scripts/lib/*.sh` - must pass
- [ ] Test the feature works
- [ ] Test setup script on clean environment (if dependencies changed)

---

## ✅ Success Criteria

Project is complete when:
1. ✅ All files created from templates
2. ✅ All variables replaced
3. ✅ Git repository initialized
4. ✅ GitHub repository created and pushed
5. ✅ GitHub Pages deployed and accessible
6. ✅ CI/CD pipeline passing
7. ✅ Web app fully functional
8. ✅ All validation checks pass
9. ✅ Code coverage ≥ 85% (if applicable)
10. ✅ All hyperlinks validated
11. ✅ Professional documentation standards met
12. ✅ AI mock mode implemented (if using external LLMs)
13. ✅ **Shell scripts follow standards** (timer, help, verbose mode)
14. ✅ **`scripts/setup-macos.sh` created and tested**
15. ✅ **`scripts/deploy-web.sh` created and tested** (for web apps)
16. ✅ **All scripts pass shellcheck with zero warnings**

---

## 📚 Reference Documents

**⭐ PRIMARY WORKING EXAMPLE** (study this first):
- **[one-pager](https://github.com/bordenet/one-pager)** - Complete Genesis-generated project with all patterns implemented

Read these before starting:
1. **`CODE-CONSISTENCY-MANDATE.md`** - **MANDATORY** - Deviation from hello-world is FORBIDDEN
2. `docs/historical/00-GENESIS-PLAN.md` - Historical planning document (optional)
3. `05-QUALITY-STANDARDS.md` - Professional quality standards (MANDATORY)
4. `templates/docs/SHELL_SCRIPT_STANDARDS-template.md` - Shell script standards (MANDATORY)
5. `integration/DEVELOPMENT_PROTOCOLS.md` - AI development protocols
6. `integration/PROJECT_SETUP_CHECKLIST.md` - Detailed setup steps
7. `docs/UX-PATTERNS.md` - 12 critical UX patterns for workflow apps

**Shell Script References**:
- ⭐ **[product-requirements-assistant/scripts/](https://github.com/bordenet/product-requirements-assistant/tree/main/scripts)** - PRIMARY REFERENCE for all scripts
  - [deploy-web.sh](https://github.com/bordenet/product-requirements-assistant/blob/main/scripts/deploy-web.sh) - Deployment script with proper compact mode
  - [setup-macos.sh](https://github.com/bordenet/product-requirements-assistant/blob/main/scripts/setup-macos.sh) - macOS setup script
  - [setup-linux.sh](https://github.com/bordenet/product-requirements-assistant/blob/main/scripts/setup-linux.sh) - Linux setup script
  - [setup-windows-wsl.sh](https://github.com/bordenet/product-requirements-assistant/blob/main/scripts/setup-windows-wsl.sh) - Windows WSL setup script
- [bu.sh](https://github.com/bordenet/scripts/blob/main/bu.sh) - Reference implementation for shell script standards

---

## 🆘 Troubleshooting

**Problem**: Template variables not replaced  
**Solution**: Search for `{{` in all files, replace manually

**Problem**: GitHub Pages shows 404  
**Solution**: Check Settings → Pages, verify source is correct

**Problem**: CI pipeline fails  
**Solution**: Check `.github/workflows/` files, verify syntax

**Problem**: Web app blank page  
**Solution**: Check browser console, verify all JS files loaded

---

**Ready to begin? Start with [`START-HERE.md`](START-HERE.md)!** 🚀

