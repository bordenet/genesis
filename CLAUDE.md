# CLAUDE.md - AI Agent Instructions for Genesis

This document defines the coding conventions and quality standards that **must** be followed
without exception in this repository. These are derived from the bordenet organization's
style guides and are enforced through automated tooling in CI.

---

## Non-Negotiable Quality Gates

All code changes **MUST** pass before commit/merge:

1. **All tests pass** - No exceptions
2. **Code coverage thresholds met** - See language-specific requirements below
3. **Linting passes** - No warnings or errors
4. **Security scans pass** - No high/critical vulnerabilities
5. **Adversarial Workflow Pattern** - All document-generation apps MUST:
   - Generate prompts for external AI services (NOT auto-generate AI responses)
   - Implement all 7 steps of the workflow pattern (see `docs/ADVERSARIAL-WORKFLOW-PATTERN.md`)
   - Have "Copy Prompt" buttons (NOT "Generate with AI" buttons)
   - Use different AIs for different phases (Claude → Gemini → Claude)
   - Verify with: `./genesis-validator/scripts/validate-adversarial-workflow.sh`

## ⚠️ CRITICAL: Fix ALL Linting Issues Immediately

**MANDATE**: When you detect ANY linting issue in a file you're working with, you MUST fix it immediately - regardless of whether it was pre-existing or newly introduced.

- Do NOT note that issues are "pre-existing" and move on
- Do NOT defer fixing to a later step
- Do NOT push code with known linting issues
- Fix ALL issues in the file before committing

**Rationale**: Linting issues indicate code quality problems. Ignoring them because they existed before your changes still means shipping low-quality code. Every touch point is an opportunity to improve the codebase. Sweeping lint errors "under the rug" causes them to accumulate over time, making each round of changes worse than the last.

## Language-Specific Requirements

### Go (genesis-validator/)

**Style Guide**: See `docs/GO_STYLE_GUIDE.md` for complete reference.

**Automated Checks**:

```bash
# Tests with coverage (≥80% for core logic)
go test -v -race -coverprofile=coverage.out -covermode=atomic ./...

# Linting (all checks must pass)
golangci-lint run ./...
```

**Key Conventions**:

- Package names: lowercase, single word (`scanner`, `validator`, `parser`)
- Exported functions: PascalCase with documentation comment
- Receivers: 1-2 letter abbreviations (`func (v *Validator) Validate()`)
- Error wrapping: Always use `fmt.Errorf("context: %w", err)`
- Function length: ≤50 lines target, 100 max
- Parameters: ≤5, use options struct if more needed

### JavaScript (genesis/examples/hello-world/)

**Automated Checks**:

```bash
# Linting
npm run lint

# Tests with coverage (≥85% statements, ≥80% branches)
npm run test:coverage
```

**Key Conventions**:

- ESM modules (`type: "module"` in package.json)
- Pure functions preferred
- Comprehensive JSDoc for public APIs
- No console.log in production code (use proper logging)

### Python (future additions)

**Style Guide**: See `docs/PYTHON_STYLE_GUIDE.md` for complete reference.

**Automated Checks**:

```bash
# Formatting (auto-fix)
black --line-length=120 src/
isort --profile black --line-length 120 src/

# Linting (≥9.5/10 score required)
pylint src/ --max-line-length=120 --fail-under=9.5

# Type checking
mypy src/ --ignore-missing-imports

# Tests with coverage (≥50%)
pytest tests/ --cov=src --cov-fail-under=50
```

## CI Quality Gates

The CI pipeline in `.github/workflows/ci.yml` enforces:

| Check | Requirement | Blocking |
|-------|-------------|----------|
| JavaScript Lint | All rules pass | Yes |
| JavaScript Tests | All pass + 85% coverage | Yes |
| Go Tests | All pass + coverage uploaded | Yes |
| Security Scan (Trivy) | No high/critical | Yes |
| Codecov Upload | Coverage tracked | Yes |

## Before Every Commit

Run these commands locally to catch issues before CI:

```bash
# Go
cd genesis-validator
make test lint

# JavaScript
cd genesis/examples/hello-world
npm run lint
npm run test:coverage
```

## Code Review Standards

All code must meet these standards before merge:

### Documentation

- [ ] Public functions have docstrings/comments
- [ ] Complex logic has inline comments
- [ ] README updated if behavior changes

### Testing

- [ ] New code has corresponding tests
- [ ] Edge cases are covered
- [ ] Tests are deterministic (no flaky tests)

### Style

- [ ] Follows language-specific style guide
- [ ] No dead code or TODO comments without issues
- [ ] Meaningful variable/function names

### Security

- [ ] No hardcoded secrets
- [ ] Input validation on external data
- [ ] Dependencies are up to date

## Error Handling Patterns

### Go

```go
// Always wrap errors with context
if err != nil {
    return fmt.Errorf("failed to validate %s: %w", path, err)
}
```

### JavaScript

```javascript
// Use try/catch with meaningful error messages
try {
    const result = await processData(input);
    return result;
} catch (error) {
    throw new Error(`Failed to process data: ${error.message}`);
}
```

