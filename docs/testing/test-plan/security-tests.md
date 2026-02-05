# Test Plan: Security Tests

> Part of [Genesis Test Plan](../TEST_PLAN.md)

---

## SEC-001: Input Validation (P0, Security)
**Objective:** Verify all user inputs are validated

**Test Cases:**
1. Reject XSS attempts in form inputs
   - Input: `<script>alert('xss')</script>`
   - Expected: Sanitized or rejected

2. Reject SQL injection attempts (if applicable)
   - Input: `'; DROP TABLE users; --`
   - Expected: Treated as literal string

3. Reject path traversal attempts
   - Input: `../../etc/passwd`
   - Expected: Rejected, clear error

4. Handle extremely long inputs
   - Input: 10MB string
   - Expected: Rejected or truncated with warning

**Status:** ⬜ Not Started

---

## SEC-002: Secret Detection (P0, Security)
**Objective:** Prevent secrets from being committed

**Test Cases:**
1. Detect API keys in code
   - Pattern: `API_KEY = "sk-..."`
   - Expected: Pre-commit hook blocks

2. Detect tokens in environment files
   - File: `.env` (not .env.example)
   - Expected: .gitignore blocks

3. Detect credentials in JSON
   - Pattern: `"password": "..."`
   - Expected: Warning or block

4. Allow placeholder secrets in examples
   - File: `.env.example`
   - Expected: Allowed, not blocked

**Status:** ⬜ Not Started

---

## SEC-003: Dependency Vulnerabilities (P1, Security)
**Objective:** Detect and report vulnerable dependencies

**Test Cases:**
1. npm audit detects known vulnerabilities
   - Run: `npm audit`
   - Expected: Report shown, critical vulns fail CI

2. Trivy scans filesystem for vulns
   - Run: Trivy action in CI
   - Expected: SARIF report uploaded to GitHub

3. Dependabot PRs for updates
   - Expected: Auto-PRs for dependency updates

4. Security policy documented
   - File: SECURITY.md
   - Expected: Vulnerability reporting process clear

**Status:** ⬜ Not Started

