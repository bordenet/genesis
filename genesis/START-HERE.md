# 🚀 Genesis - Start Here

**For AI Assistants**: This is your ONLY entry point. Read this file completely, then execute the steps below.

**Verification**: Use [`AI-EXECUTION-CHECKLIST.md`](AI-EXECUTION-CHECKLIST.md) to verify you've completed all steps.

---

## What You're About to Do

You're in a fresh repository with the `genesis/` directory. Your mission:
1. Create a fully working web application from templates
2. Set up testing, linting, and CI/CD
3. Deploy to GitHub Pages
4. Delete the `genesis/` directory when done
5. Tell the user: "Ready to start coding"

**Time Budget**: 30-60 minutes  
**Success Criteria**: Working app deployed to GitHub Pages, genesis/ deleted, all tests passing

---

## 📚 STEP 0: Study Reference Implementation FIRST (REQUIRED)

**⚠️ STOP!** Before proceeding, you MUST study the reference implementation:

### Required Reading (in order):

1. **[`REFERENCE-IMPLEMENTATIONS.md`](REFERENCE-IMPLEMENTATIONS.md)** - Overview of working examples
2. **Study the live example**: https://github.com/bordenet/product-requirements-assistant
   - **CRITICAL**: Browse the repository on GitHub
   - **`docs/index.html`** (lines 9-15) - ⭐ **Tailwind dark mode config** (ALWAYS BROKEN WITHOUT THIS!)
   - **`docs/js/app.js`** (lines 145-165) - ⭐ **Dark mode toggle functions** (loadTheme, toggleTheme)
   - **`js/workflow.js`** - Phase architecture, prompt loading, data flow
   - **`js/app.js`** - Form rendering, phase transitions, UI logic
   - **`prompts/phase1.md`** - Prompt template with variables
   - **`templates/prd-template.md`** - Document structure
   - **`tests/workflow.test.js`** - Testing async prompts
   - **`scripts/deploy-web.sh`** - ⭐ **Compact mode deployment** (git output redirection)
   - **`scripts/setup-macos.sh`** - ⭐ **Fast, resumable setup** (smart caching)
3. **[`docs/WORKFLOW-ARCHITECTURE.md`](docs/WORKFLOW-ARCHITECTURE.md)** - Detailed workflow patterns + dark mode fix
4. **[`docs/REQUIREMENTS-TEMPLATE.md`](docs/REQUIREMENTS-TEMPLATE.md)** - What to ask vs. infer
5. **[`docs/WORKFLOW-DECISION-TREE.md`](docs/WORKFLOW-DECISION-TREE.md)** - Decision framework

### What You'll Learn:

- ✅ **Dark mode toggle** (Tailwind `darkMode: 'class'` config) - **CRITICAL!**
- ✅ **loadTheme()** function (prevents flash of wrong theme)
- ✅ **toggleTheme()** function (works with Tailwind class mode)
- ✅ 3-phase workflow pattern (mock, manual, mock)
- ✅ Form-to-prompt pattern for Phase 1
- ✅ Template variable replacement (`{variableName}` syntax)
- ✅ Async prompt loading from markdown files
- ✅ Defensive coding patterns
- ✅ Mock mode vs. manual mode
- ✅ How form fields map to template sections
- ✅ How to structure prompts in separate files
- ✅ How to test async prompt loading
- ✅ **Deployment scripts** (compact mode, quality gates)
- ✅ **Setup scripts** (fast, resumable, smart caching)

### Why This Matters:

**This will answer 90% of your questions BEFORE you ask the user.**

The reference implementation shows you EXACTLY how to:
- **Fix dark mode toggle** (broken in EVERY Genesis project without Tailwind config)
- Structure the workflow phases
- Load prompts from markdown files
- Handle form data and template variables
- Implement mock mode for development
- Write defensive code with proper validation
- Test async functionality
- **Deploy with quality gates** (lint, test, coverage)
- **Create fast setup scripts** (5-10 seconds on subsequent runs)

**DO NOT PROCEED** until you've studied these references. This will save you and the user significant time by avoiding unnecessary questions about patterns that are already solved.

### 🚨 CRITICAL: Dark Mode Fix

**EVERY Genesis project has had broken dark mode.** The fix is simple but MANDATORY:

```html
<!-- In HTML <head> -->
<script src="https://cdn.tailwindcss.com"></script>
<script>
    tailwind.config = {
        darkMode: 'class'  // ← CRITICAL: Without this, toggle won't work!
    }
</script>
```

**Study the reference implementation for the complete pattern!**

---

## Step 1: Read Mandatory Files (5 minutes)

