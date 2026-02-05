# Test Bugs Revealed: High Priority Defects (P1)

> Part of [TEST_BUGS_REVEALED.md](../TEST_BUGS_REVEALED.md)

---

## BUG-004: Missing ESLint Configuration for Tests
**Severity:** P1 (High)
**Component:** tests/
**Status:** Confirmed

**Description:**
New test directory doesn't have ESLint configuration, so linting cannot be performed.

**Impact:**
- Cannot run `npm run lint` in tests directory
- Code quality not enforced
- May have style violations

**Proposed Fix:**
Create `tests/eslint.config.js`:
```javascript
import js from '@eslint/js';

export default [
    js.configs.recommended,
    {
        rules: {
            'quotes': ['error', 'single'],
            'semi': ['error', 'always']
        },
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: { 'process': 'readonly', 'console': 'readonly', '__dirname': 'readonly' }
        }
    }
];
```

---

## BUG-005: Shell Script Tests Cannot Execute
**Severity:** P1 (High)
**Component:** tests/scripts/validate-docs.test.sh
**Status:** Confirmed

**Description:**
Shell script tests are created but not integrated into Jest test runner, so they don't execute with `npm test`.

**Impact:**
- Shell script validation tests not running
- Documentation hygiene not tested
- Manual test execution required

**Proposed Fix (Option 1):** Add shell test runner script:
```json
"scripts": {
    "test": "npm run test:js && npm run test:sh",
    "test:js": "NODE_OPTIONS=--experimental-vm-modules jest",
    "test:sh": "bash scripts/validate-docs.test.sh"
}
```

**Proposed Fix (Option 2):** Wrap shell tests in JavaScript:
```javascript
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

test('validate-docs script tests pass', async () => {
    const { stdout } = await execAsync('bash ./scripts/validate-docs.test.sh');
    expect(stdout).toContain('Tests passed');
});
```

---

## BUG-006: Test Dependencies Not Documented
**Severity:** P1 (High)
**Component:** tests/package.json, documentation
**Status:** Confirmed

**Description:**
New test infrastructure requires `npm install` in tests/ directory, but this is not documented anywhere.

**Impact:**
- Developers don't know tests require separate npm install
- CI may not run tests correctly
- Build instructions incomplete

**Proposed Fix:** Update README.md and CI configuration with test setup instructions.

---

## BUG-007: Validator Tests Use Wrong Path
**Severity:** P1 (High)
**Component:** tests/integration/validator-integration.test.js
**Status:** Confirmed

**Description:**
Validator integration tests look for binary at `./genesis-validator/bin/` but run from `tests/` directory, so path is incorrect.

**Impact:**
- All validator tests skipped
- Cannot verify validator functionality
- Same root cause as BUG-001

**Proposed Fix:**
```javascript
// BEFORE:
const VALIDATOR_BIN = join(process.cwd(), 'genesis-validator', 'bin', 'genesis-validator');

// AFTER:
const VALIDATOR_BIN = join(__dirname, '..', '..', 'genesis-validator', 'bin', 'genesis-validator');
```

---

## BUG-008: Missing Test README
**Severity:** P1 (High)
**Component:** tests/
**Status:** Confirmed

**Description:**
New tests/ directory has no README explaining what tests do, how to run them, or what they cover.

**Impact:**
- Developers don't understand test structure
- Onboarding friction
- Test maintenance harder

**Expected Behavior:**
tests/README.md should document test categories, execution, and coverage.

