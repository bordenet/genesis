# Step 4: Install & Test

> **For Claude:** Install dependencies, run tests, verify coverage.
> **Time Budget:** 10 minutes
> **Exit Criteria:** All tests pass, lint clean, coverage ≥70%.

---

## Entry Conditions

- [ ] Completed [Step 3: Copy Templates](03-copy-templates.md)
- [ ] Diff tool shows 0 divergent MUST_MATCH files
- [ ] All template variables replaced

---

## 4.1 Install Dependencies

```bash
# Install npm dependencies
npm install

# Install Git hooks (quality gates)
./scripts/install-hooks.sh
# This installs pre-commit hooks that run linting before every commit
```

---

## 4.2 Run Linting

```bash
# Run ESLint
npm run lint

# If errors, fix them:
npm run lint:fix

# Then run again to verify clean:
npm run lint
```

**Expected Output:**
```
✔ No problems found
```

---

## 4.3 Run Tests

```bash
# Run all tests
npm test

# Or with experimental modules (if needed):
NODE_OPTIONS=--experimental-vm-modules npm test
```

**Expected Output:**
```
Test Suites: X passed, X total
Tests:       X passed, X total
```

**⚠️ If tests fail:** Fix them BEFORE proceeding. Do NOT skip this step.

---

## 4.4 Check Coverage

```bash
# Run tests with coverage
npm run test:coverage
# Or:
NODE_OPTIONS=--experimental-vm-modules npm run test:coverage
```

**Minimum Requirements:**
- ≥70% for initial projects
- ≥85% for production apps

---

## 4.5 Run Diff Tool Again (MANDATORY)

```bash
cd genesis/project-diff
node diff-projects.js --ci
```

**Expected:** `✓ ALL MUST-MATCH FILES ARE IDENTICAL`

---

## ⛔ Exit Criteria (ALL MUST PASS)

```bash
# 1. Lint passes
npm run lint && echo "✅ Lint clean" || echo "❌ BLOCKED: Fix lint errors"

# 2. Tests pass
npm test && echo "✅ Tests pass" || echo "❌ BLOCKED: Fix failing tests"

# 3. Coverage check (manual verification)
npm run test:coverage
# Verify: All files ≥70%

# 4. Diff tool passes
cd genesis/project-diff && node diff-projects.js --ci
# MUST show: ✓ ALL MUST-MATCH FILES ARE IDENTICAL
```

### Verification Checklist

- [ ] `npm install` completed without errors
- [ ] Git hooks installed (`./scripts/install-hooks.sh`)
- [ ] Lint passes with 0 errors
- [ ] All tests pass
- [ ] Coverage ≥70%
- [ ] Diff tool shows 0 divergence

---

## 🚫 DO NOT PROCEED if:

- Lint has errors
- Any tests fail
- Coverage below 70%
- Diff tool shows divergent files

---

## Common Issues

### "Cannot find module" Errors
- Run `npm install` again
- Check that `js/core/` directory exists

### Jest ESM Issues
```bash
# Use experimental modules flag:
NODE_OPTIONS=--experimental-vm-modules npm test
```

### Pre-commit Hook Failures
- Fix lint errors before committing
- Run `npm run lint:fix`

---

**Next Step:** [Step 5: Deploy →](05-deploy.md)

