# {{PROJECT_TITLE}}

{{PROJECT_DESCRIPTION}}

**Live Demo**: [{{GITHUB_USER}}.github.io/{{PROJECT_NAME}}](https://{{GITHUB_USER}}.github.io/{{PROJECT_NAME}}/)

[![CI](https://github.com/{{GITHUB_USER}}/{{PROJECT_NAME}}/actions/workflows/ci.yml/badge.svg)](https://github.com/{{GITHUB_USER}}/{{PROJECT_NAME}}/actions)
[![codecov](https://codecov.io/gh/{{GITHUB_USER}}/{{PROJECT_NAME}}/branch/main/graph/badge.svg)](https://codecov.io/gh/{{GITHUB_USER}}/{{PROJECT_NAME}})

---

## Quick Start

1. Visit the [live demo](https://{{GITHUB_USER}}.github.io/{{PROJECT_NAME}}/)
2. Fill in the form with your context and requirements
3. Copy the generated prompt and paste into Claude/Gemini
4. Paste the AI response back to proceed through all phases
5. Export your completed document as Markdown

## Features

- **Three-Phase AI Workflow**: Initial draft → Adversarial review → Synthesis
- **Privacy-First**: All data stored locally in your browser (IndexedDB)
- **No Account Required**: Works immediately, no signup needed
- **Export to Markdown**: Download your completed document
- **Dark Mode**: Toggle between light and dark themes
- **Project Management**: Create, save, and manage multiple documents

## Workflow

### Phase 1: Initial Draft
Enter your context and requirements. Copy the generated prompt to Claude to create an initial draft.

### Phase 2: Adversarial Review
The initial draft is reviewed critically by Gemini to identify gaps, weaknesses, and improvements.

### Phase 3: Synthesis
Claude synthesizes the initial draft with the adversarial feedback to produce a final, polished document.

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/{{GITHUB_USER}}/{{PROJECT_NAME}}.git
cd {{PROJECT_NAME}}
npm install
```

### Testing

```bash
# Run all tests
npm test

# Run linting
npm run lint

# Fix lint issues
npm run lint:fix
```

### Local Development

```bash
# Start local server
npm run serve

# Open http://localhost:8000
```

## Project Structure

```
{{PROJECT_NAME}}/
├── js/                    # JavaScript modules
│   ├── app.js            # Main application entry
│   ├── workflow.js       # Phase orchestration
│   ├── storage.js        # IndexedDB operations
│   ├── ui.js             # UI utilities
│   └── ...
├── tests/                 # Jest test files
├── prompts/              # AI prompt templates
│   ├── phase1.md
│   ├── phase2.md
│   └── phase3.md
├── index.html            # Main HTML file
└── docs/                 # Documentation
```

## Part of Genesis Tools

This project is generated and maintained using [Genesis](https://github.com/{{GITHUB_USER}}/genesis), ensuring consistency across all document-generation tools:

- [Architecture Decision Record](https://github.com/{{GITHUB_USER}}/architecture-decision-record)
- [One-Pager](https://github.com/{{GITHUB_USER}}/one-pager)
- [Power Statement Assistant](https://github.com/{{GITHUB_USER}}/power-statement-assistant)
- [PR/FAQ Assistant](https://github.com/{{GITHUB_USER}}/pr-faq-assistant)
- [Product Requirements Assistant](https://github.com/{{GITHUB_USER}}/product-requirements-assistant)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](LICENSE)

