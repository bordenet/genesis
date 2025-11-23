# PASS 2: Test Coverage Enhancement Plan

**Goal**: Achieve 85% statement coverage and 80% branch coverage  
**Current**: 73.07% statements, 53.33% branches  
**Gap**: +11.93% statements, +26.67% branches  
**Estimated Effort**: 24-32 hours

---

## COVERAGE GAP ANALYSIS

### JavaScript (hello-world example)

| File | Current Coverage | Target | Gap | Priority |
|------|-----------------|--------|-----|----------|
| `storage.js` | 62.82% | 85% | -22.18% | 🔴 HIGH |
| `ai-mock.js` | 79.16% | 85% | -5.84% | 🟡 MEDIUM |
| `workflow.js` | 96.42% | 85% | +11.42% | ✅ GOOD |
| `app.js` | EXCLUDED | 85% | N/A | 🔴 HIGH |

**Branch Coverage**: 53.33% (need +26.67%)

### Go (genesis-validator)

| Component | Current Coverage | Target | Gap | Priority |
|-----------|-----------------|--------|-----|----------|
| Overall | 58.1% | 85% | -26.9% | 🔴 CRITICAL |

---

## PRIORITY 1: Fix storage.js Coverage (62.82% → 85%)

### Uncovered Lines Analysis

**File**: `genesis/examples/hello-world/js/storage.js`

**Uncovered Sections** (from coverage report):
- Lines 102-143: Error handling and edge cases

### Required Test Cases

#### 1. Error Handling Tests (10 tests)
```javascript
describe('storage.js - Error Handling', () => {
  test('should handle IndexedDB open failure', async () => {
    // Mock indexedDB.open to fail
    // Verify error is caught and handled
  });

  test('should handle transaction abort', async () => {
    // Mock transaction.abort()
    // Verify cleanup and error handling
  });

  test('should handle quota exceeded error', async () => {
    // Mock QuotaExceededError
    // Verify graceful degradation
  });

  test('should handle corrupted data in storage', async () => {
    // Store invalid JSON
    // Verify error handling and recovery
  });

  test('should handle concurrent write conflicts', async () => {
    // Simulate concurrent writes
    // Verify transaction isolation
  });

  test('should handle database version mismatch', async () => {
    // Mock version conflict
    // Verify upgrade handling
  });

  test('should handle missing object store', async () => {
    // Mock missing store
    // Verify error and recovery
  });

  test('should handle read from closed database', async () => {
    // Close database, then read
    // Verify error handling
  });

  test('should handle write to closed database', async () => {
    // Close database, then write
    // Verify error handling
  });

  test('should handle delete from closed database', async () => {
    // Close database, then delete
    // Verify error handling
  });
});
```

#### 2. Edge Case Tests (8 tests)
```javascript
describe('storage.js - Edge Cases', () => {
  test('should handle empty string as key', async () => {
    // Test with key = ""
  });

  test('should handle very long keys (>1000 chars)', async () => {
    // Test with long key
  });

  test('should handle very large data objects (>1MB)', async () => {
    // Test with large payload
  });

  test('should handle null values', async () => {
    // Test storing null
  });

  test('should handle undefined values', async () => {
    // Test storing undefined
  });

  test('should handle circular references', async () => {
    // Test with circular object
    // Should fail gracefully
  });

  test('should handle special characters in keys', async () => {
    // Test with unicode, emojis, etc.
  });

  test('should handle rapid sequential operations', async () => {
    // Test 100 operations in quick succession
  });
});
```

#### 3. Concurrency Tests (5 tests)
```javascript
describe('storage.js - Concurrency', () => {
  test('should handle parallel reads', async () => {
    // 10 simultaneous reads
  });

  test('should handle parallel writes to different keys', async () => {
    // 10 simultaneous writes
  });

  test('should handle parallel writes to same key', async () => {
    // Race condition test
  });

  test('should handle read during write', async () => {
    // Concurrent read/write
  });

  test('should handle delete during read', async () => {
    // Concurrent delete/read
  });
});
```

**Total for storage.js**: 23 new tests

---

## PRIORITY 2: Increase Branch Coverage (53.33% → 80%)

### Branch Coverage Gaps

**Current**: 53.33% (8/15 branches covered)  
**Target**: 80% (12/15 branches covered)  
**Need**: +4 branches = ~40 additional branch tests

### Required Branch Tests

#### 1. Error Path Branches (20 tests)
```javascript
// For every try-catch block, test:
// - Success path (already tested)
// - Error path (MISSING)
// - Finally block (MISSING)

describe('Branch Coverage - Error Paths', () => {
  test('ai-mock.js: generateResponse error path', async () => {
    // Force error in generateResponse
  });

  test('ai-mock.js: validateInput error path', async () => {
    // Force validation failure
  });

  test('workflow.js: state transition error path', async () => {
    // Force invalid state transition
  });

  test('workflow.js: phase validation error path', async () => {
    // Force phase validation failure
  });

  // ... 16 more error path tests
});
```

#### 2. Conditional Branch Tests (15 tests)
```javascript
describe('Branch Coverage - Conditionals', () => {
  test('ai-mock.js: if (mockEnabled) - true branch', () => {});
  test('ai-mock.js: if (mockEnabled) - false branch', () => {});
  
  test('workflow.js: if (phase === 1) - true branch', () => {});
  test('workflow.js: if (phase === 1) - false branch', () => {});
  
  test('storage.js: if (data === null) - true branch', () => {});
  test('storage.js: if (data === null) - false branch', () => {});
  
  // ... 9 more conditional branch tests
});
```

