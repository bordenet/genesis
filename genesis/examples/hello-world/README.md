# {{PROJECT_TITLE}}

{{PROJECT_DESCRIPTION}}

[![Star this repo](https://img.shields.io/github/stars/{{GITHUB_USER}}/{{GITHUB_REPO}}?style=social)](https://github.com/{{GITHUB_USER}}/{{GITHUB_REPO}})

**Try it**: [Assistant](https://{{GITHUB_USER}}.github.io/{{GITHUB_REPO}}/) · [Validator](https://{{GITHUB_USER}}.github.io/{{GITHUB_REPO}}/validator/)

[![CI](https://github.com/{{GITHUB_USER}}/{{GITHUB_REPO}}/actions/workflows/ci.yml/badge.svg)](https://github.com/{{GITHUB_USER}}/{{GITHUB_REPO}}/actions)
[![codecov](https://codecov.io/gh/{{GITHUB_USER}}/{{GITHUB_REPO}}/branch/main/graph/badge.svg)](https://codecov.io/gh/{{GITHUB_USER}}/{{GITHUB_REPO}})

---

## Quick Start

1. Open the [demo](https://{{GITHUB_USER}}.github.io/{{GITHUB_REPO}}/)
2. Enter your inputs
3. Copy prompt → paste into Claude → paste response back
4. Repeat for review (Gemini) and synthesis (Claude)
5. Export as Markdown

## What It Does

- **Draft → Review → Synthesize**: Claude writes, Gemini critiques, Claude refines
- **Browser storage**: Data stays in IndexedDB, nothing leaves your machine
- **No login**: Just open and use
- **Dark mode**: Toggle in the UI

## How the Phases Work

**Phase 1** — You provide context. Claude drafts your {{DOCUMENT_TYPE}}.

**Phase 2** — Gemini reviews the draft: What's missing? What's unclear? What's wrong?

**Phase 3** — Claude takes the original draft plus Gemini's critique and produces a final version.

---

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/{{GITHUB_USER}}/{{GITHUB_REPO}}.git
cd {{GITHUB_REPO}}
npm install
```

### Testing

```bash
npm test        # Run all tests
npm run lint    # Run linting
npm run lint:fix # Fix lint issues
```

---

## Scoring Methodology

The validator scores documents on a **100-point scale**. For complete methodology details including scoring dimensions, detection patterns, adversarial robustness, and calibration notes, see **[docs/Scoring_Methods.md](./docs/Scoring_Methods.md)**.

---

## Paired Architecture

Every project has a **paired architecture**:

- **assistant/** - 3-phase AI workflow for creating documents
- **validator/** - Document scoring and validation tool

---

## Project Structure

```
{{GITHUB_REPO}}/
├── index.html              # Main entry point
├── js/                     # JavaScript modules
│   ├── app.js              # Application entry
│   ├── workflow.js         # Phase orchestration
│   ├── storage.js          # IndexedDB operations
│   └── ...
├── assistant/              # Assistant web app
│   ├── index.html
│   └── js/
├── validator/              # Validator web app
│   ├── index.html
│   └── js/
├── tests/                  # Jest test files
├── prompts/                # AI prompt templates
│   ├── phase1.md
│   ├── phase2.md
│   └── phase3.md
└── e2e/                    # Playwright E2E tests
```

---

## Part of Genesis Tools

Built with [Genesis](https://github.com/bordenet/genesis). Related tools:

| Project | Document Type |
|---------|---------------|
| [One-Pager](https://github.com/bordenet/one-pager) | Executive summaries |
| [Power Statement Assistant](https://github.com/bordenet/power-statement-assistant) | Value propositions |
| [PR/FAQ Assistant](https://github.com/bordenet/pr-faq-assistant) | Press release / FAQ |
| [Product Requirements Assistant](https://github.com/bordenet/product-requirements-assistant) | Product specs |
| [Strategic Proposal](https://github.com/bordenet/strategic-proposal) | Strategic documents |
| [Business Justification Assistant](https://github.com/bordenet/business-justification-assistant) | Business cases |
| [JD Assistant](https://github.com/bordenet/jd-assistant) | Job descriptions |
| [Acceptance Criteria Assistant](https://github.com/bordenet/acceptance-criteria-assistant) | User story acceptance |
| [Architecture Decision Record](https://github.com/bordenet/architecture-decision-record) | ADRs |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](LICENSE)

