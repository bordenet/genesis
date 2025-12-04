# Genesis Integration Tests

This directory contains integration and end-to-end tests for the Genesis template system, complementing the existing unit tests in `genesis/examples/hello-world/tests/`.

## Test Categories

- **template-system/**: Template validation, variable replacement, content consistency
- **bootstrap/**: End-to-end project creation workflows (planned)
- **scripts/**: Shell script validation and edge cases
- **integration/**: Cross-component integration tests

## Running Tests

### First Time Setup

```bash
# Install dependencies
npm install

# Build Go validator binary (required for integration tests)
cd ../genesis-validator
make build
cd ../tests
```

### Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Lint test code
npm run lint
```

### Run Shell Script Tests

```bash
# Shell tests must be run separately
bash scripts/validate-docs.test.sh
```

## Test Status

**Implemented:** 10+ test cases
**Passing:** All (after bug fixes)
**Coverage:** See TEST_PLAN.md for detailed breakdown

## Coverage Goals

- Statement: 70%+
- Branch: 70%+
- Function: 70%+
- Line: 70%+

## Adding New Tests

1. Create test file in appropriate category directory
2. Follow naming convention: `*.test.js` for JavaScript, `*.test.sh` for shell
3. Use descriptive test names matching TEST_PLAN.md format (e.g., `TS-001`, `BW-002`)
4. Import path utilities for proper path resolution:

```javascript
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPO_ROOT = join(__dirname, '..', '..');
```

5. Run tests and ensure they pass before committing

## Test Plan

See [TEST_PLAN.md](../TEST_PLAN.md) in the repository root for comprehensive test coverage plan.

## Bugs and Issues

See [TEST_BUGS_REVEALED.md](../TEST_BUGS_REVEALED.md) for discovered defects and remediation status.

## CI Integration

These tests are integrated into the GitHub Actions CI pipeline:

1. JavaScript/Go validator tests compile the validator binary
2. Integration tests run with proper path resolution
3. All quality gates must pass before merge

## Contributing

When adding tests:

- Follow existing patterns in template-system/ directory
- Add test IDs matching TEST_PLAN.md (e.g., TS-001, GV-003)
- Document expected behavior and root causes for failures
- Ensure tests are idempotent and clean up after themselves
