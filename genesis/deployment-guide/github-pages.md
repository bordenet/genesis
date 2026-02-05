# Genesis Deployment: GitHub Pages

> Part of [Deployment Guide](../04-DEPLOYMENT-GUIDE.md)

---

## Prerequisites

- GitHub account
- Git installed locally
- Project created from Genesis templates

---

## Steps

### 1. Create GitHub Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: {{PROJECT_TITLE}}"

# Create GitHub repo (using GitHub CLI)
gh repo create {{GITHUB_REPO}} --public --source=. --remote=origin --push

# OR manually:
# 1. Go to https://github.com/new
# 2. Create repository named {{GITHUB_REPO}}
# 3. Follow instructions to push existing repository
```

### 2. Enable GitHub Pages

**Option A: Using GitHub CLI**
```bash
gh api repos/{{GITHUB_USER}}/{{GITHUB_REPO}}/pages \
  -X POST \
  -f source[branch]=main \
  -f source[path]=/{{DEPLOY_FOLDER}}
```

**Option B: Using GitHub Web UI**
1. Go to repository Settings
2. Scroll to "Pages" section
3. Under "Source", select:
   - Branch: `main`
   - Folder: `/{{DEPLOY_FOLDER}}`
4. Click "Save"

### 3. Wait for Deployment

```bash
# Check deployment status
gh run list --limit 1

# View deployment
gh run view --log
```

Your site will be live at: **{{GITHUB_PAGES_URL}}**

