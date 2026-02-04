# Genesis Examples & Reference Implementations

## 🏗️ Architecture Overview

Genesis has two types of projects:

1. **hello-world** (baseline template): Flat structure (`js/`, `tests/`) for simplicity
2. **Derived projects**: Paired structure (`assistant/`, `validator/`) with symlinks to core libraries

---

## 📁 hello-world/ (Baseline Template)

The `hello-world/` directory is the **canonical reference for shared code**. It has a flat structure:

```
hello-world/
├── index.html              # Main app
├── js/
│   ├── app.js              # Entry point
│   ├── workflow.js         # Phase logic
│   ├── storage.js          # IndexedDB
│   ├── router.js           # Client-side routing
│   ├── error-handler.js    # Error display (MUST_MATCH)
│   └── same-llm-adversarial.js  # LLM adversarial mode (MUST_MATCH)
├── tests/                  # Unit tests
├── tests/e2e/              # E2E tests
├── css/styles.css
├── package.json
├── jest.config.js
└── playwright.config.js
```

**Key principle**: Shared infrastructure files (error-handler.js, same-llm-adversarial.js, etc.) must be byte-for-byte identical across all projects. See `CODE-CONSISTENCY-MANDATE.md`.

---

## 🔗 Derived Projects (Paired Structure)

All 6 derived projects use the **paired model**:

| Project | Assistant | Validator |
|---------|-----------|-----------|
| [one-pager](https://github.com/bordenet/one-pager) | [Demo](https://bordenet.github.io/one-pager/) | [Demo](https://bordenet.github.io/one-pager/validator/) |
| [product-requirements-assistant](https://github.com/bordenet/product-requirements-assistant) | [Demo](https://bordenet.github.io/product-requirements-assistant/) | [Demo](https://bordenet.github.io/product-requirements-assistant/validator/) |
| [architecture-decision-record](https://github.com/bordenet/architecture-decision-record) | [Demo](https://bordenet.github.io/architecture-decision-record/) | [Demo](https://bordenet.github.io/architecture-decision-record/validator/) |
| [strategic-proposal](https://github.com/bordenet/strategic-proposal) | [Demo](https://bordenet.github.io/strategic-proposal/) | [Demo](https://bordenet.github.io/strategic-proposal/validator/) |
| [power-statement-assistant](https://github.com/bordenet/power-statement-assistant) | [Demo](https://bordenet.github.io/power-statement-assistant/) | [Demo](https://bordenet.github.io/power-statement-assistant/validator/) |
| [pr-faq-assistant](https://github.com/bordenet/pr-faq-assistant) | [Demo](https://bordenet.github.io/pr-faq-assistant/) | [Demo](https://bordenet.github.io/pr-faq-assistant/validator/) |

Derived project structure:

```
my-project/
├── assistant/              # Document creation workflow
│   ├── index.html
│   ├── js/
│   │   ├── core -> ../../../assistant-core/src  (symlink)
│   │   └── *.js
│   └── tests/
├── validator/              # Document validation/scoring
│   ├── index.html
│   ├── js/
│   │   ├── core -> ../../../validator-core/src  (symlink)
│   │   └── *.js
│   └── testdata/
├── js/                     # Root js/ mirrors assistant/js/
├── e2e/                    # E2E tests
└── package.json
```

---

## 🛠️ Consistency Tools

### project-diff Tool

Run this to verify all projects are in sync:

```bash
cd genesis/project-diff
node diff-projects.js --ci
```

Compares all 7 projects (6 derived + hello-world) and fails if MUST_MATCH files diverge.

---

## 🎯 Directory Structure Differences

| Aspect | hello-world | Derived Projects |
|--------|-------------|------------------|
| JS files | `js/` | `assistant/js/` and `js/` (mirrored) |
| Unit tests | `tests/` | `assistant/tests/` |
| E2E tests | `tests/e2e/` | `e2e/` |
| Symlinks | None | `assistant/js/core`, `validator/js/core` |
| CI workflow | Simple (no cloning) | Clones core repos, replaces symlinks |

---

## 📚 Related Documentation

- [CODE-CONSISTENCY-MANDATE.md](../CODE-CONSISTENCY-MANDATE.md) - Consistency rules
- [README.md](../README.md) - Genesis overview

