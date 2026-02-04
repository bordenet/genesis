# Jest 30 Upgrade Plan - Non-Genesis Repos

> **Status:** ✅ COMPLETE
> **Created:** 2026-02-04
> **Goal:** Upgrade non-genesis repos to Jest 30.2.0

## Non-Genesis Repos with Jest - UPGRADED ✅

| Repo | jest | @jest/globals | jest-environment-jsdom | Tests | CI | PR |
|------|------|---------------|------------------------|-------|-----|-----|
| RecipeArchive | 30.2.0 ✅ | 30.2.0 ✅ | 30.2.0 ✅ | ✅ 67 | ✅ | #93 |
| pr-faq-validator | 30.2.0 ✅ | N/A | 30.2.0 ✅ | ✅ 55 | ✅ | #11 |

## Target State - ACHIEVED ✅

- `jest`: ^30.2.0 ✅
- `@jest/globals`: ^30.2.0 (where applicable) ✅
- `jest-environment-jsdom`: ^30.2.0 ✅

---

## Progress Tracker - COMPLETE ✅

| Repo | Branch | Tests | Lint | Commit | Push | CI | Merge | Done |
|------|--------|-------|------|--------|------|-----|-------|------|
| RecipeArchive | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| pr-faq-validator | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Repos STILL Needing Jest 30 (for future consideration)

### Genesis Ecosystem (DO NOT TOUCH YET - requires coordinated upgrade)

| Repo | Current Jest | Notes |
|------|--------------|-------|
| genesis/examples/hello-world | 29.7.0 | Baseline template - upgrade FIRST in coordinated effort |
| one-pager | 29.7.0 | Mixed: jsdom already 30.2.0 |
| pr-faq-assistant | 29.7.0 | All 29.x |
| product-requirements-assistant | 29.7.0 | All 29.x |
| power-statement-assistant | 29.7.0 | All 29.x |
| strategic-proposal | 29.7.0 | Mixed: jsdom already 30.2.0 |
| architecture-decision-record | 29.7.0 | Mixed: jsdom already 30.2.0 |

