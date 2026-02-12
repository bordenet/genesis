# Genesis Tools

Ecosystem of AI-powered document assistants and validators using a paired architecture.

[![Star this repo](https://img.shields.io/github/stars/bordenet/genesis?style=social)](https://github.com/bordenet/genesis)

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/bordenet/genesis/actions/workflows/ci.yml/badge.svg)](https://github.com/bordenet/genesis/actions/workflows/ci.yml)
[![JS Coverage](https://img.shields.io/badge/JS%20coverage-72%25-yellow.svg)](genesis/examples/hello-world)
[![Go Coverage](https://img.shields.io/badge/Go%20coverage-93%25-brightgreen.svg)](genesis-validator)
[![Dependabot](https://img.shields.io/badge/Dependabot-enabled-blue.svg)](https://github.com/bordenet/genesis/security/dependabot)

---

## Why "genesis"?

Named for the [Genesis Planet](https://memory-alpha.fandom.com/wiki/Genesis_(planet)) in *Star Trek II: The Wrath of Khan*, the life-creating world born from the Mutara Nebula where Spock's torpedo lands. No biblical reference intended; pure sci-fi homage to rapid, emergent creation.

---

## About This Project

Genesis started as an experiment: how deterministic could I make AI-assisted development? The answer: not very! I was fighting nature at every turn. Traditional architecture with AI-generated code on a short leash wins. A useful exercise that revealed how much mutation even the best AI coding agents introduce. See [BACKGROUND.md](BACKGROUND.md) for the full story.

---

## AI-First Development: Lessons Learned

Genesis was an experiment in deterministic AI-assisted development. The conclusion: **architecture-first design with AI iteration beats conformity tooling**.

### What the Industry Data Shows (2026)

| Metric | Finding | Source |
|--------|---------|--------|
| Developer productivity | 26% boost from AI coding assistants | [IT Revolution][1] |
| PR cycle speed | 20-24% faster on routine tasks | [dev.to][2] |
| Complex logic | 10-19% slower due to debugging "almost-right" code | [dev.to][2] |
| Prototype velocity | 16-26% boost for MVPs (3-4 week cycles) | [Coaio][3] |
| AI adoption | 60%+ of companies using AI across multiple functions | [LinkedIn][4] |
| AI agent focus time | Doubling every 7 months (METR data) | [LinkedIn][4] |

### Core Principles That Work

- **Architecture first, AI second:** Define structure upfront, let AI handle implementation details
- **Speed vs. quality trade-offs are real:** Rapid prototyping via AI, human oversight on reliability and security
- **Context engineering matters:** Dedicated files (AGENTS.md, structured prompts) guide AI behavior better than long instructions
- **Tests as guardrails:** Comprehensive coverage catches regressions without mandating line-by-line review

### What Genesis Taught Me

Genesis pushed conformity tooling to its limits: 1,600+ commits, 9 repositories, byte-for-byte diff tools, self-reinforcing AI instructions. It worked, but the maintenance burden compounded. Every improvement required propagation to 9 derived projects.

**The better approach:** A unified codebase with plugin architecture. Shared infrastructure, isolated data, one test suite. This is [DocForgeAI](https://github.com/bordenet/docforge-ai).

[1]: https://itrevolution.com/articles/new-research-reveals-ai-coding-assistants-boost-developer-productivity-by-26-what-it-leaders-need-to-know/
[2]: https://dev.to/austin_welsh/ai-assisted-development-in-2026-best-practices-for-the-modern-developer-3jb0
[3]: https://coaio.com/ai-revolutionizing-software-development/
[4]: https://www.linkedin.com/pulse/5-ai-predictions-executives-cant-ignore-2026-dmitry-sverdlik-igqlf

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

## Further Reading

Industry context and research informing this project's development philosophy:

- [International AI Safety Report 2026: Extended Summary for Policymakers](https://internationalaisafetyreport.org/publication/2026-report-extended-summary-policymakers): Comprehensive analysis of AI capabilities, risks, and governance
- [Claude Opus 4.6 Announcement](https://www.anthropic.com/news/claude-opus-4-6): Anthropic's latest model capabilities (Feb 2026)
- [State of Health AI 2026](https://www.bvp.com/atlas/state-of-health-ai-2026): Bessemer Venture Partners on AI investment trends (55% of health tech funding now AI-focused)

---

## License

MIT License - See [LICENSE](LICENSE) file for details.
