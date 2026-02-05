# Project Setup: Phase 5 - CI/CD Integration

> Part of [Project Setup Checklist](../PROJECT_SETUP_CHECKLIST.md)

**Time Estimate**: 30 minutes

---

## 5.1 Create GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup environment
      run: ./scripts/setup-ubuntu.sh --yes

    - name: Run validation
      run: ./validate-monorepo.sh --all

    - name: Security scan
      run: npm audit --audit-level=high
```

---

## 5.2 Test CI Pipeline

```bash
# Create test PR
git checkout -b test-ci
git push origin test-ci

# Check GitHub Actions tab for results
```

---

## Checklist

- [ ] `.github/workflows/ci.yml` created
- [ ] CI runs validation on push
- [ ] CI runs on pull requests
- [ ] CI tested with real PR
- [ ] CI status badge added to README

