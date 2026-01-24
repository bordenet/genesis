# Genesis Tools Variance Report

**Generated**: 2026-01-24
**Scope**: All 6 genesis-derived tool repositories

This document explains the differences between the 6 genesis-based tools, categorizing each variance as either **intentional** (tool-specific feature) or **bug** (inconsistency that was fixed).

---

## Repository Overview

| Repository | Purpose | Live URL |
|------------|---------|----------|
| architecture-decision-record | Create ADR documents | https://bordenet.github.io/architecture-decision-record/ |
| one-pager | Create product one-pagers | https://bordenet.github.io/one-pager/ |
| pr-faq-assistant | Create PR/FAQ documents | https://bordenet.github.io/pr-faq-assistant/ |
| product-requirements-assistant | Create PRD documents | https://bordenet.github.io/product-requirements-assistant/ |
| power-statement-assistant | Create power statements | https://bordenet.github.io/power-statement-assistant/ |
| strategic-proposal | Create strategic proposals | https://bordenet.github.io/strategic-proposal/ |

---

## ✅ Files Present in ALL 6 Repos (Standard)

These files are required by genesis and present in all repos:

| File | Purpose |
|------|---------|
| `.nojekyll` | Disable Jekyll processing on GitHub Pages |
| `.gitignore` | With "prevent drift" rules for docs/ |
| `CLAUDE.md` | Root-level AI assistant instructions |
| `package.json` | Dependencies and scripts |
| `index.html` | Main application entry |
| `README.md` | Project documentation |
| `eslint.config.js` | Linting configuration |
| `jest.config.js` | Test configuration |
| `jest.setup.js` | Test setup |
| `codecov.yml` | Coverage configuration |
| `LICENSE` | MIT license |
| `CONTRIBUTING.md` | Contribution guidelines |
| `.env.example` | Environment template |
| `docs/CLAUDE.md` | Documentation-level AI instructions |
| `docs/DESIGN-PATTERNS.md` | Architecture patterns |
| `docs/UI_STYLE_GUIDE.md` | UI/UX guidelines |

---

## 🔧 Intentional Variances (Tool-Specific Features)

### 1. JavaScript Files

| File | Present In | Reason |
|------|------------|--------|
| `ai-mock-ui.js` | ADR, power-statement, strategic-proposal | UI for AI mock configuration |
| `keyboard-shortcuts.js` | ADR, strategic-proposal | Keyboard navigation features |
| `phase2-review.js` | ADR, strategic-proposal | Phase 2 review workflow |
| `phase3-synthesis.js` | ADR, strategic-proposal | Phase 3 synthesis workflow |
| `attachments.js` | strategic-proposal only | File attachment support |

**Verdict**: ✅ INTENTIONAL - These are feature-specific modules for tools with more complex workflows.

### 2. Templates Directory

| Repo | Has templates/ | Template File |
|------|----------------|---------------|
| architecture-decision-record | ✅ | `adr-template.md` |
| one-pager | ✅ | `one-pager-template.md` |
| power-statement-assistant | ✅ | `power-statement-template.md` |
| pr-faq-assistant | ❌ | (uses prompts only) |
| product-requirements-assistant | ❌ | (uses prompts only) |
| strategic-proposal | ❌ | (uses prompts only) |

**Verdict**: ✅ INTENTIONAL - Some tools use explicit templates, others generate from prompts.

### 3. Scripts Count

| Repo | Script Count | Notes |
|------|--------------|-------|
| one-pager | 12 | Has Python prompt tuning scripts |
| architecture-decision-record | 8 | Standard + deploy |
| product-requirements-assistant | 8 | Standard + deploy |
| pr-faq-assistant | 7 | Standard |
| power-statement-assistant | 7 | Standard |
| strategic-proposal | 3 | Minimal (newer repo) |

**Verdict**: ✅ INTENTIONAL - one-pager has additional prompt tuning infrastructure.

### 4. Test Count

| Repo | Test Files | Notes |
|------|------------|-------|
| architecture-decision-record | 17 | Most comprehensive |
| strategic-proposal | 15 | Complex workflow |
| pr-faq-assistant | 11 | Standard |
| one-pager | 10 | Standard |
| product-requirements-assistant | 10 | Standard |
| power-statement-assistant | 10 | Standard |

**Verdict**: ✅ INTENTIONAL - Test count varies based on feature complexity.

### 5. GitHub Workflows

| Repo | Workflows | Notes |
|------|-----------|-------|
| architecture-decision-record | `ci.yml`, `deploy.yml` | Has deploy workflow |
| product-requirements-assistant | `ci.yml`, `deploy-web.yml` | Has deploy workflow |
| one-pager | `ci.yml` | CI only |
| pr-faq-assistant | `ci.yml` | CI only |
| power-statement-assistant | `ci.yml` | CI only |
| strategic-proposal | `ci.yml` | CI only |

**Verdict**: ⚠️ REVIEW NEEDED - Only 2 repos have deploy workflows. Consider standardizing.

---

## 🐛 Bugs Fixed (2026-01-24)

| Issue | Repos Affected | Fix Applied |
|-------|----------------|-------------|
| Missing root `CLAUDE.md` | All 6 | Copied from `docs/CLAUDE.md`, fixed link to `./docs/DESIGN-PATTERNS.md` |
| Legacy `docs/` web app files | product-requirements-assistant | Removed 17 tracked files via `git rm` |
| Legacy `docs/` web app files | one-pager | Removed untracked local files |
| Missing `compact.sh` | strategic-proposal | Copied from power-statement-assistant |
| Missing `.env.example` | pr-faq-assistant, power-statement-assistant, strategic-proposal | Created standard template |
| PRD "garbage text" display | product-requirements-assistant | Added `line-clamp-3` to truncate problems field |
| Missing `.nojekyll` | product-requirements-assistant, one-pager | Added (fixed earlier) |
| Inconsistent deployment pattern | product-requirements-assistant | Migrated from docs-serving to root-serving |
| Missing "prevent drift" gitignore | power-statement-assistant, strategic-proposal | Added rules |

---

## 📋 Recommendations

1. **Standardize deploy workflows**: Consider adding `deploy.yml` to all repos or removing from ADR/PRD
2. **Document feature flags**: Create a matrix showing which features each tool supports
3. **Genesis template updates**: Ensure new tools get all standard files automatically

---

## Verification Commands

```bash
# Verify all sites are live
for repo in architecture-decision-record one-pager pr-faq-assistant product-requirements-assistant power-statement-assistant strategic-proposal; do
  curl -s -o /dev/null -w "$repo: %{http_code}\n" "https://bordenet.github.io/$repo/"
done

# Verify root CLAUDE.md exists
for repo in architecture-decision-record one-pager pr-faq-assistant product-requirements-assistant power-statement-assistant strategic-proposal; do
  [ -f "$repo/CLAUDE.md" ] && echo "✅ $repo" || echo "❌ $repo"
done
```

