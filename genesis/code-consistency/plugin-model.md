# Code Consistency: The Plugin Model

> Part of [Code Consistency Mandate](../CODE-CONSISTENCY-MANDATE.md)

---

Genesis uses a **plugin model** for document types. The core implementation is stable and shared. Only the "plugin" layer differs per document type.

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR NEW ASSISTANT                       │
├─────────────────────────────────────────────────────────────┤
│  PLUGIN LAYER (varies per document type)                    │
│  ├── storage.js          ← DB_NAME differs per project     │
│  ├── app.js              ← Different imports per project   │
│  ├── workflow.js         ← Phase logic per document type   │
│  ├── project-view.js     ← UI rendering per document type  │
│  ├── views.js            ← Form fields per document type   │
│  ├── router.js           ← Routing per document type       │
│  ├── prompts/            ← Your LLM prompts                │
│  ├── templates/          ← Your output templates           │
│  ├── prompts.js          ← Prompt configuration            │
│  ├── ai-mock.js          ← Mock document content           │
│  ├── types.js            ← Document schema                 │
│  ├── validator.js        ← Your validation rules           │
│  ├── validator-inline.js ← MUST MATCH validator.js scoring │
│  └── import-document.js  ← DOC_TYPE, LLM_CLEANUP_PROMPT    │
├─────────────────────────────────────────────────────────────┤
│  CORE LAYER (NEVER MODIFY - copy from hello-world)         │
│  ├── error-handler.js ← Error display                      │
│  ├── ui.js            ← Clipboard, toasts, modals          │
│  ├── eslint.config.js ← Linting rules                      │
│  ├── jest.config.js   ← Test configuration                 │
│  └── shared test infrastructure                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Why This Model

1. **Bug fixes propagate**: Fix a bug in hello-world, copy to all projects
2. **No hidden surprises**: Every project behaves identically for shared functionality
3. **Easy maintenance**: One source of truth, N copies
4. **Safe customization**: Change only what needs to change

---

## What "Safe Customization" Means

✅ **Safe**: Adding/editing files in `prompts/` or `templates/`
✅ **Safe**: Modifying `prompts.js`, `workflow.js`, `views.js`, `project-view.js`
✅ **Safe**: Modifying `ai-mock.js` with document-specific mock data
✅ **Safe**: Modifying `types.js` with document-specific schema
✅ **Safe**: Changing `DB_NAME` in `storage.js`
✅ **Safe**: Modifying `validator.js` with document-specific validation rules
✅ **Safe**: Modifying `validator-inline.js` with document-specific scoring (MUST match `validator.js`)
✅ **Safe**: Modifying `import-document.js` with document-specific DOC_TYPE and LLM_CLEANUP_PROMPT

❌ **Unsafe**: "Improving" `error-handler.js` with better messages
❌ **Unsafe**: "Optimizing" the clipboard function in `ui.js`
❌ **Unsafe**: "Fixing" ESLint config for your personal preferences
❌ **Unsafe**: Modifying shared test infrastructure

If you think a core file needs improvement, **improve it in hello-world first**, then copy to all projects.

