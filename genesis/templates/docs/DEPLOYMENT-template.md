# Deployment Guide

## GitHub Pages Deployment

This project is automatically deployed to GitHub Pages on every push to `main`.

### Live Site

🌐 **URL**: https://{{GITHUB_USER}}.github.io/{{PROJECT_NAME}}/

### Automated Deployment

The GitHub Actions workflow (`.github/workflows/ci.yml`) handles deployment:

1. **Trigger**: Push to `main` branch
2. **Steps**:
   - Install dependencies
   - Run linting
   - Run tests with coverage
   - Deploy to GitHub Pages

### Deployment Status

- **Deployments**: https://github.com/{{GITHUB_USER}}/{{PROJECT_NAME}}/deployments
- **Actions**: https://github.com/{{GITHUB_USER}}/{{PROJECT_NAME}}/actions

### Manual Deployment

```bash
# Ensure you're on main
git checkout main
git pull origin main

# Run quality checks
npm run lint
npm test

# Push to trigger deployment
git push origin main
```

### Local Testing

Test the production build locally:

```bash
npm run serve
# Open http://localhost:8000
```

### Quality Gates

Before deployment, CI verifies:

- ✅ Linting passes (0 errors/warnings)
- ✅ All tests pass
- ✅ Coverage meets thresholds (50%)

### Features Working on GitHub Pages

- ✅ All three workflow phases
- ✅ Project creation and management
- ✅ IndexedDB local storage
- ✅ Dark mode toggle
- ✅ Export to Markdown
- ✅ Responsive design

### Troubleshooting

**Site not updating:**
1. Check GitHub Actions for workflow status
2. Wait 1-2 minutes for GitHub Pages cache
3. Clear browser cache (Ctrl+Shift+Delete)

**IndexedDB issues:**
- Check DevTools → Application → IndexedDB
- Clear site data if needed

---

**Deployment**: Automated via GitHub Actions

