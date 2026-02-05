# Test Plan: Progress & Guidelines

> Part of [Genesis Test Plan](../TEST_PLAN.md)

---

## Progress Tracking

### Overall Status

- **Total Test Cases:** 67
- **Completed:** 0
- **In Progress:** 0
- **Not Started:** 67
- **Blocked:** 0

### By Priority

| Priority | Total | Completed | Remaining |
|----------|-------|-----------|-----------|
| P0       | 24    | 0         | 24        |
| P1       | 28    | 0         | 28        |
| P2       | 12    | 0         | 12        |
| P3       | 3     | 0         | 3         |

### By Category

| Category              | Total | Completed | Remaining |
|-----------------------|-------|-----------|-----------|
| Template System       | 4     | 0         | 4         |
| Bootstrap Workflow    | 4     | 0         | 4         |
| Shell Scripts         | 4     | 0         | 4         |
| Go Validator          | 4     | 0         | 4         |
| Integration Tests     | 4     | 0         | 4         |
| User Flows            | 4     | 0         | 4         |
| Security              | 3     | 0         | 3         |
| Documentation         | 3     | 0         | 3         |

### Implementation Plan

**Phase 1 (P0 Critical Tests):** Days 1-3
- All P0 template system tests
- All P0 bootstrap workflow tests
- All P0 shell script tests
- All P0 validator tests
- All P0 integration tests
- All P0 user flow tests
- All P0 security tests

**Phase 2 (P1 High Priority Tests):** Days 4-5
- Remaining integration tests
- User customization workflows
- Error recovery scenarios
- Documentation accuracy checks

**Phase 3 (P2-P3 Nice-to-Have Tests):** Day 6
- Link validation
- Performance testing
- Advanced edge cases

---

## Test Implementation Guidelines

### Test File Organization

```
genesis/
├── tests/
│   ├── template-system/
│   ├── bootstrap/
│   ├── scripts/
│   └── integration/
```

### Testing Standards

1. **All tests must be idempotent** - Can run multiple times without side effects
2. **All tests must clean up after themselves** - No leftover files or state
3. **All tests must have clear assertions** - No ambiguous pass/fail conditions
4. **All tests must document their purpose** - Clear description and expected behavior

### Coverage Goals

- **Code Coverage:** Maintain >90% statement coverage
- **Branch Coverage:** Maintain >85% branch coverage
- **Integration Coverage:** All major user flows tested end-to-end
- **Error Coverage:** All error paths tested with expected behavior

---

## Success Criteria

This test plan is considered complete when:

- ✅ All P0 tests implemented and passing
- ✅ All P1 tests implemented and passing
- ✅ At least 80% of P2 tests implemented
- ✅ Code coverage remains above 90%
- ✅ All CI quality gates pass cleanly
- ✅ TEST_BUGS_REVEALED.md documents any defects found
- ✅ All critical defects have remediation plans
- ✅ No regressions in existing test suite

---

## Notes

- This test plan complements existing tests, not replaces them
- Focus is on integration, user flows, and correctness beyond unit coverage
- Tests should catch issues that current 95%+ coverage misses
- Emphasize adversarial workflow, forgiving UX, and documentation hygiene
- All tests must follow CLAUDE.md coding standards (single quotes, linting, etc.)

