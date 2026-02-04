# Genesis Worst-Offenders Report

> **Generated:** 2026-02-03 | **Overall Entropy:** 6.5%

## Executive Summary

The alignment scan identified **Test Coverage** as the primary issue (33% entropy) while other dimensions are healthy.
Product Requirements Assistant is the worst offender with the most missing tests and lowest coverage.

---

## 🔴 Critical Issue: Test Parity

| Rank | Project | Test Parity | Line Coverage | Missing Tests |
|------|---------|-------------|---------------|---------------|
| 1 | **product-requirements-assistant** | 56.5% | 65% | 8 files |
| 2 | **one-pager** | 68.4% | 81% | 4 files |
| 3 | **power-statement-assistant** | 70.0% | 89% | 4 files |
| 4 | **pr-faq-assistant** | 73.7% | 93% | 2 files |
| 5 | **strategic-proposal** | 79.2% | 88% | 2 files |
| 6 | **architecture-decision-record** | 87.0% | 84% | 4 files |
| 7 | **hello-world** | 150% | 98% | 2 files |

---

## Missing Test Files by Project

### 1. product-requirements-assistant (8 missing) ❌
- `diff-view.test.js`
- `exporters.test.js`
- `mutation-tracker.test.js`
- `prd-templates.test.js`
- `project-view.test.js`
- `prompts.test.js` (assistant)
- `validator-inline.test.js`
- `prompts.test.js` (validator)

### 2. one-pager (4 missing)
- `diff-view.test.js`
- `project-view.test.js`
- `prompts.test.js` (assistant)
- `prompts.test.js` (validator)

### 3. power-statement-assistant (4 missing)
- `diff-view.test.js`
- `project-view.test.js`
- `prompts.test.js` (assistant)
- `prompts.test.js` (validator)

### 4. pr-faq-assistant (2 missing)
- `diff-view.test.js`
- `project-view.test.js`

### 5. strategic-proposal (2 missing)
- `ai-mock-ui.test.js`
- `diff-view.test.js`

### 6. architecture-decision-record (4 missing)
- `ai-mock-ui.test.js`
- `diff-view.test.js`
- `prompts.test.js` (assistant)
- `prompts.test.js` (validator)

---

## Recommended Fix Order (Least → Most Work)

1. **pr-faq-assistant** - 2 missing tests, 93% coverage, fastest to fix
2. **strategic-proposal** - 2 missing tests, 88% coverage
3. **architecture-decision-record** - 4 missing tests, 84% coverage
4. **power-statement-assistant** - 4 missing tests, 89% coverage  
5. **one-pager** - 4 missing tests, 81% coverage
6. **product-requirements-assistant** - 8 missing tests, 65% coverage, most work

---

## Other Dimensions (Healthy ✅)

| Dimension | Entropy | Status |
|-----------|---------|--------|
| Config Parity | 5.3% | ✅ Minor ESLint differences |
| UX Consistency | 7.0% | ✅ All have dark mode, consistent styling |
| Naming Conventions | 7.0% | ✅ Consistent patterns |
| Dependency Versions | 0.0% | ✅ All aligned |
| CI Pipeline | 0.0% | ✅ All have lint/test/coverage |
| Documentation | 0.0% | ✅ All have README, CLAUDE.md, etc. |
| Code Patterns | 0.0% | ✅ All use Workflow class architecture |

---

## Action Items

### Immediate (P0)
- [ ] Add missing test files for all 6 projects
- [ ] Raise product-requirements-assistant coverage from 65% to 85%+

### Short-term (P1)
- [ ] Raise all projects to 85%+ line coverage
- [ ] Standardize ESLint quotes rule

### Medium-term (P2)
- [ ] Add e2e tests to any projects missing them
- [ ] Standardize all validator tools

