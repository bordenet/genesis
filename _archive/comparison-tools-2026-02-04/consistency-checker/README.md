# Genesis Consistency Checker (DEPRECATED)

> ⚠️ **DEPRECATED**: This tool has been superseded by **[alignment-tools](../alignment-tools/)**.
> The new alignment-tools v2 provides more comprehensive entropy/variance scanning with:
> - Semantic analysis (not just file hashes)
> - 8 scanning dimensions
> - Shannon entropy scoring
> - CI integration with thresholds
>
> Use `alignment-tools` for all new consistency checks.

---

Automated tool for detecting structural drift/entropy across Genesis-derived repositories.

## Why This Exists

LLM-assisted development can introduce subtle inconsistencies across repos that should share the same architecture. Even with detailed documentation and instructions, LLMs may:
- Miss files when syncing changes across repos
- Introduce slightly different patterns for the same functionality
- Drift on config files over time
- Forget to propagate test coverage

**This tool provides an automated, objective measure of repo consistency.**

## Quick Start

```bash
# From workspace root (parent of all tool repos)
node genesis/consistency-checker/fingerprint.js

# Save current state as baseline
node genesis/consistency-checker/fingerprint.js --save-baseline

# Compare current state to baseline
node genesis/consistency-checker/fingerprint.js --baseline

# Output JSON only (for CI/scripts)
node genesis/consistency-checker/fingerprint.js --json
```

## What It Measures

### Fingerprint Components

| Component | Weight | What It Checks |
|-----------|--------|----------------|
| **Core File Presence** | 40% | Do all repos have the same critical files? |
| **Pattern Conformity** | 35% | Do JS modules follow the same architectural patterns? |
| **Config Drift** | 15% | Are package.json, jest.config, eslint.config aligned? |
| **Test Coverage** | 10% | Do all repos have the same test files? |

### Scoring Scale

| Score | Meaning | Action |
|-------|---------|--------|
| **98-100** | Nearly identical | ✅ Excellent - only copy/prompts differ |
| **95-97** | Same architecture | ✅ Good - minor config drift acceptable |
| **90-94** | Same structure | ⚠️ Fair - some feature differences |
| **80-89** | Related but diverging | 🔴 Concerning - needs synchronization |
| **<80** | Major divergence | 🚨 Critical - immediate attention required |

## Core Files Checked

The tool verifies presence and consistency of these files across all repos:

### JavaScript Core
- `js/app.js`, `js/storage.js`, `js/ui.js`, `js/workflow.js`
- `js/router.js`, `js/views.js`, `js/projects.js`, `js/project-view.js`
- `js/types.js`, `js/error-handler.js`, `js/ai-mock.js`, `js/same-llm-adversarial.js`

### Configuration
- `package.json`, `jest.config.js`, `eslint.config.js`
- `.github/workflows/ci.yml`, `codecov.yml`

### Documentation
- `README.md`, `CONTRIBUTING.md`, `LICENSE`
- `docs/CLAUDE.md`, `docs/DESIGN-PATTERNS.md`, `docs/UI_STYLE_GUIDE.md`

### Tests
- `tests/storage.test.js`, `tests/workflow.test.js`, `tests/ui.test.js`
- `tests/router.test.js`, `tests/integration.test.js`

## Pattern Checks

Beyond file presence, the tool verifies architectural patterns in key files:

```javascript
// js/storage.js must have:
- DB_NAME constant
- IndexedDB usage
- getAllProjects, saveProject, deleteProject methods

// js/workflow.js must have:
- WORKFLOW or PHASES config
- Phase number handling
- Prompt template loading

// js/router.js must have:
- Navigation methods
- Hash/location handling

// js/ui.js must have:
- Toast notifications
- Modal/dialog support
- Render methods
```

## Baseline Tracking

Save baselines to track drift over time:

```bash
# Save initial baseline
node genesis/consistency-checker/fingerprint.js --save-baseline

# After making changes, compare to baseline
node genesis/consistency-checker/fingerprint.js --baseline
```

Output:
```
📊 BASELINE COMPARISON

  Baseline: 95.3% (2024-01-11T20:30:00.000Z)
  Current:  96.1%
  Change:   +0.8%
```

## CI Integration

Add to your CI workflow to catch drift early:

```yaml
- name: Check consistency
  run: |
    SCORE=$(node genesis/consistency-checker/fingerprint.js --json | jq '.summary.averageSimilarity')
    if (( $(echo "$SCORE < 90" | bc -l) )); then
      echo "Consistency score $SCORE is below threshold"
      exit 1
    fi
```

## Current Baseline

As of 2024-01-11:
- **Average similarity**: 95.3%
- **Most similar**: one-pager ↔ product-requirements-assistant (98.5%)
- **Least similar**: pr-faq-assistant ↔ strategic-proposal (91%)
- **Universal gap**: All repos missing `tests/integration.test.js`

## Repos Analyzed

1. `architecture-decision-record`
2. `one-pager`
3. `power-statement-assistant`
4. `pr-faq-assistant`
5. `product-requirements-assistant`
6. `strategic-proposal`

## Adding New Repos

Edit `CONFIG.repos` in `fingerprint.js`:

```javascript
const CONFIG = {
  repos: [
    "architecture-decision-record",
    // ... existing repos
    "new-repo-name",  // Add here
  ],
  // ...
};
```

