# Project Setup: Phase 4 - Validation System

> Part of [Project Setup Checklist](../PROJECT_SETUP_CHECKLIST.md)

**Time Estimate**: 1-2 hours

---

## 4.1 Required Tests (Non-Negotiable)

Every project MUST include these tests in `tests/`:

```
tests/
├── link-validation.test.js    # Validates all markdown links exist
├── template-sync.test.js      # Validates template variables (if applicable)
└── [module].test.js           # Unit tests for each module
```

**Link Validation Test**: Copy from `genesis/templates/tests/link-validation.test.js`

This test:
- Scans all `.md` files in the project
- Extracts internal markdown links `[text](path)`
- Verifies each linked file exists
- Fails CI if any broken links are found

**Why this is mandatory**: Broken documentation links erode trust and waste developer time.

---

## 4.2 Create Validation Script

```bash
# validate-monorepo.sh
# Copy from starter-kit/validate-template.sh
```

---

## 4.3 Define Validation Tiers

```bash
declare -A TEST_TIERS
TEST_TIERS[p1]="dependencies builds_core tests_unit"
TEST_TIERS[med]="${TEST_TIERS[p1]} builds_extended linting"
TEST_TIERS[all]="${TEST_TIERS[med]} tests_e2e security_scan"
```

---

## 4.4 Implement Validation Functions

```bash
validate_dependencies() {
  log_section "Validating Dependencies"
  require_command "node" "Run: ./scripts/setup-macos.sh"
  require_command "go" "Run: ./scripts/setup-macos.sh"
  log_success "Dependencies validated"
}

validate_builds() {
  log_section "Validating Builds"
  npm run build || die "npm build failed"
  go build ./... || die "go build failed"
  log_success "Builds validated"
}

validate_tests() {
  log_section "Running Tests"
  npm test || die "npm tests failed"
  go test ./... || die "go tests failed"
  log_success "Tests passed"
}

validate_linting() {
  log_section "Running Linters"
  npm run lint || die "npm lint failed"
  golangci-lint run ./... || die "golangci-lint failed"
  log_success "Linting passed"
}

validate_security() {
  log_section "Security Scanning"
  npm audit --audit-level=high || die "npm audit failed"
  log_success "Security checks passed"
}
```

---

## 4.5 Test Validation

```bash
# Test each tier
./validate-monorepo.sh --p1
./validate-monorepo.sh --med
./validate-monorepo.sh --all
```

---

## Checklist

- [ ] `validate-monorepo.sh` created
- [ ] Validation tiers defined (p1, med, all)
- [ ] Dependency checks implemented
- [ ] Build validation implemented
- [ ] Test execution implemented
- [ ] Linting validation implemented
- [ ] Security scanning implemented
- [ ] All tiers tested

