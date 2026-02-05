# Code Consistency: Verification Workflow

> Part of [Code Consistency Mandate](../CODE-CONSISTENCY-MANDATE.md)

---

## Before Creating a New Project

1. Pull the latest hello-world: `git pull origin main`
2. Run tests in hello-world: `npm test`
3. Verify hello-world is green

---

## During Development

After every code change:

```bash
# Run the diff tool
cd genesis/project-diff
node diff-projects.js --ci

# If you see divergent files:
# 1. STOP
# 2. Identify which project is the outlier
# 3. Copy the correct version from hello-world (or majority)
# 4. Re-run tests
# 5. Re-run diff tool
```

---

## Before Creating a PR

```bash
# Final verification
cd genesis/project-diff
node diff-projects.js --json > /tmp/diff-report.json

# Check for divergent files
cat /tmp/diff-report.json | jq '.mustMatch.divergent | length'
# Expected: 0

# If not 0, fix before creating PR
```

