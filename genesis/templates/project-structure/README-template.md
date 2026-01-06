# {{PROJECT_TITLE}}

<!-- ⚠️ BADGES SECTION - DO NOT DELETE ANY BADGES -->
<!-- These badges provide at-a-glance project health information -->
<!-- CI badge requires: .github/workflows/ci.yml (copy from genesis/templates/github/workflows/ci-template.yml) -->
<!-- Codecov badge requires: Codecov token configured in repository secrets -->

[![CI](https://github.com/{{GITHUB_USER}}/{{GITHUB_REPO}}/actions/workflows/ci.yml/badge.svg)](https://github.com/{{GITHUB_USER}}/{{GITHUB_REPO}}/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/{{GITHUB_USER}}/{{GITHUB_REPO}}/branch/main/graph/badge.svg)](https://codecov.io/gh/{{GITHUB_USER}}/{{GITHUB_REPO}})
[![GitHub Pages](https://img.shields.io/badge/demo-live-brightgreen)]({{GITHUB_PAGES_URL}})
[![Node.js 18+](https://img.shields.io/badge/node-18+-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Linting: ESLint](https://img.shields.io/badge/linting-ESLint-4B32C3)](https://eslint.org/)
[![Testing: Vitest](https://img.shields.io/badge/testing-Vitest-6E9F18)](https://vitest.dev/)
[![Maintained](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/{{GITHUB_USER}}/{{GITHUB_REPO}}/graphs/commit-activity)
[![GitHub issues](https://img.shields.io/github/issues/{{GITHUB_USER}}/{{GITHUB_REPO}}.svg)](https://github.com/{{GITHUB_USER}}/{{GITHUB_REPO}}/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/{{GITHUB_USER}}/{{GITHUB_REPO}}.svg)](https://github.com/{{GITHUB_USER}}/{{GITHUB_REPO}}/pulls)

{{PROJECT_DESCRIPTION}}

**🌐 Try it now: [{{GITHUB_PAGES_URL}}]({{GITHUB_PAGES_URL}})**

---

## 🤖 For AI Assistants

**READ THIS FIRST**: Before working on this codebase, read [`CLAUDE.md`](CLAUDE.md) for mandatory workflow requirements:

- ✅ ALWAYS lint code after creating/modifying it (`npm run lint`)
- ✅ ALWAYS run tests after creating/modifying tests (`npm test`)
- ✅ ALWAYS proactively communicate "what's left" - don't wait to be asked
- ❌ NEVER include `node_modules/`, `coverage/`, or build artifacts
- ❌ NEVER create files without linting and testing them

This ensures high-quality contributions that match professional engineering standards.

---

## Quick Start

### Web App (Recommended)

Use the web app directly in your browser - no installation needed:

**🌐 [Launch Web App]({{GITHUB_PAGES_URL}})**

- ✅ No download required
- ✅ Works on any device (Windows, Mac, Linux, mobile)
- ✅ 100% client-side - all data stored in your browser
- ✅ Privacy-first - no server, no tracking
- ✅ Export/import projects as JSON

### Local Development

If you prefer to run from source or need to customize:

```bash
# Clone repository
git clone https://github.com/{{GITHUB_USER}}/{{GITHUB_REPO}}.git
cd {{GITHUB_REPO}}

# ⚠️ MANDATORY: Use setup script (NEVER manual npm install)
./scripts/setup-macos.sh        # macOS
./scripts/setup-linux.sh        # Linux
./scripts/setup-windows-wsl.sh  # Windows WSL

# Serve web app locally
cd {{DEPLOY_FOLDER}}
python3 -m http.server 8000

# Open http://localhost:8000
```

**Why use setup scripts?**

- ✅ Ensures reproducible environment
- ✅ Installs ALL dependencies (not just npm packages)
- ✅ Fast on subsequent runs (~5-10 seconds)
- ✅ Prevents "works on my machine" problems

---

## What is {{DOCUMENT_TYPE}}?

{{DOCUMENT_TYPE_DESCRIPTION}}

For methodology details, see the [Adversarial AI Workflow documentation](https://github.com/bordenet/genesis).

### When to Use

| ✅ Use When | ⏭️ Skip When |
|-------------|--------------|
| {{USE_CASE_1}} | {{SKIP_CASE_1}} |
| {{USE_CASE_2}} | {{SKIP_CASE_2}} |
| {{USE_CASE_3}} | {{SKIP_CASE_3}} |

---

## How It Works: Adversarial AI Workflow

This tool uses an **adversarial AI approach** with multiple AI models to produce higher-quality outputs:

### Why Two Different AIs?

Using different AI models (e.g., Claude → Gemini → Claude) prevents **confirmation bias**:

- **Single AI**: Tends to agree with itself, missing blind spots
- **Multiple AIs**: Each AI challenges the other's assumptions, catches errors, and improves quality

### Phase Breakdown

<!-- markdownlint-disable MD055 MD056 -->
| Phase | AI Model | Purpose |
|-------|----------|---------|
{{#each PHASES}}
| {{number}}. {{name}} | {{ai_model}} | {{purpose}} |
{{/each}}
<!-- markdownlint-enable MD055 MD056 -->

---

## Quality Criteria

{{DOCUMENT_TYPE}} documents are scored on these criteria:

| Criterion | Weight | Description |
|-----------|--------|-------------|
| {{QUALITY_CRITERION_1}} | {{QUALITY_WEIGHT_1}} | {{QUALITY_DESC_1}} |
| {{QUALITY_CRITERION_2}} | {{QUALITY_WEIGHT_2}} | {{QUALITY_DESC_2}} |
| {{QUALITY_CRITERION_3}} | {{QUALITY_WEIGHT_3}} | {{QUALITY_DESC_3}} |

**Target Score**: 70+ (validated by [genesis-validator](https://github.com/bordenet/genesis))

### Words to Avoid

These fluff words weaken your document. Replace with specific, measurable alternatives:

| ❌ Avoid | ✅ Better Alternative |
|---------|----------------------|
| leverage | use |
| utilize | use |
| robust | reliable, tested |
| scalable | handles 10K users |
| seamless | one-click, automatic |
| innovative | first to market, unique approach |
| cutting-edge | uses [specific technology] |
| synergy | collaboration, combined effect |

---

## Features

- **{{PHASE_COUNT}}-Phase Workflow**: {{WORKFLOW_DESCRIPTION}}
- **AI Integration**: Works with {{PHASE_1_AI}}{{#if PHASE_2_AI}} and {{PHASE_2_AI}}{{/if}}
- **Local Storage**: All data stored in browser using IndexedDB
- **Export/Import**: Save and load projects as JSON files
- **Dark Mode**: Automatic dark mode support
- **Privacy-First**: No server, no tracking, no data collection

## Workflow Details

### Workflow Overview

{{#each PHASES}}
**Phase {{number}}: {{name}}**

- AI Model: {{ai_model}}
- Purpose: {{purpose}}
- Input: {{input}}
- Output: {{output}}

{{/each}}

### Example Usage

1. **Create New Project**: Click "New Project" and enter project details
2. **Phase 1 - {{PHASE_1_NAME}}**:
   - Copy the generated prompt
   - Paste into {{PHASE_1_AI}}
   - Copy AI response back
3. **Phase 2 - {{PHASE_2_NAME}}**:
   - Review Phase 1 output
   - Copy prompt for Phase 2
   - Paste into {{PHASE_2_AI}}
   - Copy AI response back
{{#if PHASE_3_NAME}}
4. **Phase 3 - {{PHASE_3_NAME}}**:
   - Review Phase 2 feedback
   - Copy prompt for Phase 3
   - Paste into {{PHASE_3_AI}}
   - Get final output
{{/if}}
5. **Export**: Download final document as Markdown

---

## Architecture

- **Frontend**: 100% client-side JavaScript (ES6 modules)
- **Storage**: IndexedDB (50MB-10GB capacity)
- **Styling**: Tailwind CSS via CDN
- **Deployment**: GitHub Pages ({{DEPLOY_FOLDER}}/ folder)

<!-- IF {{ENABLE_BACKEND}} -->
### Backend (Optional)

- **Language**: Go 1.21+
- **API**: REST API on port 8080
- **Storage**: Local filesystem or cloud storage
- **Deployment**: Can be deployed to any cloud provider

See [Backend Documentation](docs/architecture/BACKEND.md) for details.
<!-- END IF -->

---

## Project Structure

```text
{{GITHUB_REPO}}/
├── {{DEPLOY_FOLDER}}/              # Web application
│   ├── index.html                  # Main HTML file
│   ├── js/                         # JavaScript modules
│   │   ├── app.js                  # Main application logic
│   │   ├── storage.js              # IndexedDB wrapper
│   │   ├── workflow.js             # {{PHASE_COUNT}}-phase workflow
│   │   ├── ui.js                   # UI helpers
│   │   └── router.js               # Client-side routing
│   ├── css/                        # Styles
│   │   └── styles.css              # Custom styles
│   └── data/                       # Default data
│       └── prompts.json            # Default prompts
├── prompts/                        # Prompt templates
│   ├── phase1.txt                  # Phase 1 prompt
│   ├── phase2.txt                  # Phase 2 prompt
{{#if PHASE_3_NAME}}
│   └── phase3.txt                  # Phase 3 prompt
{{/if}}
├── scripts/                        # Automation scripts
│   ├── setup-macos.sh              # macOS setup
│   ├── setup-linux.sh              # Linux setup
│   └── validate.sh                 # Validation script
├── docs/                           # Documentation
│   ├── architecture/               # Architecture docs
│   ├── deployment/                 # Deployment guides
│   └── development/                # Development guides
└── .github/workflows/              # GitHub Actions
    ├── ci.yml                      # CI/CD pipeline
    └── deploy-web.yml              # Web deployment
```

---

## Development

### Setup

1. **Configure environment** (first time only):

   ```bash
   # Copy environment template
   cp .env.example .env

   # Edit .env and fill in your values
   # - CODECOV_TOKEN: Get from https://codecov.io/gh/{{GITHUB_USER}}/{{GITHUB_REPO}}/settings
   # - Other values: Customize as needed
   ```

2. **Run setup script**:

   ```bash
   # macOS
   ./scripts/setup-macos.sh

   # Linux
   ./scripts/setup-linux.sh

   # Windows (WSL)
   ./scripts/setup-windows-wsl.sh
   ```

### Testing

```bash
# Run validation
./scripts/validate.sh --p1

# Serve locally
cd {{DEPLOY_FOLDER}}
python3 -m http.server 8000
```

### Deployment

**⚠️ MANDATORY: Use deployment script (NEVER manual git commands)**

```bash
# Deploy to GitHub Pages (runs lint, tests, coverage, commit, push)
./scripts/deploy-web.sh

# Deploy with verbose output
./scripts/deploy-web.sh -v

# Deploy skipping tests (emergency only)
./scripts/deploy-web.sh --skip-tests
```

**Why use deployment script?**

- ✅ Enforces quality gates (linting, tests, coverage)
- ✅ Prevents deploying broken code
- ✅ Consistent deployment process
- ✅ Automatic commit messages with timestamps

**❌ NEVER deploy manually:**

```bash
# ❌ WRONG - Bypasses quality checks
git add {{DEPLOY_FOLDER}}
git commit -m "Update web app"
git push origin main
```

Automatic deployment to GitHub Pages on push to `main` branch via GitHub Actions.

---

## Related Projects

| Project | Description |
|---------|-------------|
| [Genesis](https://github.com/bordenet/genesis) | Project template system that generated this app |
| [genesis-validator](https://github.com/bordenet/genesis) | Validates document quality (Go CLI) |
| [product-requirements-assistant](https://github.com/bordenet/product-requirements-assistant) | PRD generation workflow |
| [one-pager](https://github.com/bordenet/one-pager) | One-pager document assistant |
| [pr-faq-assistant](https://github.com/bordenet/pr-faq-assistant) | PR-FAQ document assistant |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Acknowledgments

Built with the [Genesis Project Template System](https://github.com/bordenet/genesis).

---

**Questions?** Open an issue or check the [documentation](docs/).
