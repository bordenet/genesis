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
# From the genesis repo
cd genesis/scripts
./create-project.sh --name my-assistant

# This creates:
#   genesis-tools/my-assistant/
#   ├── assistant/          # Document creation workflow
#   │   ├── index.html
#   │   ├── js/
#   │   │   ├── core -> ../../../assistant-core/src  (symlink)
#   │   │   └── *.js
#   │   └── tests/
#   ├── validator/          # Document validation/scoring
#   │   ├── index.html
#   │   ├── js/
#   │   │   ├── core -> ../../../validator-core/src  (symlink)
#   │   │   └── *.js
#   │   └── testdata/
#   └── package.json
```

### Install and Test

```bash
cd genesis-tools/my-assistant
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

### Shared Libraries

Both components use shared core libraries via symlinks:

- **`assistant-core`** - Storage, workflow, UI utilities for assistants
- **`validator-core`** - Scoring, prompts, validation utilities for validators

```
my-project/
├── assistant/js/core -> ../../../assistant-core/src
└── validator/js/core -> ../../../validator-core/src
```

### CI/CD Pattern

GitHub Actions clones core repos and replaces symlinks before running tests:

```yaml
- run: |
    git clone https://github.com/bordenet/assistant-core.git ../assistant-core
    git clone https://github.com/bordenet/validator-core.git ../validator-core
    rm -rf assistant/js/core validator/js/core
    cp -r ../assistant-core/src assistant/js/core
    cp -r ../validator-core/src validator/js/core
```

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
- Clones core repos, replaces symlinks
- Runs tests for both assistant and validator
- Code coverage tracking

### ✅ Shared Libraries
- `assistant-core` - Common assistant utilities
- `validator-core` - Common validator utilities
- Symlinks for local dev, copied files in CI

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

---

## Troubleshooting

### Symlinks not working locally
```bash
# Verify symlinks point to correct locations
ls -la assistant/js/core
ls -la validator/js/core
# Should show: core -> ../../../assistant-core/src (or validator-core)
```

### GitHub Pages shows 404 for /validator/
- Ensure `validator/index.html` exists
- Check GitHub Actions deployed successfully
- Verify source is set to "GitHub Actions"

### Tests fail in CI but pass locally
- CI replaces symlinks with copied files
- Check that core repos are being cloned correctly
- Verify the `cp -r` commands in workflow

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
- **Alignment Tools**: [`../alignment-tools/`](../alignment-tools/) - Scan paired projects

---

**Ready to create your first paired project?** 🚀

```bash
./scripts/create-project.sh --name my-awesome-tool
```

