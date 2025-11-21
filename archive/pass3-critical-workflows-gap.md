# 🔴 CRITICAL: GitHub Workflows and Badges Missing from Genesis

**Date**: 2025-11-21  
**Severity**: 🔴 CRITICAL  
**Impact**: Projects created from Genesis have NO CI/CD, NO badges, NO automated testing

---

## The Problem

**User Report**: "Our first new project built from genesis DID NOT end up getting badges on its README.md page"

**Root Cause Analysis**:

1. ✅ Genesis README-template.md **HAS** badges (lines 3-8):
   - CI/CD badge
   - Codecov badge
   - License badge
   - Release badge

2. ❌ **BUT** START-HERE.md **NEVER TELLS AI TO COPY .github/workflows/**

3. ❌ **RESULT**: Badges reference workflows that don't exist → badges show "unknown" or 404

4. ❌ **VERIFICATION**: one-pager has NO .github/workflows directory at all!

---

## What's Missing

### Files That Exist in Templates

```bash
genesis/templates/github/workflows/ci-template.yml      # ✅ EXISTS
genesis/templates/github/workflows/lint-template.yml    # ✅ EXISTS
```

### What START-HERE.md Should Say (BUT DOESN'T)

```bash
# Copy GitHub Actions workflows
mkdir -p .github/workflows
cp genesis/templates/github/workflows/ci-template.yml .github/workflows/ci.yml
# Replace {{DEPLOY_FOLDER}}, {{ENABLE_TESTS}}, {{ENABLE_CODECOV}}
```

### What's in START-HERE.md Currently

**NOTHING!** The word ".github" appears 0 times in the copy instructions.

---

## Impact Assessment

### 🔴 CRITICAL Impacts

1. **No CI/CD Pipeline**
   - No automated testing on push
   - No automated linting
   - No automated deployment
   - No quality gates

2. **Broken Badges**
   - README shows badges that reference non-existent workflows
   - Badges show "unknown" or 404 errors
   - Looks unprofessional

3. **No Code Coverage**
   - Codecov badge references non-existent workflow
   - No coverage reports uploaded
   - Can't track code quality over time

4. **Manual Deployment Only**
   - Must use scripts/deploy-web.sh manually
   - No automated deployment on merge to main
   - Higher chance of human error

### 🟡 MEDIUM Impacts

5. **Inconsistent with Reference Implementations**
   - product-requirements-assistant has 4 workflows (ci.yml, deploy-web.yml, release.yml, release-windows.yml)
   - one-pager has NO workflows (because Genesis didn't tell AI to copy them!)
   - Genesis promises to match reference implementations but doesn't

6. **No Release Automation**
   - No automated releases
   - No release badges work
   - Manual versioning required

---

## What Needs to Be Fixed

### 1. Update START-HERE.md

Add Step 3.1.5 (after copying core files, before web app files):

```markdown
### 3.1.5 Copy GitHub Actions Workflows

```bash
# Copy GitHub Actions workflows (MANDATORY for CI/CD and badges)
mkdir -p .github/workflows
cp genesis/templates/github/workflows/ci-template.yml .github/workflows/ci.yml

# Replace template variables:
# - {{DEPLOY_FOLDER}} → "." (for root) or "docs" (for docs folder)
# - Remove "# IF {{ENABLE_TESTS}}" sections if you don't have tests yet
# - Remove "# IF {{ENABLE_CODECOV}}" sections if you don't have Codecov token yet

# Optional: Copy lint workflow (if you want separate lint job)
# cp genesis/templates/github/workflows/lint-template.yml .github/workflows/lint.yml
```

**CRITICAL**: The badges in README.md reference these workflows. Without them, badges will show "unknown".
```

### 2. Update AI-EXECUTION-CHECKLIST.md

Add to Step 3.1:

```markdown
- [ ] Created `.github/workflows/` directory
- [ ] Copied `.github/workflows/ci.yml` from `templates/github/workflows/ci-template.yml`
- [ ] Replaced `{{DEPLOY_FOLDER}}` in ci.yml (usually "." or "docs")
- [ ] Removed conditional sections if not using tests/codecov yet
```

### 3. Update Step 3.6 Checklist

Add to "Core Files" section:

```markdown
**GitHub Actions** (MANDATORY - badges reference these):
- [ ] `.github/workflows/ci.yml` (from `github/workflows/ci-template.yml`)
```

### 4. Update README-template.md

Add comment above badges:

```markdown
<!-- IMPORTANT: These badges reference .github/workflows/ci.yml -->
<!-- Make sure you copied the workflow file from genesis/templates/github/workflows/ -->
[![CI/CD](https://github.com/{{GITHUB_USER}}/{{GITHUB_REPO}}/actions/workflows/ci.yml/badge.svg)]...
```

### 5. Consider Additional Workflows

product-requirements-assistant has 4 workflows:
- `ci.yml` - Main CI/CD pipeline ✅ (we have template)
- `deploy-web.yml` - Separate deployment workflow ❌ (missing template)
- `release.yml` - Automated releases ❌ (missing template)
- `release-windows.yml` - Windows-specific releases ❌ (missing template)

**Decision needed**: Should Genesis include templates for all 4, or just ci.yml?

**Recommendation**: Start with ci.yml (covers 80% of use cases), add others later if needed.

---

## Verification

### Before Fix

```bash
ls -la ../one-pager/.github/workflows/
# NO .github/workflows directory!
```

### After Fix (Expected)

```bash
ls -la ../one-pager/.github/workflows/
# Should show:
# ci.yml
```

---

## Priority

**CRITICAL - FIX IMMEDIATELY**

This is a MAJOR gap that affects:
- ✅ Every project created from Genesis
- ✅ Professional appearance (broken badges)
- ✅ Code quality (no CI/CD)
- ✅ Automation (no automated testing/deployment)

---

## Estimated Fix Time

- Update START-HERE.md: 10 minutes
- Update AI-EXECUTION-CHECKLIST.md: 5 minutes
- Update README-template.md: 2 minutes
- Test with one-pager: 15 minutes
- **Total: ~30 minutes**

---

## Next Steps

1. Fix START-HERE.md (add Step 3.1.5)
2. Fix AI-EXECUTION-CHECKLIST.md (add .github/workflows checks)
3. Fix README-template.md (add comment about workflows)
4. Commit and push
5. Test by adding workflows to one-pager manually
6. Verify badges work
7. Document in REVERSE-INTEGRATION-NOTES.md


