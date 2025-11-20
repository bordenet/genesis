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

Ask the user these questions:

```
1. Project name? (e.g., "coe-generator")
2. Project title? (e.g., "Correction of Error Generator")
3. One-line description?
4. GitHub username?
5. GitHub repo name?
6. How many workflow phases? (e.g., 2 or 3)
7. For each phase:
   - Phase name? (e.g., "Initial Draft")
   - AI model? (e.g., "Claude Sonnet 4.5")
   - Purpose? (e.g., "Generate first draft")
```

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

# Copy package.json
cp genesis/examples/hello-world/package.json .
# Update name, description, repository fields
```

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

### 3.3 Replace Template Variables

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

## Step 7: Delete Genesis (1 minute)

```bash
# Remove genesis directory
rm -rf genesis/

# Commit
git add .
git commit -m "Remove genesis template directory"
git push
```

---

## Step 8: Final Verification (2 minutes)

Verify:
- ✅ App works at `https://{{GITHUB_USER}}.github.io/{{GITHUB_REPO}}/`
- ✅ All tests passing (`npm test`)
- ✅ Linting clean (`npm run lint`)
- ✅ Coverage ≥70% (`npm run test:coverage`)
- ✅ No `node_modules/` or `coverage/` in git
- ✅ `genesis/` directory deleted

---

## Step 9: Tell User

```
✅ Completed:
- Created {{PROJECT_TITLE}} from Genesis template
- Linting: PASSED (0 errors)
- Tests: PASSED (X/X tests)
- Coverage: X% (exceeds threshold)
- Deployed: https://{{GITHUB_USER}}.github.io/{{GITHUB_REPO}}/
- Genesis directory: DELETED

✅ What's Left:
- NOTHING - Ready to start coding!
- You can now customize the app for your specific use case
- All quality infrastructure is in place (tests, linting, CI/CD)
```

---

**That's it!** You've successfully bootstrapped a new project from Genesis. The user can now start coding with full confidence that quality standards are enforced.

