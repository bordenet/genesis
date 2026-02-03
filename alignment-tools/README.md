# Genesis Alignment Tools v2

Comprehensive entropy and variance scanner for **paired Genesis projects** (assistant + validator). This toolset measures **semantic variance** (actual config values, coverage thresholds, UX patterns) rather than just structural similarity.

## Paired Projects Scanned

All Genesis projects now use the paired model. By default, alignment-tools scans:

| Project | Structure |
|---------|-----------|
| one-pager | `assistant/` + `validator/` |
| product-requirements-assistant | `assistant/` + `validator/` |
| architecture-decision-record | `assistant/` + `validator/` |
| strategic-proposal | `assistant/` + `validator/` |
| pr-faq-assistant | `assistant/` + `validator/` |
| power-statement-assistant | `assistant/` + `validator/` |
| hello-world (template) | `assistant/` + `validator/` |

## Why v2?

The original tools missed critical variance because:
1. **Semantic blindness**: Used file hashes instead of parsed values
2. **Presence ≠ Quality**: Checked if test files exist, not coverage thresholds
3. **Incomplete implementation**: The entropy scanner was started but never finished
4. **Low penalty weights**: Config drift barely affected scores
5. **No CI enforcement**: Tools ran manually and drift accumulated

## Installation

```bash
cd genesis/alignment-tools-v2
npm install
```

## Usage

```bash
# Full scan with console output
node cli.js scan

# Scan specific dimensions
node cli.js scan --only test-coverage,config-parity

# Generate JSON report
node cli.js scan --format json --output report.json

# Generate Markdown report
node cli.js scan --format markdown --output report.md

# CI mode (exit 1 if entropy > threshold)
node cli.js scan --ci --threshold 15

# Compare to baseline
node cli.js scan --baseline

# Save current state as baseline
node cli.js baseline save

# Scan specific repos
node cli.js scan --repos one-pager,strategic-proposal
```

## Dimensions Scanned

| Dimension | What It Measures |
|-----------|------------------|
| **Test Coverage** | Jest config thresholds, actual coverage values |
| **Config Parity** | package.json scripts, ESLint rules, module type |
| **UX Consistency** | Dark mode, Tailwind classes, container patterns |
| **Naming Conventions** | camelCase, ESM exports, test file naming |
| **Dependency Versions** | Major version alignment of critical deps |
| **CI Pipeline** | Node versions, lint/test/coverage steps |
| **Documentation** | README structure, required files |
| **Code Patterns** | Storage, workflow, router, error handling |

## Entropy Scoring

Uses Shannon entropy to quantify variance (0-100%):
- **0%**: All repos identical (perfect alignment)
- **<10%**: Acceptable variance ✅
- **10-30%**: Needs attention ⚠️
- **>30%**: Critical variance ❌

## CI Integration

Add to your GitHub Actions workflow:

```yaml
- name: Check Genesis Alignment
  run: |
    cd genesis/alignment-tools-v2
    npm install
    node cli.js scan --ci --threshold 10
```

## Baseline Management

The `baseline/expected-values.json` file contains canonical values that all repos should match. Update this file when intentionally changing standards.

## Architecture

```
alignment-tools-v2/
├── cli.js                    # Main CLI entry point
├── lib/
│   ├── entropy.js            # Shannon entropy calculation
│   ├── config-parser.js      # Semantic config parsers
│   ├── report-generator.js   # Report formatting
│   └── baseline-manager.js   # Expected values management
├── scanners/
│   ├── test-coverage.js      # Jest config + coverage
│   ├── config-parity.js      # package.json, ESLint
│   ├── ux-consistency.js     # HTML/CSS patterns
│   ├── naming-conventions.js # Naming patterns
│   ├── dependency-versions.js# Dependency alignment
│   ├── ci-pipeline.js        # GitHub Actions
│   ├── documentation.js      # Required docs
│   └── code-patterns.js      # Architecture conformity
└── baseline/
    └── expected-values.json  # Canonical expected values
```

