# Test Bugs Revealed: Critical Defects (P0)

> Part of [TEST_BUGS_REVEALED.md](../TEST_BUGS_REVEALED.md)

---

## BUG-001: Incorrect Path Resolution in Test Suite
**Severity:** P0 (Critical)
**Component:** tests/template-system/*.test.js
**Status:** Confirmed

**Description:**
Test files are looking for templates in `/Users/matt/GitHub/Personal/genesis/tests/genesis/templates/` but the actual templates are in `/Users/matt/GitHub/Personal/genesis/genesis/templates/`.

**Impact:**
- All template-based tests fail immediately
- 33 test cases failing due to missing files
- Cannot validate template completeness or content

**Root Cause:**
Tests use `process.cwd()` which resolves to `/Users/matt/GitHub/Personal/genesis/tests` (the test directory) instead of the repository root.

**Evidence:**
```
console.warn
  Template file not found: /Users/matt/GitHub/Personal/genesis/tests/genesis/templates/web-app/index-template.html
```

**Expected Behavior:**
Tests should resolve paths relative to repository root, not test directory.

**Proposed Fix:**
```javascript
// Current (WRONG):
const TEMPLATE_DIR = join(process.cwd(), 'genesis', 'templates');

// Fixed (CORRECT):
const REPO_ROOT = join(process.cwd(), '..');
const TEMPLATE_DIR = join(REPO_ROOT, 'genesis', 'templates');

// Or better:
const TEMPLATE_DIR = join(__dirname, '..', '..', 'genesis', 'templates');
```

**Files Affected:**
- `tests/template-system/variable-replacement.test.js`
- `tests/template-system/file-completeness.test.js`
- `tests/template-system/content-consistency.test.js`
- `tests/integration/validator-integration.test.js`

---

## BUG-002: Missing Go Validator Binary
**Severity:** P0 (Critical)
**Component:** genesis-validator
**Status:** Confirmed

**Description:**
Test suite expects compiled Go validator binary at `genesis-validator/bin/genesis-validator` but it doesn't exist in the repository.

**Impact:**
- 21+ validator integration tests skipped
- Cannot test validator correctness
- Cannot verify template validation workflow

**Root Cause:**
Binary is not committed to repository (correctly excluded by .gitignore) and tests don't compile it automatically.

**Proposed Fix:**
Add pre-test compilation step:
```javascript
beforeAll(async () => {
    if (!existsSync(VALIDATOR_BIN)) {
        console.log('Compiling validator binary...');
        await execAsync('cd ../genesis-validator && make build');
    }
}, 30000);
```

Or update CI/CD:
```yaml
- name: Build Go Validator
  run: cd genesis-validator && make build

- name: Run Integration Tests
  run: cd tests && npm test
```

**Files Affected:**
- `tests/integration/validator-integration.test.js`
- `.github/workflows/ci.yml` (needs update)

---

## BUG-003: Jest Configuration Typo
**Severity:** P0 (Critical)
**Component:** tests/jest.config.js
**Status:** Confirmed

**Description:**
Jest configuration uses `coverageThresholds` (plural) instead of `coverageThreshold` (singular).

**Impact:**
- Coverage thresholds not enforced
- Tests may pass with insufficient coverage
- Configuration validation warnings on every test run

**Evidence:**
```
● Validation Warning:
  Unknown option "coverageThresholds" with value {"global": {"branches": 70, ...}} was found.
  Did you mean "coverageThreshold"?
```

**Proposed Fix:**
```javascript
// BEFORE:
coverageThresholds: {  // ❌ WRONG
    global: { branches: 70, functions: 70, lines: 70, statements: 70 }
},

// AFTER:
coverageThreshold: {  // ✅ CORRECT
    global: { branches: 70, functions: 70, lines: 70, statements: 70 }
},
```

**Files Affected:**
- `tests/jest.config.js`

