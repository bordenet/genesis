# Step 5: Deploy

> **For Claude:** Set up GitHub, enable Pages, verify deployment, delete genesis.
> **Time Budget:** 10-15 minutes
> **Exit Criteria:** App live on GitHub Pages, genesis/ deleted, all tests passing.

---

## Entry Conditions

- [ ] Completed [Step 4: Install & Test](04-install-test.md)
- [ ] All tests pass
- [ ] Lint clean
- [ ] Coverage ≥70%

---

## 5.1 Configure Git Identity (MANDATORY)

**⚠️ BEFORE making any commits, verify git identity:**

```bash
# Check current identity
git config user.name
git config user.email

# If wrong or using personal email, configure for GitHub:
git config user.name "Your Name"
git config user.email "username@users.noreply.github.com"

# Verify the change took effect
git config user.name && git config user.email
```

**Why this matters:**
- Wrong identity requires history rewriting later (painful)
- GitHub noreply email protects your personal email
- CI/CD checks may fail with unauthorized email addresses

---

## 5.2 Initialize Git & Create Repo

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit from Genesis template"

# Create GitHub repo (tell user to do this, or use gh CLI):
gh repo create {{GITHUB_REPO}} --public --source=. --push

# Or manually:
# 1. Create repo on GitHub
# 2. Then:
git remote add origin git@github.com:{{GITHUB_USER}}/{{GITHUB_REPO}}.git
git branch -M main
git push -u origin main
```

---

## 5.3 Enable GitHub Pages

Tell the user:

```
1. Go to: https://github.com/{{GITHUB_USER}}/{{GITHUB_REPO}}/settings/pages

2. Source: "GitHub Actions"
   (This allows the CI/CD workflow to deploy automatically)

3. Click "Save"

4. Wait 1-2 minutes for first deployment

5. Visit: https://{{GITHUB_USER}}.github.io/{{GITHUB_REPO}}/
```

---

## 5.4 Verify Deployment

```bash
# Test deployment script
./scripts/deploy-web.sh --help
# Verify help displays correctly

# Check GitHub Pages status
gh api /repos/{{GITHUB_USER}}/{{GITHUB_REPO}}/pages --jq '.status'
# Expected: "built"
```

---

## 5.5 Delete Genesis Directory

```bash
# Remove genesis directory
rm -rf genesis/

# Commit
git add .
git commit -m "Remove genesis template directory"
git push
```

---

## 5.6 Final Verification

Run these checks:

```bash
# 1. Verify genesis/ deleted
ls genesis/ 2>/dev/null && echo "❌ FAIL: genesis/ still exists!" || echo "✅ genesis/ deleted"

# 2. Verify no unreplaced variables
grep -r "{{" . --include="*.md" --include="*.js" --include="*.json" --include="*.html" \
  --exclude-dir=node_modules 2>/dev/null && \
  echo "❌ FAIL: Unreplaced variables!" || echo "✅ Variables replaced"

# 3. Verify tests still pass
npm test && echo "✅ Tests pass" || echo "❌ Tests failing"

# 4. Verify lint clean
npm run lint && echo "✅ Lint clean" || echo "❌ Lint errors"

# 5. Verify app accessible
curl -s -o /dev/null -w "%{http_code}" https://{{GITHUB_USER}}.github.io/{{GITHUB_REPO}}/
# Expected: 200
```

---

## ⛔ Exit Criteria (ALL MUST PASS)

```bash
# All of these must show ✅:
[ ! -d "genesis" ] && echo "✅ genesis/ deleted" || echo "❌ BLOCKED"
npm test && echo "✅ Tests pass" || echo "❌ BLOCKED"
npm run lint && echo "✅ Lint clean" || echo "❌ BLOCKED"
curl -s -o /dev/null -w "%{http_code}" https://{{GITHUB_USER}}.github.io/{{GITHUB_REPO}}/ | grep -q "200" && echo "✅ App live" || echo "❌ BLOCKED"
```

### Verification Checklist

- [ ] Git repository initialized and pushed
- [ ] GitHub Pages enabled (source: GitHub Actions)
- [ ] App accessible at GitHub Pages URL
- [ ] Genesis directory deleted
- [ ] No unreplaced template variables
- [ ] All tests still pass
- [ ] Lint still clean

---

## 🎉 Completion Message

Tell the user:

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

**🎉 Genesis Complete!**

