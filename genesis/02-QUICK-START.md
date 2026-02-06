# Genesis Quick Start Guide

**For Humans**: This is a human-readable quick start. For AI instructions, see [`START-HERE.md`](START-HERE.md).

---

## What is Genesis?

Genesis is a **project template system** for creating **paired assistant+validator** applications. Each project contains:
- **Assistant** (`/`) - AI workflow for document creation (3-phase pattern)
- **Validator** (`/validator/`) - Quality scoring for completed documents

**Use Cases**:
- One-Pager document generator + validator
- ADR (Architecture Decision Record) generator + validator
- PRD (Product Requirements Document) generator + validator
- Strategic Proposal generator + validator
- Any document workflow needing creation AND validation

---

## Quick Start (Recommended)

### Create a New Paired Project

```bash
# Copy from hello-world template
cp -r genesis/examples/hello-world my-assistant

# This creates:
#   my-assistant/
#   ├── assistant/          # Document creation workflow
#   │   ├── index.html
#   │   ├── js/             # Real directory (no symlinks)
#   │   │   ├── app.js, workflow.js, storage.js, ...
#   │   └── tests/
#   ├── validator/          # Document validation/scoring
#   │   ├── index.html
#   │   ├── js/             # Real directory (no symlinks)
#   │   │   ├── app.js, validator.js
#   │   └── testdata/
#   ├── js/                 # Mirror of assistant/js/ (root deployment)
#   └── package.json
```

### Install and Test

```bash
cd my-assistant
npm install
npm test
```

### Serve Locally

```bash
npm run serve
# Visit http://localhost:8000/assistant/
# Visit http://localhost:8000/validator/
```

---

## Paired Architecture

### Why Paired?

Every document type benefits from both creation AND validation:

| Component | Purpose | User Experience |
|-----------|---------|-----------------|
| **Assistant** | Guide users through structured document creation | Form-based, 3-phase AI workflow |
| **Validator** | Score documents against quality criteria | Paste document, get scores + feedback |

### Self-Contained Projects

Each project is **self-contained with real directories** (no symlinks):

- All code lives directly in the project repo
- No external repos required for local development
- Simple CI/CD - just clone and run

### Keeping Projects Aligned

Use the **project-diff tools** to maintain consistency across all 9 projects:

```bash
# From genesis/project-diff directory
node diff-projects.js --ci    # Check MUST_MATCH files are identical
node find-orphans.js          # Find JS files that are never imported
```

Run these tools **at least 3 times** during development:
1. After initial scaffolding
2. Before every commit
3. Before creating a PR

---

## What You Get

### ✅ Paired Web Applications
- **Assistant**: 3-phase AI document workflow
- **Validator**: Quality scoring with weighted dimensions
- Both 100% client-side, no backend needed
- IndexedDB storage, dark mode, responsive design

### ✅ GitHub Pages Deployment
- Assistant at `https://user.github.io/project/`
- Validator at `https://user.github.io/project/validator/`
- Automatic deployment on push

### ✅ CI/CD Pipeline
- Simple `npm ci && npm test` workflow
- Runs tests for both assistant and validator
- Code coverage tracking

### ✅ Shared Libraries
- Core utilities are copied into each project's `js/core/` directory
- Source repos: [`assistant-core`](https://github.com/bordenet/assistant-core), [`validator-core`](https://github.com/bordenet/validator-core)

---

## Examples

### Hello World (Template)
See [`examples/hello-world/`](examples/hello-world/) - the template used by `create-project.sh`.

**Structure**:
```
hello-world/
├── assistant/     # Working assistant example
├── validator/     # Working validator example
└── package.json   # Unified test/lint scripts
```

### Live Paired Projects

| Project | Assistant | Validator |
|---------|-----------|-----------|
| One-Pager | [Demo](https://bordenet.github.io/one-pager/) | [Demo](https://bordenet.github.io/one-pager/validator/) |
| PRD | [Demo](https://bordenet.github.io/product-requirements-assistant/) | [Demo](https://bordenet.github.io/product-requirements-assistant/validator/) |
| ADR | [Demo](https://bordenet.github.io/architecture-decision-record/) | [Demo](https://bordenet.github.io/architecture-decision-record/validator/) |
| Strategic Proposal | [Demo](https://bordenet.github.io/strategic-proposal/) | [Demo](https://bordenet.github.io/strategic-proposal/validator/) |
| Power Statement | [Demo](https://bordenet.github.io/power-statement-assistant/) | [Demo](https://bordenet.github.io/power-statement-assistant/validator/) |
| PR-FAQ | [Demo](https://bordenet.github.io/pr-faq-assistant/) | [Demo](https://bordenet.github.io/pr-faq-assistant/validator/) |
| Job Description | [Demo](https://bordenet.github.io/jd-assistant/) | [Demo](https://bordenet.github.io/jd-assistant/validator/) |
| Acceptance Criteria | [Demo](https://bordenet.github.io/acceptance-criteria-assistant/) | [Demo](https://bordenet.github.io/acceptance-criteria-assistant/validator/) |
| Business Justification | [Demo](https://bordenet.github.io/business-justification-assistant/) | [Demo](https://bordenet.github.io/business-justification-assistant/validator/) |

---

## Troubleshooting

### Core files missing
```bash
# Verify core directories exist with actual files
ls -la assistant/js/core
ls -la validator/js/core
# Should show: index.js, storage.js, ui.js, etc.
```

### GitHub Pages shows 404 for /validator/
- Ensure `validator/index.html` exists
- Check GitHub Actions deployed successfully
- Verify source is set to "GitHub Actions"

### Tests fail in CI but pass locally
- Check Node.js version matches `.nvmrc`
- Verify `npm ci` completes without errors
- Check for environment-specific path issues

---

## Next Steps

1. **Customize assistant**: Edit `assistant/js/workflow.js` and `assistant/prompts/`
2. **Customize validator**: Edit `validator/js/validator.js` and scoring weights
3. **Add branding**: Update `index.html` files and CSS
4. **Deploy**: Push to main, GitHub Actions handles the rest

---

## Documentation

- **Architecture**: [`../ARCHITECTURE.md`](../ARCHITECTURE.md) - Detailed paired model docs
- **Start Here**: [`START-HERE.md`](START-HERE.md) - AI assistant entry point
- **Code Consistency**: [`../project-diff/`](../project-diff/) - Check consistency across all 9 projects

---

**Ready to create your first paired project?** 🚀

```bash
./scripts/create-project.sh --name my-awesome-tool
```

