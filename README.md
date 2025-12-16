# Genesis

Project template system for AI-assisted workflow applications.

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/bordenet/genesis/actions/workflows/ci.yml/badge.svg)](https://github.com/bordenet/genesis/actions/workflows/ci.yml)
[![JS Coverage](https://img.shields.io/badge/JS%20coverage-95.7%25-brightgreen.svg)](genesis/examples/hello-world)
[![Go Coverage](https://img.shields.io/badge/Go%20coverage-93.3%25-brightgreen.svg)](genesis-validator)
[![Tests](https://img.shields.io/badge/tests-91%20passing-brightgreen.svg)](genesis/examples/hello-world)
[![Dependabot](https://img.shields.io/badge/Dependabot-enabled-blue.svg)](https://github.com/bordenet/genesis/security/dependabot)

## What This Is

Template system that generates complete web applications for AI-assisted document workflows. Copy templates, run AI assistant, get working app with tests and CI/CD.

---

## Table of Contents

- [What You Get](#what-you-get)
- [How It Works](#how-it-works)
- [Quick Start](#quick-start)
- [Why This Exists](#why-this-exists)
- [Technology Stack](#technology-stack)
- [3-Phase Workflow Pattern](#3-phase-workflow-pattern)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Documentation](#documentation)
- [License](#license)

---

## What You Get

- 44 template files (HTML, JS, CSS, configs, scripts)
- 3-phase workflow pattern for document generation
- GitHub Actions CI/CD (lint, test, deploy)
- IndexedDB storage with export/import
- Dark mode (Tailwind CSS)
- Test suite (Jest, 95%+ coverage)
- Deployment scripts
- Documentation

## How It Works

1. Copy `genesis/` directory to new repository
2. AI assistant reads `START-HERE.md`
3. AI copies templates, replaces variables
4. Push to GitHub
5. Working app deployed to GitHub Pages

**Time**: ~1 hour with AI assistant

---

## Quick Start

**For AI Assistants**: Read [`genesis/START-HERE.md`](genesis/START-HERE.md)

**For Humans**:

```bash
# 1. Copy templates
mkdir my-project
cp -r genesis/ my-project/
cd my-project

# 2. Tell AI assistant
# "Read START-HERE.md and create a project called my-project"

# 3. Push to GitHub
git add .
git commit -m "Initial commit"
gh repo create my-project --public --source=. --push

# 4. Enable GitHub Pages
# Settings → Pages → Source: GitHub Actions

# 5. Visit app
# https://USERNAME.github.io/my-project/
```

---

## Why This Exists

Setting up a new web app with tests, CI/CD, and deployment takes 8-16 hours. Genesis reduces this to ~1 hour by providing pre-configured templates.

**What's included**:
- Project structure (44 files)
- Test suite (Jest, 95%+ coverage)
- CI/CD (GitHub Actions)
- Deployment (GitHub Pages)
- Dark mode (working Tailwind config)
- Storage (IndexedDB with export/import)

**What's validated**:
- 4 review passes
- 27 gaps fixed
- 2 reference implementations
- 128 tests passing

---

## Technology Stack

**Frontend**: HTML5, Tailwind CSS (CDN), Vanilla JavaScript, IndexedDB
**Testing**: Jest, @testing-library/dom, fake-indexeddb
**CI/CD**: GitHub Actions, ESLint, GitHub Pages
**Tools**: npm, Bash scripts

---

## 3-Phase Workflow Pattern

Generated apps use a 3-phase pattern for document creation:

1. **Initial Draft** - User fills form, mock AI generates draft (client-side, instant)
2. **Review** - User copies to external AI for critique, pastes back (2-5 min)
3. **Final** - Mock AI synthesizes both versions (client-side, instant)

**Why 3 phases**: Different AI models provide different perspectives. Phase 2 catches issues Phase 1 missed.

**Customizable**: Change to 2-phase, 5-phase, all-manual, or all-mock modes.

**Mock vs Manual Modes**:
- **Mock**: Runs in browser, instant, template-based (for testing)
- **Manual**: User copies/pastes to external AI (for real quality)

See [`genesis/03-CUSTOMIZATION-GUIDE.md`](genesis/03-CUSTOMIZATION-GUIDE.md) for configuration details.

---

## Project Structure

```
my-project/
├── index.html              # Main app
├── css/styles.css          # Custom styles
├── js/
│   ├── app.js             # Application logic
│   ├── workflow.js        # 3-phase workflow
│   ├── storage.js         # IndexedDB
│   └── ai-mock.js         # Mock AI
├── prompts/               # Phase prompts
├── templates/             # Document templates
├── tests/                 # Jest tests
├── scripts/               # Setup/deploy scripts
├── .github/workflows/     # CI/CD
└── package.json           # Dependencies
```

## Testing

**JavaScript**: 62 tests, 95.4% coverage
**Go Validator**: 42 tests, 93.3% coverage
**CI/CD**: Lint, test, deploy on every push

```bash
npm test                 # Run tests
npm run test:coverage    # Coverage report
npm run lint             # ESLint
```



## Documentation

**For AI Assistants**:
- [`genesis/START-HERE.md`](genesis/START-HERE.md) - Primary entry point
- [`genesis/AI-EXECUTION-CHECKLIST.md`](genesis/AI-EXECUTION-CHECKLIST.md) - Detailed checklist

**For Humans**:
- [`genesis/02-QUICK-START.md`](genesis/02-QUICK-START.md) - Quick start
- [`genesis/03-CUSTOMIZATION-GUIDE.md`](genesis/03-CUSTOMIZATION-GUIDE.md) - Customization
- [`genesis/04-DEPLOYMENT-GUIDE.md`](genesis/04-DEPLOYMENT-GUIDE.md) - Deployment
- [`genesis/TROUBLESHOOTING.md`](genesis/TROUBLESHOOTING.md) - Common issues

## Reference Implementations

**product-requirements-assistant**: [GitHub](https://github.com/bordenet/product-requirements-assistant) | [Demo](https://bordenet.github.io/product-requirements-assistant/)
**one-pager**: [GitHub](https://github.com/bordenet/one-pager) | [Demo](https://bordenet.github.io/one-pager/)

Both demonstrate the 3-phase workflow pattern with working CI/CD and deployment.

---

## Code Coverage

Genesis maintains **high test coverage** across both JavaScript (95.7%) and Go (93.3%) components. The coverage visualization below shows detailed coverage by module:

[![Coverage Grid](https://codecov.io/gh/bordenet/genesis/graphs/tree.svg)](https://codecov.io/gh/bordenet/genesis)

**What this means:**
- **Green**: Well-tested code (>80% coverage)
- **Yellow**: Moderate coverage (60-80%)
- **Red**: Needs more tests (<60%)
- **Size**: Larger boxes = more lines of code

Click the image to explore detailed coverage reports on Codecov, including line-by-line coverage, branch coverage, and historical trends.

---

## License

MIT License - See [LICENSE](LICENSE) file for details.






