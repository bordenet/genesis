# Genesis Tools

Ecosystem of AI-powered document assistants and validators using a paired architecture.

[![Star this repo](https://img.shields.io/github/stars/bordenet/genesis?style=social)](https://github.com/bordenet/genesis)

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/bordenet/genesis/actions/workflows/ci.yml/badge.svg)](https://github.com/bordenet/genesis/actions/workflows/ci.yml)
[![JS Coverage](https://img.shields.io/badge/JS%20coverage-72%25-yellow.svg)](genesis/examples/hello-world)
[![Go Coverage](https://img.shields.io/badge/Go%20coverage-93%25-brightgreen.svg)](genesis-validator)
[![Dependabot](https://img.shields.io/badge/Dependabot-enabled-blue.svg)](https://github.com/bordenet/genesis/security/dependabot)

---

## About This Project

Genesis started as an experiment: how deterministic could I make AI-assisted development? The answer: very—but not worth the effort. See [BACKGROUND.md](BACKGROUND.md) for the full story.

---

## Architecture

Every genesis-tools project contains **BOTH**:

| Component | Purpose | Location |
|-----------|---------|----------|
| **Assistant** | 3-phase AI workflow for creating documents | `assistant/` |
| **Validator** | Score documents against quality dimensions | `validator/` |

**Shared Libraries** (copied into each project's `js/core/` directory):
- [`assistant-core`](https://github.com/bordenet/assistant-core) - UI, storage, workflow utilities
- [`validator-core`](https://github.com/bordenet/validator-core) - UI, storage, scoring utilities

See [ARCHITECTURE.md](ARCHITECTURE.md) for full details on the paired model.

---

## Projects

| Project | Document Type | Assistant | Validator |
|---------|---------------|:---------:|:---------:|
| [one-pager](https://github.com/bordenet/one-pager) | [One-Pager](https://github.com/bordenet/Engineering_Culture/blob/main/SDLC/The_One-Pager.md) | [▶️](https://bordenet.github.io/one-pager/) | [▶️](https://bordenet.github.io/one-pager/validator/) |
| [pr-faq-assistant](https://github.com/bordenet/pr-faq-assistant) | [PR-FAQ](https://github.com/bordenet/Engineering_Culture/blob/main/SDLC/The_PR-FAQ.md) | [▶️](https://bordenet.github.io/pr-faq-assistant/) | [▶️](https://bordenet.github.io/pr-faq-assistant/validator/) |
| [product-requirements-assistant](https://github.com/bordenet/product-requirements-assistant) | [PRD](https://en.wikipedia.org/wiki/Product_requirements_document) | [▶️](https://bordenet.github.io/product-requirements-assistant/) | [▶️](https://bordenet.github.io/product-requirements-assistant/validator/) |
| [power-statement-assistant](https://github.com/bordenet/power-statement-assistant) | Power Statement | [▶️](https://bordenet.github.io/power-statement-assistant/) | [▶️](https://bordenet.github.io/power-statement-assistant/validator/) |
| [strategic-proposal](https://github.com/bordenet/strategic-proposal) | Strategic Proposal | [▶️](https://bordenet.github.io/strategic-proposal/) | [▶️](https://bordenet.github.io/strategic-proposal/validator/) |
| [architecture-decision-record](https://github.com/bordenet/architecture-decision-record) | [ADR](https://adr.github.io/) | [▶️](https://bordenet.github.io/architecture-decision-record/) | [▶️](https://bordenet.github.io/architecture-decision-record/validator/) |
| [jd-assistant](https://github.com/bordenet/jd-assistant) | Job Description | [▶️](https://bordenet.github.io/jd-assistant/) | [▶️](https://bordenet.github.io/jd-assistant/validator/) |
| [acceptance-criteria-assistant](https://github.com/bordenet/acceptance-criteria-assistant) | Acceptance Criteria | [▶️](https://bordenet.github.io/acceptance-criteria-assistant/) | [▶️](https://bordenet.github.io/acceptance-criteria-assistant/validator/) |
| [business-justification-assistant](https://github.com/bordenet/business-justification-assistant) | Business Justification | [▶️](https://bordenet.github.io/business-justification-assistant/) | [▶️](https://bordenet.github.io/business-justification-assistant/validator/) |

9 paired projects, each with 90%+ test coverage and CI/CD.

> **Note:** These tools currently exist as separate repositories with a shared codebase. Enterprise deployment options (monorepo, unified portal, etc.) are under consideration.

---

## Quick Start

### Create a New Paired Project

Follow the step-by-step guide in [`genesis/START-HERE.md`](genesis/START-HERE.md).

This creates a new project with:
- `assistant/` - 3-phase workflow app
- `validator/` - Document scorer
- Pre-configured Jest, ESLint, GitHub Actions

### Alternative: Copy Template Directly

For quick prototyping, copy the `hello-world` template:

```bash
# Copy the paired template
cp -r genesis/examples/hello-world ../my-document
cd ../my-document

# Install dependencies
npm install

# Run tests
npm test

# Start development
# Open assistant/index.html or validator/index.html in browser
```

---

## Project Structure

```
my-project/
├── assistant/                   # Document creation workflow
│   ├── index.html              # Main assistant app
│   ├── css/styles.css          # Custom styles
│   ├── js/
│   │   ├── app.js              # Application logic
│   │   ├── workflow.js         # 3-phase workflow
│   │   ├── prompts.js          # AI prompts
│   │   └── core/               # Shared utilities (from assistant-core)
│   └── tests/                  # Jest tests
├── validator/                   # Document scoring
│   ├── index.html              # Validator app
│   ├── js/
│   │   ├── app.js              # Application logic
│   │   ├── validator.js        # Scoring functions
│   │   └── core/               # Shared utilities (from validator-core)
│   └── tests/                  # Jest tests
├── package.json                # Dependencies
├── jest.config.js              # Test configuration
├── eslint.config.js            # Linting configuration
├── scripts/                    # Setup/deploy scripts
└── .github/workflows/          # CI/CD
```

---

## Shared Libraries

### assistant-core

Common utilities for all assistants:

```javascript
import { storage, workflow, ui } from './core/index.js';

// Save workflow state
await storage.saveProject({ id: 'project-1', name: 'My Document' });

// Get workflow phase
const phase = workflow.getCurrentPhase();

// Show toast notification
ui.showToast('Saved!', 'success');
```

### validator-core

Common utilities for all validators:

```javascript
import { storage, ui, copyToClipboard } from './core/index.js';

// Save validation history
await storage.saveValidation({ score: 85, timestamp: Date.now() });

// Copy to clipboard
await copyToClipboard(documentText);
```

---

## CI/CD Pattern

Each project includes the core libraries as actual files (not symlinks), so CI is straightforward:

```yaml
steps:
  - uses: actions/checkout@v6

  - name: Setup Node.js
    uses: actions/setup-node@v6
    with:
      node-version-file: '.nvmrc'
      cache: 'npm'

  - name: Install dependencies
    run: npm ci

  - name: Lint and test
    run: |
      npm run lint
      npm run test:coverage
```

See [`.github/workflows/ci.yml`](.github/workflows/ci.yml) for the full workflow.

---

## Testing

```bash
npm test                    # Run all tests
npm run test:assistant      # Assistant tests only
npm run test:validator      # Validator tests only
npm run test:coverage       # Coverage report
npm run lint                # ESLint
```

**Coverage targets**: ≥70% (enforced in jest.config.js)

---

## Code Consistency Tools

Check consistency across all 9 genesis projects:

```bash
cd genesis/project-diff
node diff-projects.js --ci          # Check all MUST_MATCH files
node find-orphans.js --ci           # Find orphaned JS files
```

See [`project-diff/README.md`](project-diff/README.md) for full documentation.

---

## Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Paired model, symlinks, CI/CD patterns |
| [genesis/START-HERE.md](genesis/START-HERE.md) | AI assistant entry point |
| [genesis/02-QUICK-START.md](genesis/02-QUICK-START.md) | Quick start guide |
| [genesis/03-CUSTOMIZATION-GUIDE.md](genesis/03-CUSTOMIZATION-GUIDE.md) | Customization options |
| [genesis/04-DEPLOYMENT-GUIDE.md](genesis/04-DEPLOYMENT-GUIDE.md) | GitHub Pages deployment |

---

## License

MIT License - See [LICENSE](LICENSE) file for details.
