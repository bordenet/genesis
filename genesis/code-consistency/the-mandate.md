# Code Consistency: The Mandate

> Part of [Code Consistency Mandate](../CODE-CONSISTENCY-MANDATE.md)

---

## Rule 1: hello-world Is The Source of Truth

The `genesis/examples/hello-world/` directory is the canonical reference implementation. When creating a new assistant project:

```
hello-world/           →  your-new-project/
├── js/                    ├── js/         (COPY UNCHANGED)
│   ├── error-handler.js   │   ├── error-handler.js
│   ├── storage.js         │   ├── storage.js (modify DB_NAME only)
│   └── ...                │   └── ...
├── tests/                 ├── tests/      (COPY UNCHANGED)
├── validator/             ├── validator/  (COPY UNCHANGED)
├── eslint.config.js       ├── eslint.config.js (COPY UNCHANGED)
└── ...                    └── ...
```

---

## Rule 2: Only These Files May Differ

Files that contain document-type-specific logic are exempt from byte-for-byte matching.
The authoritative list is in `project-diff/diff-projects.js` → `INTENTIONAL_DIFF_PATTERNS`.

**Document-Type Specific Code:**

| File | Why It Differs |
|------|---------------|
| `storage.js` | Contains project-specific `DB_NAME` |
| `app.js` | Different initialization for different document types |
| `workflow.js` | Phase logic specific to document type |
| `project-view.js` | UI rendering specific to document type |
| `views.js` | Form fields specific to document type |
| `router.js` | Routing logic for document type |
| `projects.js` | Project management for document type |
| `prompts/` | LLM prompts specific to document type |
| `templates/` | Output templates specific to document type |
| `prompts.js` | Prompt configuration for document type |
| `ai-mock.js` | Mock data generates fake document content |
| `types.js` | Document schema definitions |
| `validator/js/validator.js` | Validation rules specific to document type |

**Project Identity (contain project name/title):**

| File | Why It Differs |
|------|---------------|
| `README.md`, `package.json` | Project name, description |
| `index.html` (all locations) | `<title>` tag contains project title |
| `scripts/deploy-web.sh` | Contains project-specific paths |
| `Agents.md`, `CLAUDE.md` | Project-specific AI instructions |

> **Note**: `AGENT.md`, `CODEX.md`, `COPILOT.md`, `GEMINI.md`, and `ADOPT-PROMPT.md` are **MUST_MATCH** - they are identical across all projects.

**Test Data and Tests:**

| File | Why It Differs |
|------|---------------|
| `validator/testdata/` | Sample documents for testing |
| Tests for document-specific code | Must test document-specific logic |

**Project Setup/Config:**

| File | Why It Differs |
|------|---------------|
| `.github/dependabot.yml` | Project name in comments |
| `.pre-commit-config.yaml` | Project-specific hooks |
| `scripts/install-hooks.sh` | Project-specific hook installation |
| `scripts/lib/common.sh` | Project-specific shell utilities |
| `scripts/setup-*.sh` | Project-specific setup scripts |

**Config Files (may differ):**

| File | Why It Differs |
|------|---------------|
| `jest.config.js` | Derived projects include validator tests paths |
| `eslint.config.js` | Globals and ignore patterns may differ |
| `.github/workflows/ci.yml` | Derived projects clone core repos; hello-world doesn't |

Everything else **MUST** match hello-world exactly.

---

## Rule 3: Use project-diff Repeatedly

Run the diffing tool **at least 3 times** during development:

1. **After initial scaffolding**: Before writing any custom code
2. **Before each commit**: After every change
3. **Before creating a PR**: Final verification

```bash
# From genesis/project-diff directory
node diff-projects.js --ci

# Expected output for a properly maintained project:
# ✓ ALL MUST-MATCH FILES ARE IDENTICAL
```

If you see divergent files, **STOP** and fix them before proceeding.

