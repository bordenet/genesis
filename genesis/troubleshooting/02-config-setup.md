# Troubleshooting: Configuration & Setup

> **Parent:** [`TROUBLESHOOTING.md`](../TROUBLESHOOTING.md)

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

