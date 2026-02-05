# Genesis AI Instructions: Success Criteria & References

> Part of [AI Instructions](../01-AI-INSTRUCTIONS.md)

---

## 🎯 Your Mission

You are an AI assistant helping create **paired assistant+validator** projects from Genesis templates. Each project includes:
- **Assistant** - 3-phase AI workflow for document creation
- **Validator** - Quality scoring for completed documents

**Success Criteria**: Create a fully working paired project with GitHub Pages deployment in <2 hours.

---

## 🚀 Step-by-Step Process

> **⚠️ IMPORTANT:** The step-by-step process has been modularized into smaller files.
>
> **Start here:** [`START-HERE.md`](../START-HERE.md)
>
> The orchestrator guides you through 6 step files in `steps/`:
> - `00-prerequisites.md` - Understand workflow and architecture
> - `01-requirements.md` - Gather template variables
> - `02-domain-research.md` - Research document type
> - `03-copy-templates.md` - Copy from hello-world
> - `04-install-test.md` - Install, test, lint
> - `05-deploy.md` - Deploy to GitHub Pages

---

## ✅ Success Criteria

Project is complete when:
1. ✅ All files created from templates
2. ✅ All variables replaced
3. ✅ Git repository initialized
4. ✅ GitHub repository created and pushed
5. ✅ GitHub Pages deployed and accessible
6. ✅ CI/CD pipeline passing
7. ✅ Web app fully functional
8. ✅ All validation checks pass
9. ✅ Code coverage ≥ 85% (if applicable)
10. ✅ All hyperlinks validated
11. ✅ Professional documentation standards met
12. ✅ AI mock mode implemented (if using external LLMs)
13. ✅ **Shell scripts follow standards** (timer, help, verbose mode)
14. ✅ **`scripts/setup-macos.sh` created and tested**
15. ✅ **`scripts/deploy-web.sh` created and tested** (for web apps)
16. ✅ **All scripts pass shellcheck with zero warnings**

---

## 📚 Reference Documents

**⭐ PRIMARY WORKING EXAMPLE** (study this first):
- **[one-pager](https://github.com/bordenet/one-pager)** - Complete Genesis-generated project

Read these before starting:
1. **`CODE-CONSISTENCY-MANDATE.md`** - **MANDATORY** - Deviation from hello-world is FORBIDDEN
2. `docs/historical/00-GENESIS-PLAN.md` - Historical planning document (optional)
3. `05-QUALITY-STANDARDS.md` - Professional quality standards (MANDATORY)
4. `templates/docs/SHELL_SCRIPT_STANDARDS-template.md` - Shell script standards (MANDATORY)
5. `integration/DEVELOPMENT_PROTOCOLS.md` - AI development protocols
6. `integration/PROJECT_SETUP_CHECKLIST.md` - Detailed setup steps
7. `docs/UX-PATTERNS.md` - 12 critical UX patterns for workflow apps

**Shell Script References**:
- ⭐ **[product-requirements-assistant/scripts/](https://github.com/bordenet/product-requirements-assistant/tree/main/scripts)** - PRIMARY REFERENCE
  - [deploy-web.sh](https://github.com/bordenet/product-requirements-assistant/blob/main/scripts/deploy-web.sh)
  - [setup-macos.sh](https://github.com/bordenet/product-requirements-assistant/blob/main/scripts/setup-macos.sh)
  - [setup-linux.sh](https://github.com/bordenet/product-requirements-assistant/blob/main/scripts/setup-linux.sh)
- [bu.sh](https://github.com/bordenet/scripts/blob/main/bu.sh) - Reference implementation

---

## 🆘 Troubleshooting

**Problem**: Template variables not replaced  
**Solution**: Search for `{{` in all files, replace manually

**Problem**: GitHub Pages shows 404  
**Solution**: Check Settings → Pages, verify source is correct

**Problem**: CI pipeline fails  
**Solution**: Check `.github/workflows/` files, verify syntax

**Problem**: Web app blank page  
**Solution**: Check browser console, verify all JS files loaded

---

**Ready to begin? Start with [`START-HERE.md`](../START-HERE.md)!** 🚀

