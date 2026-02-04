# Genesis Tools Architecture

This document explains the paired architecture used by all genesis-tools projects.

---

## Paired Project Model

Every genesis-tools project contains **both** an assistant and a validator:

```
my-project/
├── assistant/       # Creates documents via 3-phase AI workflow
│   ├── index.html
│   ├── js/
│   │   ├── app.js
│   │   ├── workflow.js
│   │   ├── storage.js
│   │   ├── prompts.js
│   │   └── ...
│   └── tests/
├── validator/       # Scores documents against quality dimensions
│   ├── index.html
│   ├── js/
│   │   ├── app.js
│   │   ├── validator.js
│   │   └── ...
│   └── tests/
├── js/              # Mirror of assistant/js/ (for root deployment)
└── package.json
```

### Why Paired?

1. **Quality loop**: Create with assistant → score with validator → iterate
2. **Shared infrastructure**: One repo, one CI pipeline, one deployment
3. **Consistency**: Both apps share styling, storage patterns, test setup
4. **Discoverability**: Users find both tools in one place

---

## Self-Contained Projects

Each project is **self-contained with real directories** (no symlinks):

- All code lives directly in the project repo
- No external repositories required for development or CI/CD
- Clone and run - simple setup

### Reference Libraries

The patterns used in each project were derived from these reference repos:

| Library | Purpose | Repository |
|---------|---------|------------|
| `assistant-core` | Reference storage, workflow, UI patterns | [bordenet/assistant-core](https://github.com/bordenet/assistant-core) |
| `validator-core` | Reference storage, UI, clipboard patterns | [bordenet/validator-core](https://github.com/bordenet/validator-core) |

> **Note**: These are reference repos for pattern development. Child projects have real copies of the code, not symlinks.

---

## CI/CD Pattern

Since projects are self-contained, CI/CD is straightforward:

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    steps:
      - uses: actions/checkout@v4
      - run: npm install
      - run: npm test
      - run: npm run lint
```

No symlink handling, no external clones needed.

---

## GitHub Pages Deployment

Deploy directly to GitHub Pages:

```bash
# scripts/deploy-web.sh
# 1. Build assets
# 2. Deploy to gh-pages branch
```

Both assistant and validator deploy to the same GitHub Pages site:
- `https://username.github.io/my-project/` → assistant
- `https://username.github.io/my-project/validator/` → validator

---

## Creating New Projects

### From hello-world Template

```bash
# Copy the canonical template
cp -r genesis/examples/hello-world my-new-tool

cd my-new-tool
npm install
npm test
```

### Customization Steps

1. Copy `genesis/examples/hello-world` as template
2. Customize `assistant/js/prompts.js` for your document type
3. Customize `validator/js/validator.js` for your scoring dimensions
4. Update package.json name and description
5. Run tests: `npm test`
6. **Run project-diff tools** to verify alignment

### Maintaining Consistency

**Use the project-diff tools REPEATEDLY during development:**

```bash
# From genesis/project-diff directory
node diff-projects.js --ci    # Check MUST_MATCH files are identical
node find-orphans.js          # Find JS files that are never imported
```

Run these at least:
1. After initial scaffolding
2. Before every commit
3. Before creating a PR

---

## Customizing Validators

Each validator has custom scoring dimensions. Example for one-pager:

```javascript
// validator/js/validator.js
const SCORING_DIMENSIONS = {
  problemStatement: { weight: 25, maxPoints: 25 },
  solution: { weight: 25, maxPoints: 25 },
  metrics: { weight: 25, maxPoints: 25 },
  callToAction: { weight: 25, maxPoints: 25 }
};
```

Each project defines dimensions appropriate to its document type.

---

## Directory Conventions

| Path | Purpose |
|------|---------|
| `assistant/js/prompts.js` | AI prompts for 3-phase workflow |
| `assistant/js/app.js` | Main application entry point |
| `validator/js/validator.js` | Scoring functions and dimensions |
| `validator/testdata/` | Fixture files for validator tests |
| `scripts/deploy-web.sh` | GitHub Pages deployment |
| `.github/workflows/ci.yml` | CI/CD pipeline |

