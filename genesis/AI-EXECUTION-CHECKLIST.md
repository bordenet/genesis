# AI Execution Checklist

**For AI Assistants**: Use this checklist to verify you've completed all steps from START-HERE.md

---

## ⚠️ BEFORE YOU START (MANDATORY)

**DO NOT PROCEED** until you've completed these prerequisite steps:

- [ ] Read `REFERENCE-IMPLEMENTATIONS.md`
- [ ] Study https://github.com/bordenet/product-requirements-assistant
  - [ ] Read `js/workflow.js` - Phase architecture, prompt loading, data flow
  - [ ] Read `js/app.js` - Form rendering, phase transitions, UI logic
  - [ ] Read `prompts/phase1.md` - Prompt template with variables
  - [ ] Read `templates/prd-template.md` - Document structure
  - [ ] Read `tests/workflow.test.js` - Testing async prompts
- [ ] Read `docs/WORKFLOW-ARCHITECTURE.md`
- [ ] Read `docs/REQUIREMENTS-TEMPLATE.md`
- [ ] Read `docs/WORKFLOW-DECISION-TREE.md`
- [ ] Understand the 3-phase workflow pattern (mock, manual, mock)
- [ ] Understand form-to-prompt pattern for Phase 1
- [ ] Understand template variable replacement (`{variableName}` syntax)
- [ ] Understand async prompt loading from markdown files
- [ ] Understand defensive coding patterns
- [ ] Understand mock vs. manual mode

**Why this matters**: This will answer 90% of your questions BEFORE you ask the user. You'll know:
- ✅ How to structure workflow phases (default: 3 phases)
- ✅ How to load prompts from markdown files (always in `prompts/` directory)
- ✅ How to handle form data and template variables
- ✅ How to implement mock mode for development
- ✅ How to write defensive code with proper validation
- ✅ How to test async functionality

**If you skip this step, you will waste time asking questions that are already answered in the reference implementation.**

---

## Pre-Execution Verification

Before starting, verify these files exist in genesis/:

- [ ] `START-HERE.md` (your entry point)
- [ ] `templates/CLAUDE.md.template` (mandatory workflow)
- [ ] `05-QUALITY-STANDARDS.md` (quality requirements)
- [ ] `examples/hello-world/README.md` (working example)
- [ ] `templates/project-structure/gitignore-template` (prevent build artifacts)
- [ ] `examples/hello-world/package.json` (dependencies)
- [ ] `examples/hello-world/index.html` (web app)
- [ ] `examples/hello-world/js/*.js` (4 files: app, storage, workflow, ai-mock)
- [ ] `examples/hello-world/css/styles.css` (styles)
- [ ] `examples/hello-world/tests/*.js` (3 test files)
- [ ] `examples/hello-world/jest.config.js` (test config)
- [ ] `examples/hello-world/jest.setup.js` (test setup)
- [ ] `examples/hello-world/.eslintrc.json` (linting config)

**If ANY file is missing, STOP and tell the user Genesis is incomplete.**

---

## Step 1: Read Mandatory Files ✅

- [ ] Read `templates/CLAUDE.md.template` completely
- [ ] Read `05-QUALITY-STANDARDS.md` completely
- [ ] Read `examples/hello-world/README.md` completely
- [ ] Understand: ALWAYS lint, ALWAYS test, ALWAYS communicate what's left
- [ ] Understand: NEVER include node_modules/, coverage/, dist/, build/
- [ ] Understand: NEVER use hyperbolic language

---

## Step 2: Gather Requirements ✅

**Ask ONLY these essential questions** (after studying reference implementation):

- [ ] Asked user for project name
- [ ] Asked user for project title
- [ ] Asked user for one-line description
- [ ] Asked user for GitHub username
- [ ] Asked user for GitHub repo name
- [ ] Asked user for document type (e.g., "One-Pager", "PRD", "Design Doc")
- [ ] Asked user for link to document template or example (if available)
- [ ] Asked user if they want deviations from standard 3-phase workflow (default: NO)
- [ ] Stored all answers as variables for template replacement

**Did NOT ask** (inferred from reference implementation):
- [ ] Did NOT ask "How many phases?" (Default: 3)
- [ ] Did NOT ask "Should prompts be in files?" (YES - always in `prompts/`)
- [ ] Did NOT ask "Should templates be abstracted?" (YES - always in `templates/`)
- [ ] Did NOT ask "How should mock mode work?" (See product-requirements-assistant)
- [ ] Did NOT ask "Should Phase 1 have a form?" (YES - if structured doc)
- [ ] Did NOT ask "How should validation work?" (See defensive coding patterns)

---

## Step 3: Copy and Customize Templates ✅

