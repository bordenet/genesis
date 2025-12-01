# CLAUDE.md - AI Agent Instructions for Genesis

This document defines the coding conventions and quality standards that **must** be followed
without exception in this repository. These are derived from the bordenet organization's
style guides and are enforced through automated tooling in CI.

---

## 🚧 ACTIVE WORK IN PROGRESS - READ THIS FIRST 🚧

**Status**: Implementing Bootstrap Quality Fix (Design Complete)
**Started**: 2025-12-01
**Design Doc**: `docs/plans/2025-12-01-bootstrap-quality-fix.md`

### What's Being Fixed

Critical failures discovered in architecture-decision-record after bootstrap:
1. **Module System Confusion** - CommonJS export caused non-working code
2. **Event Listeners Not Attached** - UI features declared but not wired to DOM
3. **Missing Browser Verification** - No automated checks before "complete"
4. **Incomplete Templates** - TODO/placeholder code instead of working stubs

### Implementation Checklist

**Phase 1: Critical Fixes (Current)**

- [ ] **Day 1: Fix Module System**
  - [ ] Update `genesis/templates/web-app/js/same-llm-adversarial-template.js`
    - Remove CommonJS export (`module.exports`)
    - Replace with ES6 export
    - See design doc line 90-110 for exact changes
  - [ ] Update `genesis/scripts/verify-templates.sh`
    - Add CommonJS detection check
    - See design doc line 112-122 for implementation
  - [ ] Test with fresh bootstrap
    - `cp -r genesis/ test-bootstrap/`
    - Bootstrap new project
    - Verify modules load in browser

- [ ] **Day 2: Fix Event Listeners**
  - [ ] Update `genesis/templates/web-app/js/ui-template.js`
    - Add `setupThemeToggle()` function
    - Add `setupRelatedProjectsDropdown()` function
    - See design doc line 145-185 for exact implementation
  - [ ] Update `genesis/templates/web-app/js/app-template.js`
    - Import setup functions from ui.js
    - Call setup functions from `setupGlobalEventListeners()`
    - See design doc line 187-200 for exact changes
  - [ ] Test all UI features work
    - Theme toggle button works
    - Navigation dropdown opens/closes
    - No console errors

- [ ] **Day 3: Add Browser Validation**
  - [ ] Create `genesis/scripts/validate-browser.sh`
    - See design doc line 220-240 for implementation
  - [ ] Create `genesis/templates/testing/browser-validation.test-template.js`
    - See design doc line 242-320 for full test suite
  - [ ] Update `genesis/templates/testing/package-template.json`
    - Add Playwright dependency
  - [ ] Test validation catches known issues
    - Should detect missing event listeners
    - Should detect module errors
    - Should detect console errors/warnings

- [ ] **Day 4: Update Documentation**
  - [ ] Update `genesis/START-HERE.md`
    - Add section 3.2.5: Event Listener Pattern
    - See design doc line 202-218 for content
    - Update Step 4: Add browser validation step
    - See design doc line 322-340 for content
  - [ ] Update `genesis/00-AI-MUST-READ-FIRST.md`
    - Add browser validation to checklist
  - [ ] Create troubleshooting guide
    - Document common module system issues
    - Document event listener debugging

- [ ] **Day 5: Test Complete Bootstrap**
  - [ ] Bootstrap fresh project from updated templates
  - [ ] Verify all UI features work out-of-box
  - [ ] Verify browser validation catches issues
  - [ ] Document any remaining gaps in REVERSE-INTEGRATION-NOTES.md

**Phase 2: Template Audit** (Next)
- Audit all templates for TODO/placeholder code
- Complete stub implementations
- Add tests for all functionality

**Phase 3: Validation Hardening** (Future)
- Add accessibility tests
- Add visual regression tests
- Create template linting

### How to Execute This Work

1. **Read design document first**: `docs/plans/2025-12-01-bootstrap-quality-fix.md`
2. **Work through checklist sequentially**: Don't skip ahead
3. **Test after each change**: Fresh bootstrap, browser validation
4. **Update checklist as you go**: Check off completed items
5. **Clean up when done**: Remove this section from CLAUDE.md

### Commands for Testing

```bash
# Test module system fix
grep -r "module\.exports\|require(" genesis/templates/web-app/js/

# Test fresh bootstrap
rm -rf /tmp/test-bootstrap && cp -r genesis/ /tmp/test-bootstrap/

# Test browser validation
cd /tmp/test-bootstrap && ./scripts/validate-browser.sh
```

### Notes for Future Claude Sessions

- Design is complete and approved in `docs/plans/2025-12-01-bootstrap-quality-fix.md`
- Work through Phase 1 checklist above sequentially
- Each day's work is independent and can be done in separate sessions
- Test thoroughly after each change
- Don't skip browser validation - it's critical
- When Phase 1 complete, move to Phase 2 (template audit)

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

## Resources

- Go Style Guide: `docs/GO_STYLE_GUIDE.md`
- Python Style Guide: `docs/PYTHON_STYLE_GUIDE.md`
- CI Configuration: `.github/workflows/ci.yml`