Read these files IN ORDER. They contain critical information you MUST follow:

1. **[`templates/CLAUDE.md.template`](templates/CLAUDE.md.template)** - Mandatory workflow (lint → test → communicate)
2. **[`05-QUALITY-STANDARDS.md`](05-QUALITY-STANDARDS.md)** - Quality requirements (85% coverage, no hyperbole)
3. **[`examples/hello-world/README.md`](examples/hello-world/README.md)** - Working example to copy from

**Critical Rules**:
- ✅ ALWAYS lint after creating code (`npm run lint`)
- ✅ ALWAYS test after creating tests (`npm test`)
- ✅ ALWAYS create `.gitignore` (use `templates/project-structure/gitignore-template`)
- ❌ NEVER include `node_modules/`, `coverage/`, `dist/`, `build/`
- ❌ NEVER use hyperbolic language ("amazing", "production-grade", etc.)

---

## Step 2: Gather Requirements (5 minutes)

**After studying the reference implementation**, ask the user ONLY these essential questions:

```
1. Project name? (e.g., "one-pager")
2. Project title? (e.g., "One-Pager Assistant")
3. One-line description?
4. GitHub username?
5. GitHub repo name?
6. What type of document? (e.g., "One-Pager", "PRD", "Design Doc")
7. Link to document template or example? (if available)
8. Any deviations from standard 3-phase workflow? (default: NO)
```

**DO NOT ASK** - Infer from reference implementation:
- ❌ How many phases? (Default: 3)
- ❌ Should prompts be in files? (YES - always in `prompts/` directory)
- ❌ Should templates be abstracted? (YES - always in `templates/` directory)
- ❌ How should mock mode work? (See product-requirements-assistant)
- ❌ Should Phase 1 have a form? (YES - if document is structured)
- ❌ How should validation work? (See defensive coding patterns in WORKFLOW-ARCHITECTURE.md)

**Default Workflow** (unless user specifies otherwise):
- 3 phases: Initial Draft (mock), Gemini Review (manual), Final Synthesis (mock)
- Prompts in `prompts/phase1.md`, `prompts/phase2.md`, `prompts/phase3.md`
- Template in `templates/{document-type}-template.md`
- Phase 1 form with fields matching template sections
- Template variables using `{variableName}` syntax

**Store these as variables** - you'll use them to replace `{{PROJECT_NAME}}`, `{{GITHUB_USER}}`, etc. in templates.

---

## Step 3: Copy and Customize Templates (15 minutes)

### 3.1 Copy Core Files

```bash
# Copy .gitignore (CRITICAL - do this FIRST)
cp genesis/templates/project-structure/gitignore-template .gitignore

# Copy CLAUDE.md
cp genesis/templates/CLAUDE.md.template CLAUDE.md
# Replace {{PROJECT_NAME}} with actual project name

# Copy README.md
cp genesis/templates/project-structure/README-template.md README.md
# Replace all {{VARIABLES}} with actual values

# Copy REVERSE-INTEGRATION-NOTES.md (CRITICAL - track what Genesis is missing)
cp genesis/templates/project-structure/REVERSE-INTEGRATION-NOTES-template.md REVERSE-INTEGRATION-NOTES.md
# Replace {{PROJECT_NAME}} with actual project name

# Copy package.json
cp genesis/examples/hello-world/package.json .
# Update name, description, repository fields
```

**📝 IMPORTANT**: The `REVERSE-INTEGRATION-NOTES.md` file is where you'll document:
- Every time you reference product-requirements-assistant or one-pager to solve a problem
- What patterns are missing from Genesis templates
- What bugs Genesis should prevent
- What features future projects will need

**This creates a continuous improvement cycle for Genesis!**

### 3.2 Copy Web App Files

```bash
# Copy HTML
cp genesis/examples/hello-world/index.html .
# Customize title, phases, branding

# Copy JavaScript
mkdir -p js
cp genesis/examples/hello-world/js/*.js js/
# Customize workflow.js with actual phases

# Copy CSS
mkdir -p css
cp genesis/examples/hello-world/css/styles.css css/

# Copy tests
mkdir -p tests
cp genesis/examples/hello-world/tests/*.js tests/
# Update tests to match your workflow

# Copy test config
cp genesis/examples/hello-world/jest.config.js .
cp genesis/examples/hello-world/jest.setup.js .
cp genesis/examples/hello-world/.eslintrc.json .
```

### 3.3 Copy Scripts

**⚠️ CRITICAL**: Study https://github.com/bordenet/product-requirements-assistant/tree/main/scripts FIRST