### 3.1 Core Files
- [ ] Copied `.gitignore` from `templates/project-structure/gitignore-template`
- [ ] Copied `CLAUDE.md` from `templates/CLAUDE.md.template`
- [ ] Replaced `{{PROJECT_NAME}}` in CLAUDE.md
- [ ] Copied `README.md` from `templates/project-structure/README-template.md`
- [ ] Replaced ALL `{{VARIABLES}}` in README.md
- [ ] Copied `package.json` from `examples/hello-world/package.json`
- [ ] Updated package.json: name, description, repository fields

### 3.2 Web App Files
- [ ] Copied `index.html` from `examples/hello-world/index.html`
- [ ] Customized index.html: title, phases, branding
- [ ] Created `js/` directory
- [ ] Copied all 4 JS files from `examples/hello-world/js/`
- [ ] Customized `js/workflow.js` with actual phases
- [ ] Created `css/` directory
- [ ] Copied `css/styles.css` from `examples/hello-world/css/`
- [ ] Created `tests/` directory
- [ ] Copied all 3 test files from `examples/hello-world/tests/`
- [ ] Updated tests to match your workflow
- [ ] Copied `jest.config.js`
- [ ] Copied `jest.setup.js`
- [ ] Copied `.eslintrc.json`

### 3.3 Variable Replacement
- [ ] Replaced `{{PROJECT_NAME}}` everywhere
- [ ] Replaced `{{PROJECT_TITLE}}` everywhere
- [ ] Replaced `{{PROJECT_DESCRIPTION}}` everywhere
- [ ] Replaced `{{GITHUB_USER}}` everywhere
- [ ] Replaced `{{GITHUB_REPO}}` everywhere
- [ ] Replaced `{{PHASE_COUNT}}` everywhere
- [ ] Replaced `{{PHASE_1_NAME}}`, `{{PHASE_1_AI}}`, etc.

---

## Step 4: Install and Test ✅

- [ ] Ran `npm install`
- [ ] Ran `npm run lint`
- [ ] Fixed any linting errors (or ran `npm run lint:fix`)
- [ ] Verified 0 linting errors
- [ ] Ran `NODE_OPTIONS=--experimental-vm-modules npm test`
- [ ] Verified ALL tests passing
- [ ] Ran `NODE_OPTIONS=--experimental-vm-modules npm run test:coverage`
- [ ] Verified coverage ≥70% (or ≥85% for production)
- [ ] Fixed any failing tests BEFORE proceeding

---

## Step 5: Set Up GitHub ✅

- [ ] Ran `git init` (if needed)
- [ ] Ran `git add .`
- [ ] Ran `git commit -m "Initial commit from Genesis template"`
- [ ] User created GitHub repo (or used `gh repo create`)
- [ ] Ran `git remote add origin git@github.com:USER/REPO.git`
- [ ] Ran `git branch -M main`
- [ ] Ran `git push -u origin main`
- [ ] Verified push succeeded

---

## Step 6: Enable GitHub Pages ✅

- [ ] Told user to go to repo settings → Pages
- [ ] Told user to select: Source = Deploy from branch
- [ ] Told user to select: Branch = main, Folder = / (root)
- [ ] Told user to click Save
- [ ] Told user to wait 1-2 minutes
- [ ] Told user the URL: `https://USER.github.io/REPO/`

---

## Step 7: Delete Genesis ✅

- [ ] Ran `rm -rf genesis/`
- [ ] Ran `git add .`
- [ ] Ran `git commit -m "Remove genesis template directory"`
- [ ] Ran `git push`
- [ ] Verified genesis/ is gone from repo

---

## Step 8: Final Verification ✅

- [ ] App works at `https://USER.github.io/REPO/`
- [ ] All tests passing (`npm test`)
- [ ] Linting clean (`npm run lint`)
- [ ] Coverage ≥70% (`npm run test:coverage`)
- [ ] No `node_modules/` in git (`git ls-files | grep node_modules` returns nothing)
- [ ] No `coverage/` in git (`git ls-files | grep coverage` returns nothing)
- [ ] `genesis/` directory deleted and removed from git

---

## Step 9: Tell User ✅

- [ ] Told user: "✅ Completed: [specific actions]"
- [ ] Told user: "✅ Quality Checks: [linting, tests, coverage results]"
- [ ] Told user: "✅ Deployed: [GitHub Pages URL]"
- [ ] Told user: "✅ What's Left: NOTHING - Ready to start coding!"
- [ ] Did NOT use hyperbolic language
- [ ] Was specific with numbers (X/X tests, Y% coverage)

---

## Final Self-Check

- [ ] I read START-HERE.md completely before starting
- [ ] I followed ALL steps in order
- [ ] I did NOT skip linting or testing
- [ ] I did NOT include build artifacts
- [ ] I proactively communicated what's left
- [ ] I can confidently say: "Ready to start coding"

**If ALL boxes are checked, you successfully executed Genesis. Well done!**