#### 3. Loop Branch Tests (5 tests)
```javascript
describe('Branch Coverage - Loops', () => {
  test('should handle empty array in loop', () => {});
  test('should handle single item in loop', () => {});
  test('should handle multiple items in loop', () => {});
  test('should handle loop with break', () => {});
  test('should handle loop with continue', () => {});
});
```

**Total for branch coverage**: 40 new tests

---

## PRIORITY 3: Add app.js Coverage (Currently EXCLUDED)

### Analysis

**File**: `genesis/examples/hello-world/js/app.js`  
**Current**: Excluded from coverage  
**Reason**: Main application file, considered "integration" code

### Decision Required

**Option 1**: Keep excluded (integration tests cover it)  
**Option 2**: Add unit tests for app.js functions

**Recommendation**: Add integration tests instead of unit tests

---

## PRIORITY 4: Go Validator Coverage (58.1% → 85%)

### Required Test Cases

#### 1. scanner_test.go Enhancements (10 tests)
```go
// Add tests for:
// - Error handling in file scanning
// - Edge cases (empty files, binary files, symlinks)
// - Large file handling
// - Concurrent scanning
// - Invalid UTF-8 handling
```

#### 2. parser_test.go Enhancements (10 tests)
```go
// Add tests for:
// - Malformed YAML
// - Missing required fields
// - Invalid data types
// - Nested structure edge cases
// - Large document handling
```

#### 3. validator_test.go Enhancements (10 tests)
```go
// Add tests for:
// - All validation rules
// - Error message formatting
// - Multiple errors in single file
// - Warning vs error distinction
// - Custom validation rules
```

**Total for Go**: 30 new tests

---

## PRIORITY 5: Integration Tests (Currently: 0)

### Required Integration Test Suites

#### 1. Workflow Integration Tests (10 tests)
```javascript
describe('Integration: Full Workflow', () => {
  test('should complete 3-phase workflow end-to-end', async () => {
    // Phase 1 → Phase 2 → Phase 3
  });

  test('should persist state across page reloads', async () => {
    // Save state, reload, verify
  });

  test('should handle workflow reset', async () => {
    // Complete workflow, reset, verify clean state
  });

  // ... 7 more integration tests
});
```

#### 2. Storage Integration Tests (5 tests)
```javascript
describe('Integration: Storage + Workflow', () => {
  test('should save workflow state to IndexedDB', async () => {});
  test('should restore workflow state from IndexedDB', async () => {});
  test('should handle storage quota exceeded', async () => {});
  test('should migrate old data format', async () => {});
  test('should clear all data on reset', async () => {});
});
```

#### 3. AI Mock Integration Tests (5 tests)
```javascript
describe('Integration: AI Mock + Workflow', () => {
  test('should generate responses for all phases', async () => {});
  test('should handle mock mode toggle', async () => {});
  test('should validate AI responses', async () => {});
  test('should handle AI timeout', async () => {});
  test('should handle AI error', async () => {});
});
```

**Total integration tests**: 20 tests

---

## PRIORITY 6: End-to-End Tests (Currently: 0)

### Required E2E Test Suites (Playwright)

#### 1. Critical User Journeys (10 tests)
```javascript
describe('E2E: Critical Paths', () => {
  test('should complete full workflow with mock AI', async ({ page }) => {
    // Navigate, fill forms, submit, verify
  });

  test('should save and restore workflow state', async ({ page }) => {
    // Start workflow, reload page, verify state
  });

  test('should export workflow results', async ({ page }) => {
    // Complete workflow, export, verify download
  });

  // ... 7 more E2E tests
});
```

**Total E2E tests**: 10 tests

---

## SUMMARY: TOTAL NEW TESTS REQUIRED

| Category | Tests | Estimated Hours |
|----------|-------|-----------------|
| storage.js unit tests | 23 | 4-6 hours |
| Branch coverage tests | 40 | 6-8 hours |
| Go validator tests | 30 | 6-8 hours |
| Integration tests | 20 | 4-6 hours |
| E2E tests | 10 | 4-6 hours |
| **TOTAL** | **123** | **24-34 hours** |

---

## EXECUTION PLAN

### Week 1: Unit Tests (16-20 hours)
- Day 1-2: storage.js tests (23 tests)
- Day 3-4: Branch coverage tests (40 tests)
- Day 5: Go validator tests (30 tests)

### Week 2: Integration & E2E (8-14 hours)
- Day 1-2: Integration tests (20 tests)
- Day 3: E2E tests (10 tests)
- Day 4: Verification and fixes

---

## SUCCESS CRITERIA

✅ JavaScript statement coverage ≥ 85%  
✅ JavaScript branch coverage ≥ 80%  
✅ Go statement coverage ≥ 85%  
✅ All 123 new tests passing  
✅ Integration tests covering cross-component workflows  
✅ E2E tests covering critical user journeys  
✅ No coverage exclusions (remove app.js exclusion)  
✅ Coverage gates enforced in CI/CD

---

**Status**: Ready to begin Pass 2  
**Next Step**: Start with storage.js error handling tests

