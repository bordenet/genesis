# CLAUDE.md - AI Agent Instructions for Genesis

This document defines the coding conventions and quality standards that **must** be followed
without exception in this repository. These are derived from the bordenet organization's
style guides and are enforced through automated tooling in CI.

## Non-Negotiable Quality Gates

All code changes **MUST** pass before commit/merge:

1. **All tests pass** - No exceptions
2. **Code coverage thresholds met** - See language-specific requirements below
3. **Linting passes** - No warnings or errors
4. **Security scans pass** - No high/critical vulnerabilities

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