```bash
# Create scripts directory
mkdir -p scripts/lib

# MANDATORY: Copy setup scripts (ALWAYS REQUIRED)
cp genesis/templates/scripts/setup-macos-template.sh scripts/setup-macos.sh
# If supporting Linux:
cp genesis/templates/scripts/setup-linux-template.sh scripts/setup-linux.sh

# Copy deployment script (for web apps)
cp genesis/templates/scripts/deploy-web.sh.template scripts/deploy-web.sh
# Replace {{PROJECT_NAME}}, {{GITHUB_USER}}, {{GITHUB_REPO}}, {{GITHUB_PAGES_URL}}

# Copy library scripts
cp genesis/templates/scripts/lib/common-template.sh scripts/lib/common.sh
cp genesis/templates/scripts/lib/compact.sh scripts/lib/compact.sh

# Make scripts executable
chmod +x scripts/*.sh scripts/lib/*.sh

# Verify setup-macos.sh exists
ls -la scripts/setup-macos.sh
```

### 3.4 Replace Template Variables

In ALL copied files, replace:
- `{{PROJECT_NAME}}` → actual project name
- `{{PROJECT_TITLE}}` → actual project title
- `{{PROJECT_DESCRIPTION}}` → actual description
- `{{GITHUB_USER}}` → actual GitHub username
- `{{GITHUB_REPO}}` → actual repo name
- `{{PHASE_COUNT}}` → actual number of phases
- `{{PHASE_1_NAME}}`, `{{PHASE_1_AI}}`, etc. → actual phase details

---

## Step 4: Install and Test (10 minutes)

```bash
# Install dependencies
npm install

# Lint
npm run lint
# Fix any errors with: npm run lint:fix

# Test
NODE_OPTIONS=--experimental-vm-modules npm test

# Coverage
NODE_OPTIONS=--experimental-vm-modules npm run test:coverage
# Verify ≥70% coverage (or ≥85% for production apps)
```

**If tests fail**: Fix them before proceeding. Do NOT skip this step.

---

## Step 5: Set Up GitHub (5 minutes)

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit from Genesis template"

# Create GitHub repo (user does this manually or via gh CLI)
# Then:
git remote add origin git@github.com:{{GITHUB_USER}}/{{GITHUB_REPO}}.git
git branch -M main
git push -u origin main
```

---

## Step 6: Enable GitHub Pages (2 minutes)

Tell user:
```
1. Go to: https://github.com/{{GITHUB_USER}}/{{GITHUB_REPO}}/settings/pages
2. Source: Deploy from a branch
3. Branch: main
4. Folder: / (root)
5. Save
6. Wait 1-2 minutes
7. Visit: https://{{GITHUB_USER}}.github.io/{{GITHUB_REPO}}/
```

---

## Step 7: Test Deployment Script (3 minutes)

```bash
# Test deployment script
./scripts/deploy-web.sh --help
# Verify help displays correctly

# Run deployment
./scripts/deploy-web.sh
# This will:
# 1. Run linting
# 2. Run tests
# 3. Check coverage
# 4. Commit and push
# 5. Verify deployment
```

**Note**: For future deployments, always use `./scripts/deploy-web.sh` instead of manual git commands.

---

## Step 8: Delete Genesis (1 minute)

```bash
# Remove genesis directory
rm -rf genesis/

# Commit
git add .
git commit -m "Remove genesis template directory"
git push
```

---

## Step 9: Final Verification (2 minutes)

Verify:
- ✅ App works at `https://{{GITHUB_USER}}.github.io/{{GITHUB_REPO}}/`
- ✅ All tests passing (`npm test`)
- ✅ Linting clean (`npm run lint`)
- ✅ Coverage ≥70% (`npm run test:coverage`)
- ✅ Deployment script works (`./scripts/deploy-web.sh`)
- ✅ No `node_modules/` or `coverage/` in git
- ✅ `genesis/` directory deleted

---

## Step 10: Tell User

```
✅ Completed:
- Created {{PROJECT_TITLE}} from Genesis template
- Linting: PASSED (0 errors)
- Tests: PASSED (X/X tests)
- Coverage: X% (exceeds threshold)
- Deployed: https://{{GITHUB_USER}}.github.io/{{GITHUB_REPO}}/
- Deployment script: Use `./scripts/deploy-web.sh` for future deployments
- Genesis directory: DELETED

✅ What's Left:
- NOTHING - Ready to start coding!
- You can now customize the app for your specific use case
- All quality infrastructure is in place (tests, linting, CI/CD)
```

---

**That's it!** You've successfully bootstrapped a new project from Genesis. The user can now start coding with full confidence that quality standards are enforced.

