# Project Setup: Maintenance & Troubleshooting

> Part of [Project Setup Checklist](../PROJECT_SETUP_CHECKLIST.md)

---

## Maintenance Schedule

### Daily
- Pre-commit hooks run automatically

### Weekly
- [ ] Run `./validate-monorepo.sh --all`
- [ ] Review pre-commit hook execution times

### Monthly
- [ ] Update dependencies in `setup-<platform>.sh`
- [ ] Review `.gitignore` for new artifact patterns
- [ ] Audit `.env.example` for completeness

### Quarterly
- [ ] Test `setup-<platform>.sh` on fresh VM
- [ ] Review security scanning tools
- [ ] Audit pre-commit hooks effectiveness

---

## Customization Guide

**For your specific project, customize**:

1. **Languages/Frameworks**
   - Add language-specific linting (ESLint, golangci-lint, etc.)
   - Add framework-specific builds (Flutter, React, etc.)

2. **Cloud Provider**
   - AWS-specific validation (CDK synth, etc.)
   - GCP-specific validation (gcloud, etc.)

3. **Deployment**
   - Add deployment validation
   - Add environment-specific checks

4. **Testing**
   - Add E2E tests
   - Add integration tests
   - Add performance tests

---

## Troubleshooting

### Setup script fails

- Check internet connection
- Verify admin/sudo access
- Review error messages in logs
- Try running setup components individually

### Pre-commit hooks not running

```bash
# Reinstall Husky
rm -rf .husky
npm run prepare
```

### Validation fails unexpectedly

```bash
# Run validation with debug output
DEBUG=1 ./validate-monorepo.sh --p1

# Check individual validations
./validate-monorepo.sh --help
```