## File Organization

### Maximum File Sizes

- **Go**: ≤400 lines per file
- **JavaScript**: ≤400 lines per file
- **Python**: ≤400 lines per file

### Function Sizes

- **Target**: ≤50 lines per function
- **Maximum**: 100 lines (refactor if approaching)

## Quick Reference

| Metric | Go | JavaScript | Python |
|--------|-----|------------|--------|
| Coverage Target | ≥80% | ≥85% | ≥50% |
| Max Function Lines | 100 | 100 | 100 |
| Max File Lines | 400 | 400 | 400 |
| Max Parameters | 5 | 5 | 5 |
| Line Length | 120 | 120 | 120 |

## Documentation Hygiene: Automatic Validation

**Problem**: Bootstrap projects accumulate documentation clutter over time - SESSION-CHECKPOINT files after work is complete, extensive "completed work" listings, references to deleted files. Developers have to manually remember to clean these up.

**Solution**: Automatic validation that runs on every commit and rejects commits containing:

- SESSION-CHECKPOINT.md files with no actual remaining work
- Extensive "✅ completed work" listings (indicates historical clutter)
- References to deleted files or directories
- CLAUDE.md files exceeding 600 lines (indicates accumulated cruft)
- TODO lists in projects marked as complete

**Implementation**: `genesis/scripts/lib/validate-docs.sh` (~188-line shell script that runs in <1 second).

**Benefit**: Documentation stays clean and focused without requiring manual enforcement. Developers get immediate feedback: "Remove that completed work section before you push."

**Where It Works**: All Genesis-bootstrapped projects - the script is generic enough to work for any documentation structure.

**Integration**:
- Pre-commit hook: Validates docs before commit
- CI/CD: Runs in `.github/workflows/ci.yml` to catch any bypassed hooks
- Template: Included in all Genesis-generated projects

**Usage**:
```bash
# Manual validation
./genesis/scripts/lib/validate-docs.sh

# Automatic validation (runs on git commit)
# No action needed - pre-commit hook handles it
```

**Common Fixes When Validation Fails**:
- Delete SESSION-CHECKPOINT.md if project is complete
- Remove ✅ completed work sections from documentation (move to CHANGELOG if needed)
- Update references to deleted files
- Remove TODO lists from completed projects
- Trim CLAUDE.md if it exceeds 600 lines

## Resources

- Go Style Guide: `docs/GO_STYLE_GUIDE.md`
- Python Style Guide: `docs/PYTHON_STYLE_GUIDE.md`
- CI Configuration: `.github/workflows/ci.yml`
- Documentation Validator: `genesis/scripts/lib/validate-docs.sh`

## JavaScript Code Style Standards

### Quote Style

All JavaScript code in Genesis templates and spawned projects **MUST** use **single quotes** for strings and imports.

**Rationale**:
- Single quotes are the JavaScript community standard
- Matches ESLint default recommendations
- Consistent with product-requirements-assistant and one-pager (reference implementations)
- Avoids escaping in HTML strings

**Correct:**
```javascript
import { foo } from './bar.js';
import storage from './storage.js';
const message = 'Hello world';
const html = '<div class="container">Content</div>';  // Double quotes inside single quotes
```

**Incorrect:**
```javascript
import { foo } from "./bar.js";  // ❌ Double quotes
const message = "Hello world";   // ❌ Double quotes
```

**Exception**: Use double quotes inside single-quoted strings (e.g., HTML attributes).

**Auto-Fix**: Run `npm run lint:fix` to automatically fix quote style violations.

**ESLint Configuration**: All Genesis templates include this in `.eslintrc.json`:
```json
{
  "rules": {
    "quotes": ["error", "single"]
  }
}
```

### UI Workflow Principles

When generating code for multi-step workflows, **never assume linear user behavior**. Users will skip steps, go backwards, and use the app in unexpected ways.

**BAD - Assumes user followed workflow order:**
```javascript
// Assumes user clicked Button A before Button B
buttonB.addEventListener('click', () => {
  const data = state.dataFromButtonA;  // ❌ Might be undefined
  saveData(data);
});
```

**GOOD - Auto-generates missing data:**
```javascript
// Auto-generates missing data if user skipped Button A
buttonB.addEventListener('click', () => {
  let data = state.dataFromButtonA;
  if (!data) {
    data = generateDataFromButtonA();  // ✅ Forgiving workflow
  }
  saveData(data);
});
```

**Testing Strategy**: Always add tests for users skipping steps:
```javascript
test('should handle user skipping step 1', async () => {
  const state = await createState();
  expect(state.step1Data).toBe('');  // User never did step 1
  
  // User goes directly to step 2
  await handleStep2(state);
  
  // System should auto-generate step 1 data
  const updated = await getState();
  expect(updated.step1Data).toBeTruthy();
});
```

**Reference**: See `docs/GENESIS-UI-WORKFLOW-BUG-PREVENTION.md` for detailed examples and patterns.

