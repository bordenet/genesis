# Project Setup: Phase 2 - Pre-Commit Hooks

> Part of [Project Setup Checklist](../PROJECT_SETUP_CHECKLIST.md)

**Time Estimate**: 30 minutes

---

## 2.1 Install Husky

```bash
npm init -y  # If no package.json exists
npm install --save-dev husky
npx husky install
npm pkg set scripts.prepare="husky install"
```

---

## 2.2 Create Basic Pre-Commit Hook

```bash
# .husky/pre-commit
#!/usr/bin/env bash
echo "🔍 Running pre-commit checks..."
npm test
```

```bash
chmod +x .husky/pre-commit
```

---

## 2.3 Create Binary Detection Hook

```bash
# .husky/check-binaries
#!/usr/bin/env bash
# Copy from starter-kit/check-binaries-template
```

```bash
chmod +x .husky/check-binaries
```

---

## 2.4 Update Pre-Commit to Include Binary Check

```bash
# .husky/pre-commit
#!/usr/bin/env bash
./.husky/check-binaries
npm test
```

---

## 2.5 Test Hooks

```bash
# Test binary detection
touch test-binary
chmod +x test-binary
git add test-binary
git commit -m "Test binary detection"  # Should fail

# Clean up
rm test-binary

# Test normal commit
echo "test" > test.txt
git add test.txt
git commit -m "Test commit"  # Should pass
```

---

## Checklist

- [ ] Husky installed
- [ ] `.husky/pre-commit` created
- [ ] `.husky/check-binaries` created
- [ ] Hooks tested and working
- [ ] Both `.husky/pre-commit` and `.husky/check-binaries` executable

