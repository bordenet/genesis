# Genesis Examples & Reference Implementations

## 🏗️ Paired Architecture

All Genesis projects now use the **paired model**: each project contains both an **Assistant** (document creation) and a **Validator** (document scoring).

---

## 🔗 Live Paired Projects (PREFERRED)

These are **actively maintained** paired projects. **Use these as your primary reference!**

| Project | Assistant | Validator | Phases |
|---------|-----------|-----------|--------|
| [one-pager](https://github.com/bordenet/one-pager) | [Demo](https://bordenet.github.io/one-pager/) | [Demo](https://bordenet.github.io/one-pager/validator/) | 2 |
| [product-requirements-assistant](https://github.com/bordenet/product-requirements-assistant) | [Demo](https://bordenet.github.io/product-requirements-assistant/) | [Demo](https://bordenet.github.io/product-requirements-assistant/validator/) | 3 |
| [architecture-decision-record](https://github.com/bordenet/architecture-decision-record) | [Demo](https://bordenet.github.io/architecture-decision-record/) | [Demo](https://bordenet.github.io/architecture-decision-record/validator/) | 3 |
| [strategic-proposal](https://github.com/bordenet/strategic-proposal) | [Demo](https://bordenet.github.io/strategic-proposal/) | [Demo](https://bordenet.github.io/strategic-proposal/validator/) | 3 |
| [power-statement-assistant](https://github.com/bordenet/power-statement-assistant) | [Demo](https://bordenet.github.io/power-statement-assistant/) | [Demo](https://bordenet.github.io/power-statement-assistant/validator/) | 3 |
| [pr-faq-assistant](https://github.com/bordenet/pr-faq-assistant) | [Demo](https://bordenet.github.io/pr-faq-assistant/) | [Demo](https://bordenet.github.io/pr-faq-assistant/validator/) | 3 |

### Why Use Live References?

✅ **Always up-to-date** - Bug fixes applied continuously
✅ **Battle-tested** - Real users, real feedback
✅ **Paired structure** - Both assistant and validator working together
✅ **Latest patterns** - Symlinks, CI/CD, GitHub Pages

---

## 📁 Local Template: hello-world/

The `hello-world/` directory is the **template for new projects**. It has the full paired structure:

```
hello-world/
├── assistant/              # Document creation workflow
│   ├── index.html
│   ├── js/
│   │   ├── core -> ../../../assistant-core/src
│   │   └── *.js
│   └── tests/
├── validator/              # Document scoring
│   ├── index.html
│   ├── js/
│   │   ├── core -> ../../../validator-core/src
│   │   └── *.js
│   └── testdata/
└── package.json            # Unified scripts
```

### Creating New Projects

Use the `create-project.sh` script (RECOMMENDED):

```bash
cd genesis/scripts
./create-project.sh --name my-new-tool

# Creates genesis-tools/my-new-tool/ with paired structure
cd ../../my-new-tool
npm install && npm test
```

---

## 🎯 How to Study Paired Projects

### 1. Clone and Explore
```bash
git clone https://github.com/bordenet/one-pager.git
cd one-pager
npm install && npm test
```

### 2. Key Files in Assistant
- `assistant/js/workflow.js` - Phase architecture
- `assistant/prompts/*.md` - Prompt templates
- `assistant/index.html` - Tailwind dark mode setup
- `assistant/tests/*.test.js` - Test patterns

### 3. Key Files in Validator
- `validator/js/validator.js` - Scoring logic
- `validator/js/prompts.js` - AI critique prompts
- `validator/testdata/scoring-fixtures.json` - Test fixtures

### 4. Shared Libraries
Both use core libraries via symlinks:
- `assistant/js/core -> ../../../assistant-core/src`
- `validator/js/core -> ../../../validator-core/src`

---

## ⚠️ IMPORTANT

**Use `create-project.sh`** to create new projects from the hello-world template!

```bash
./scripts/create-project.sh --name my-tool
```

This ensures proper symlinks and paired structure.

---

## 📚 Related Documentation

- [ARCHITECTURE.md](../../ARCHITECTURE.md) - Paired architecture details
- [README.md](../../README.md) - Genesis overview
- [alignment-tools/](../../alignment-tools/) - Scan paired projects

