# Test Bugs Revealed: Medium & Low Priority Defects (P2-P3)

> Part of [TEST_BUGS_REVEALED.md](../TEST_BUGS_REVEALED.md)

---

## Medium Priority Defects (P2)

### BUG-009: Deprecation Warnings in npm Output
**Severity:** P2 (Medium)
**Component:** tests/package.json dependencies
**Status:** Confirmed

**Description:**
npm install shows deprecation warnings for `inflight` and `glob` packages.

**Impact:**
- Noisy build output
- Future compatibility risk
- Not blocking, but should be addressed

**Evidence:**
```
npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory.
npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
```

**Root Cause:**
Jest or its dependencies use outdated packages.

**Options:**
1. Wait for Jest to update
2. Override with npm resolutions (if possible)
3. Accept warnings as non-critical

---

### BUG-010: Missing .gitignore in tests/
**Severity:** P2 (Medium)
**Component:** tests/
**Status:** Confirmed

**Description:**
tests/ directory has no .gitignore, so node_modules/ and coverage/ could be accidentally committed.

**Impact:**
- Risk of committing large node_modules directory
- Risk of committing test coverage reports
- Repository bloat

**Proposed Fix:**
Create `tests/.gitignore`:
```
# Dependencies
node_modules/
package-lock.json

# Test artifacts
coverage/
*.log
output/

# OS files
.DS_Store
```

---

### BUG-011: Test Output Directory Not Cleaned
**Severity:** P2 (Medium)
**Component:** tests/scripts/validate-docs.test.sh
**Status:** Confirmed

**Description:**
Shell script tests create output/ directory but may not clean it up if tests fail mid-execution.

**Impact:**
- Test artifacts left behind
- Disk space usage
- Confusing for developers

**Proposed Fix:**
Add trap to clean up on exit:
```bash
cleanup() {
    rm -rf "${OUTPUT_DIR}"
}
trap cleanup EXIT INT TERM
```

---

## Low Priority Defects (P3)

### BUG-012: ExperimentalWarning Noise in Test Output
**Severity:** P3 (Low)
**Component:** Jest configuration, Node.js VM modules
**Status:** Confirmed

**Description:**
Tests produce `ExperimentalWarning: VM Modules is an experimental feature` on every run.

**Impact:**
- Noisy test output
- No functional impact
- Cosmetic only

**Evidence:**
```
(node:59853) ExperimentalWarning: VM Modules is an experimental feature and might change at any time
```

**Root Cause:**
Using `NODE_OPTIONS=--experimental-vm-modules` because Jest requires it for ES modules.

**Proposed Fix (Option 1):** Suppress warnings:
```json
"scripts": {
    "test": "NODE_OPTIONS='--experimental-vm-modules --no-warnings' jest"
}
```

**Option 2:** Accept as known limitation until Jest has full ESM support.

