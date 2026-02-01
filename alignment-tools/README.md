# Genesis Alignment Tools

> **Guidelines:** See [../Agents.md](../Agents.md) for writing standards.
> **Last Updated:** 2026-02-01

## Purpose

Measure and report on entropy/variance across Genesis-derived repositories. These tools detect configuration drift, test coverage variance, UX inconsistencies, and other divergence patterns that the original `consistency-checker` missed.

## Why This Exists

The original `consistency-checker/fingerprint.js` computed similarity scores based on **file presence and hashes**. It missed semantic differences like:

- Test coverage thresholds varying from 40% to 50% across repos
- Different CI pipeline configurations
- UX variance in HTML structure, fonts, and verbiage
- Dependency version drift

This toolset **parses configuration files** and compares **specific values** against an expected baseline.

## Quick Start

```bash
# From genesis-tools root
node genesis/alignment-tools/scan-entropy.js

# Generate detailed report
node genesis/alignment-tools/scan-entropy.js --report

# CI mode (exit 1 if entropy exceeds threshold)
node genesis/alignment-tools/scan-entropy.js --ci --threshold 15
```

## What It Measures

| Dimension | Weight | What It Checks |
|-----------|--------|----------------|
| Test Coverage Thresholds | 25% | jest.config.js threshold values must match |
| Config Semantic Parity | 15% | package.json scripts, eslint rules must be identical |
| UX Consistency | 15% | HTML layout patterns, CSS class usage, font sizes |
| Naming Conventions | 10% | Variable/function naming patterns across repos |
| Dependency Versions | 10% | Major version alignment for shared dependencies |
| CI Pipeline | 10% | Workflow stages, Node versions, coverage gates |
| Documentation | 5% | README structure, CLAUDE.md presence |
| Actual Test Coverage | 10% | Optional: runs tests and compares coverage % |

## Output

### Console Summary

```
=== GENESIS ALIGNMENT SCAN ===

Repos Analyzed: 6
Composite Entropy Score: 23.5 / 100 (NEEDS ATTENTION)

CRITICAL VARIANCE:
  - jest.config.js coverageThreshold.statements: 2 distinct values (40, 50)
  - jest.config.js coverageThreshold.branches: 2 distinct values (35, 40)

WARNING VARIANCE:
  - package.json test:e2e script: 1 repo missing (strategic-proposal)
```

### JSON Report

Use `--report` to generate `alignment-report.json` with full details.

## Entropy Scoring

Shannon entropy: `H = -Σ p_i × log₂(p_i)`

- **0-10**: Tight alignment (minor cosmetic differences)
- **10-20**: Acceptable variance (intentional differences)
- **20-40**: Needs attention (unintentional drift)
- **40+**: Critical (repos have diverged significantly)

## Baseline Expectations

Edit `baseline/expected-values.json` to define canonical expected values:

```json
{
  "jest.config.js": {
    "coverageThreshold.global.statements": 50,
    "coverageThreshold.global.branches": 40
  }
}
```

The scanner compares each repo against these expected values and flags deviations.

## Integration

Add to CI pipeline:

```yaml
- name: Check alignment
  run: node genesis/alignment-tools/scan-entropy.js --ci --threshold 20
```

## Relationship to consistency-checker

This tool **supersedes** the original `consistency-checker` for entropy measurement. The original tool remains for backward compatibility but should not be relied upon for catching semantic variance.

