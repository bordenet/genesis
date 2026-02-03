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
│   │   ├── prompts.js
│   │   └── core -> symlink
│   └── tests/
├── validator/       # Scores documents against quality dimensions
│   ├── index.html
│   ├── js/
│   │   ├── validator.js
│   │   └── core -> symlink
│   └── tests/
└── package.json
```

### Why Paired?

1. **Quality loop**: Create with assistant → score with validator → iterate
2. **Shared infrastructure**: One repo, one CI pipeline, one deployment
3. **Consistency**: Both apps share styling, storage patterns, test setup
4. **Discoverability**: Users find both tools in one place

---

## Shared Libraries

Common code lives in separate repositories, linked via symlinks:

| Library | Purpose | Repository |
|---------|---------|------------|
| `assistant-core` | Storage, workflow, UI utilities | [bordenet/assistant-core](https://github.com/bordenet/assistant-core) |
| `validator-core` | Storage, UI, clipboard utilities | [bordenet/validator-core](https://github.com/bordenet/validator-core) |

### What's in assistant-core

```javascript
// src/index.js exports:
export { storage } from './storage.js';    // IndexedDB operations
export { workflow } from './workflow.js';   // Phase management
export { ui } from './ui.js';              // Toast, modal, dark mode
```

### What's in validator-core

```javascript
// src/index.js exports:
export { storage } from './storage.js';           // IndexedDB operations
export { ui } from './ui.js';                     // Toast, modal, dark mode
export { copyToClipboard } from './clipboard.js'; // Clipboard utility
```

---

## Symlink Development Pattern

During development, projects use symlinks to core libraries:

```bash
# In my-project/assistant/js/
core -> ../../../assistant-core/src

# In my-project/validator/js/
core -> ../../../validator-core/src
```

### Setting Up Symlinks

```bash
cd my-project/assistant/js
ln -s ../../../assistant-core/src core

cd ../../validator/js
ln -s ../../../validator-core/src core
```

### Benefits

- Edit core once, all projects update immediately
- No npm publish/install cycle during development
- Changes are visible instantly

---

## CI/CD Pattern

GitHub Actions cannot follow symlinks across repositories. The CI workflow:

1. **Clones** core repositories
2. **Replaces** symlinks with actual files
3. **Runs** tests against real code

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    steps:
      - uses: actions/checkout@v4
      
      # Clone core libraries
      - name: Clone assistant-core
        run: git clone https://github.com/bordenet/assistant-core.git ../assistant-core
        
      - name: Clone validator-core
        run: git clone https://github.com/bordenet/validator-core.git ../validator-core
        
      # Replace symlinks with actual files
      - name: Replace symlinks
        run: |
          rm -rf assistant/js/core
          cp -r ../assistant-core/src assistant/js/core
          rm -rf validator/js/core
          cp -r ../validator-core/src validator/js/core
          
      - run: npm install
      - run: npm test
      - run: npm run lint
```

---

## GitHub Pages Deployment

The deploy script handles symlinks similarly:

```bash
# scripts/deploy-web.sh
# 1. Clone core repos
# 2. Replace symlinks with real files
# 3. Deploy to gh-pages branch
```

Both assistant and validator deploy to the same GitHub Pages site:
- `https://username.github.io/my-project/` → assistant
- `https://username.github.io/my-project/validator/` → validator

---

## Creating New Projects

### Using create-project.sh

```bash
cd genesis-tools/genesis
./genesis/scripts/create-project.sh --name document-type
```

This creates:
- Complete project structure
- Symlinks to core libraries
- Pre-configured package.json, jest.config.js, eslint.config.js
- GitHub Actions workflow

### Manual Steps

1. Copy `genesis/examples/hello-world` as template
2. Create symlinks to assistant-core and validator-core
3. Customize `assistant/js/prompts.js` for your document type
4. Customize `validator/js/validator.js` for your scoring dimensions
5. Update package.json name and description
6. Run tests: `npm test`

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

