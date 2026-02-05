# Genesis Troubleshooting Guide

> **Version:** 2.0 (Modular)
> **Last Updated:** 2026-02-05

Common issues when creating projects from Genesis templates and how to fix them.

---

## Quick Validation

Run these scripts to validate your generated project:

```bash
# Check for unreplaced template placeholders
./genesis/scripts/validate-template-placeholders.sh .

# Comprehensive test suite
./genesis/scripts/test-generated-project.sh .
```

---

## Troubleshooting Sections

This guide has been modularized into smaller files for easier navigation:

| Section | File | Topics |
|---------|------|--------|
| **Critical Issues** | [`troubleshooting/00-critical-issues.md`](troubleshooting/00-critical-issues.md) | 7 reverse-integration findings (all FIXED) |
| **Module Errors** | [`troubleshooting/01-module-errors.md`](troubleshooting/01-module-errors.md) | `require is not defined`, `process is not defined`, ES6 module issues |
| **Config & Setup** | [`troubleshooting/02-config-setup.md`](troubleshooting/02-config-setup.md) | Template variables, badges, GitHub Actions, npm install |
| **Linting & Testing** | [`troubleshooting/03-testing.md`](troubleshooting/03-testing.md) | ESLint errors, test failures, coverage issues |
| **Deployment & UI** | [`troubleshooting/04-deployment-ui.md`](troubleshooting/04-deployment-ui.md) | Dark mode, 404 errors, missing files, event listeners |

---

## Common Symptoms Quick Reference

| Symptom | Likely Cause | Section |
|---------|--------------|---------|
| `require is not defined` | CommonJS in browser | [01-module-errors](troubleshooting/01-module-errors.md) |
| `process is not defined` | Node.js globals in browser | [01-module-errors](troubleshooting/01-module-errors.md) |
| `{{VARIABLE}}` in output | Unreplaced template vars | [02-config-setup](troubleshooting/02-config-setup.md) |
| Badges show "Unknown" | Badge URLs not updated | [02-config-setup](troubleshooting/02-config-setup.md) |
| GitHub Actions fails | Workflow YAML issues | [02-config-setup](troubleshooting/02-config-setup.md) |
| `npm install` fails | Package.json issues | [02-config-setup](troubleshooting/02-config-setup.md) |
| Linting errors | ESLint config issues | [03-testing](troubleshooting/03-testing.md) |
| Tests fail | Jest config or test issues | [03-testing](troubleshooting/03-testing.md) |
| Dark mode broken | Tailwind config | [04-deployment-ui](troubleshooting/04-deployment-ui.md) |
| GitHub Pages 404 | Pages not enabled | [04-deployment-ui](troubleshooting/04-deployment-ui.md) |
| Buttons don't work | Missing event listeners | [04-deployment-ui](troubleshooting/04-deployment-ui.md) |

---

## Still Having Issues?

1. **Search existing issues**: Check the [GitHub Issues](https://github.com/bordenet/genesis/issues)
2. **Check CI logs**: Review GitHub Actions output for specific errors
3. **Run validation scripts**: The scripts above catch most common issues
4. **Ask for help**: Open a new issue with:
   - Error message (full text)
   - Steps to reproduce
   - Environment (OS, Node version)

---

## Related Documentation

- [`01-AI-INSTRUCTIONS.md`](01-AI-INSTRUCTIONS.md) - Module system validation
- [`05-QUALITY-STANDARDS.md`](05-QUALITY-STANDARDS.md) - Testing requirements
- [`CODE-CONSISTENCY-MANDATE.md`](CODE-CONSISTENCY-MANDATE.md) - Project alignment

