# Hello World - Genesis Baseline

Canonical reference for shared infrastructure code. 2-phase AI workflow app.

---

## Quick Start

```bash
npm install
npm test        # 170 tests
open index.html
```

---

## What This Is

**This is the baseline template.** All 6 derived projects (one-pager, product-requirements-assistant, etc.) must keep their shared infrastructure files byte-for-byte identical to this project.

See `CODE-CONSISTENCY-MANDATE.md` for details.

---

## Directory Structure

```
hello-world/
├── index.html              # Main app
├── js/                     # Source files (source of truth)
│   ├── app.js              # Entry point
│   ├── workflow.js         # Phase logic
│   ├── storage.js          # IndexedDB
│   ├── router.js           # Client-side routing
│   ├── error-handler.js    # Error display (MUST_MATCH)
│   ├── same-llm-adversarial.js  # LLM adversarial (MUST_MATCH)
│   └── ai-mock.js          # Mock responses
├── assistant/
│   ├── js/ -> ../js/       # Symlinks to js/ for test imports
│   ├── css/ -> ../css/     # Symlinks to css/
│   └── tests/              # Jest unit tests
├── e2e/                    # Playwright E2E tests
├── css/styles.css
├── scripts/lib/            # Shell utilities
├── package.json
├── jest.config.js
├── playwright.config.js
└── eslint.config.js
```

**Note**: All projects use unified structure with `assistant/tests/` and `e2e/`. hello-world uses symlinks in `assistant/js/` → `js/`.

---

## MUST_MATCH Files

These files must be identical across all 7 projects:

| File | Purpose |
|------|---------|
| `js/error-handler.js` | Error display |
| `js/same-llm-adversarial.js` | Same-LLM adversarial mode |
| `scripts/lib/compact.sh` | Shell output utilities |
| `scripts/lib/symlinks.sh` | Symlink handling |

Run `project-diff --ci` to verify consistency.

---

## Testing

```bash
npm test              # All 170 tests
npm run test:unit     # Unit tests only
npm run test:e2e      # E2E tests only
npm run test:coverage # With coverage
```

---

## Related Projects

All derived from this template:

- [one-pager](https://github.com/bordenet/one-pager)
- [product-requirements-assistant](https://github.com/bordenet/product-requirements-assistant)
- [architecture-decision-record](https://github.com/bordenet/architecture-decision-record)
- [strategic-proposal](https://github.com/bordenet/strategic-proposal)
- [power-statement-assistant](https://github.com/bordenet/power-statement-assistant)
- [pr-faq-assistant](https://github.com/bordenet/pr-faq-assistant)

