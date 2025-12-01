# CLAUDE.md - AI Agent Instructions for Genesis

This document defines the coding conventions and quality standards that **must** be followed
without exception in this repository. These are derived from the bordenet organization's
style guides and are enforced through automated tooling in CI.

---

## ✅ COMPLETED: Genesis Module System Fix & Template Audit (2025-12-01)

**Status**: All phases complete and pushed to origin/main
**Completed**: 2025-12-01
**Total Commits**: 12 commits

### What Was Fixed

**Root Cause**: Module system mismatch (templates expect ES6, AI generates CommonJS) + Node.js globals in browser code + missing test coverage.

**Solutions Implemented**:

1. ✅ **Module System Validation** (Phase 1-5)
   - Fixed `same-llm-adversarial-template.js` (last CommonJS template → ES6)
   - Enhanced `index-template.html` with comprehensive ES6 module documentation
   - Added 113-line "Module System Validation" section to `01-AI-INSTRUCTIONS.md`
   - Added 165-line "Module System" section to `REFERENCE-IMPLEMENTATIONS.md`
   - Created `validate-module-system.sh` (147 lines, 6 validation checks)
   - Integrated validation into `setup-macos-web-template.sh`
   - Added comprehensive troubleshooting documentation

2. ✅ **Node.js Globals Validation** (User feedback)
   - Enhanced validator to detect `process.env`, `__dirname`, `__filename`
   - Fixed `same-llm-adversarial-template.js` with browser-safe `getEnvVar()` helper
   - Added 45-line "Never Use Node.js Globals Directly" section to AI instructions
   - Added 115-line troubleshooting section for Node.js globals

3. ✅ **Footer Link Styling** (User feedback)
   - Changed GitHub footer links from gray to blue for better visibility
   - Added validation check for unlinked GitHub text

4. ✅ **Template Audit** (Phase 2)
   - Audited all templates for TODO/placeholder code (✅ none found)
   - Audited for incomplete stub implementations (✅ none found)
   - Created comprehensive tests for `router` module (150 lines, 15 tests)
   - Created comprehensive tests for `app` module (150 lines, 10 tests)
   - Improved test coverage from 58% to 75% (9/12 modules tested)

### Validation Results

**Genesis Templates**: ✅ PASS
- ✅ No CommonJS require()
- ✅ No CommonJS module.exports
- ✅ No unguarded Node.js globals
- ✅ No unreplaced template variables
- ✅ ES6 imports/exports present (16 imports, 36 exports)
- ✅ Footer links properly styled

**E2E Test**: ✅ PASS
- ✅ Fresh project bootstrapped successfully
- ✅ All template variables replaced
- ✅ Module system validation passes
- ✅ HTTP server serves project correctly

### Future Work (Optional)

**Phase 3: Validation Hardening** (Not started)
- Add accessibility tests (ARIA, alt text, semantic HTML)
- Add visual regression tests
- Create template linting rules

**Reverse Integration** (Not started)
- Apply fixes to architecture-decision-record (convert CommonJS → ES6)
- Apply fixes to product-requirements-assistant (verify module system)
- Apply fixes to one-pager (verify module system)

### Reference Documents

- **Design Document**: `docs/plans/GENESIS-MODULE-SYSTEM-FIX.md` (551 lines)
- **Changelog**: `CHANGELOG.md` (see [Unreleased] section)
- **Troubleshooting**: `TROUBLESHOOTING.md` (692 lines)

---

## Non-Negotiable Quality Gates

All code changes **MUST** pass before commit/merge:

1. **All tests pass** - No exceptions
2. **Code coverage thresholds met** - See language-specific requirements below
3. **Linting passes** - No warnings or errors
4. **Security scans pass** - No high/critical vulnerabilities

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
