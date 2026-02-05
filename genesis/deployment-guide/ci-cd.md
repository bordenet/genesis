# Genesis Deployment: CI/CD Setup

> Part of [Deployment Guide](../04-DEPLOYMENT-GUIDE.md)

---

## GitHub Actions (Automatic Deployment)

The Genesis templates include a GitHub Actions workflow that automatically deploys to GitHub Pages on every push to `main`.

**File**: `.github/workflows/deploy-web.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '{{DEPLOY_FOLDER}}'
      
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

**Enable workflow**:
```bash
# Workflow is automatically enabled when you push to GitHub
git push origin main

# Manually trigger workflow
gh workflow run deploy-web.yml
```

---

## Custom Domain (Optional)

### Setup Custom Domain

1. **Add CNAME file**:
   ```bash
   echo "{{CUSTOM_DOMAIN}}" > {{DEPLOY_FOLDER}}/CNAME
   git add {{DEPLOY_FOLDER}}/CNAME
   git commit -m "Add custom domain"
   git push
   ```

2. **Configure DNS**:
   - Add CNAME record: `www` → `{{GITHUB_USER}}.github.io`
   - Add A records for apex domain:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```

3. **Enable HTTPS**:
   - Go to repository Settings → Pages
   - Check "Enforce HTTPS"

