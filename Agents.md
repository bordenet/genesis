# AI Agent Guidelines - Genesis

> **Audience**: AI coding assistants only
> **Scope**: All code generation in this repository
> **Last Updated**: 2026-02-06

## Instruction Hierarchy

When instructions conflict, follow this priority order:

1. **This file** (Agents.md) - MUST always be followed
2. **CODE-CONSISTENCY-MANDATE.md** - File categorization rules
3. **Task-specific user instructions** - Current conversation
4. **Style guides and preferences** - Apply only when no conflict with 1-3

## RFC-Style Definitions

| Keyword | Meaning |
|---------|---------|
| **MUST** | Non-negotiable requirement. Violation = broken build or data corruption. |
| **SHOULD** | Strong preference. Deviate only with explicit justification. |
| **MAY** | Optional. Use judgment based on context. |

---

## Golden Rules (MUST Follow)

### Rule 1: Apps Generate PROMPTS, Not Responses

Genesis apps display prompts for users to copy to external AI services. They do NOT call AI APIs directly.

```
✅ RIGHT: "Copy Prompt" button → User pastes to Claude → User pastes response back
❌ WRONG: App calls AI API and displays result
```

### Rule 2: Code Consistency is Non-Negotiable

Every file MUST match [hello-world] exactly, except files in the plugin layer.

```bash
# MUST run before every commit
cd genesis/project-diff && node diff-projects.js --ci
# Expected: ✓ ALL MUST-MATCH FILES ARE IDENTICAL
```

See [CODE-CONSISTENCY-MANDATE.md] for file categorization.

### Rule 3: Different AIs for Different Phases

Phase 1 (Claude) → Phase 2 (Gemini) → Phase 3 (Claude). Same AI all phases = no adversarial review.

### Rule 4: IndexedDB Names MUST Be Unique

All genesis tools share `bordenet.github.io`. Same DB_NAME = data corruption.

```javascript
// MUST customize in js/storage.js AND assistant/js/storage.js
const DB_NAME = '{your-project-name}-db';  // NOT 'hello-world-db'
```

### Rule 5: Wire Event Handlers Immediately

After rendering any button, immediately attach the event handler. Stillborn buttons = broken app.

### Rule 6: Import Document Feature is Standard

Every genesis project MUST include the Import Document feature. This allows users to paste existing documents from Word/Google Docs.

**Required files:**
- `shared/js/lib/turndown.js` - HTML-to-Markdown library (copy from hello-world)
- `shared/js/import-document.js` - Import modal with conversion and scoring

**Required customizations in `import-document.js`:**
```javascript
const DOC_TYPE = 'Your Document Type';      // e.g., 'Business Justification'
const DOC_TYPE_SHORT = 'Document';          // e.g., 'Justification'
const LLM_CLEANUP_PROMPT = `...`;           // Document-specific structure
```

**Required integrations:**
1. `index.html` + `assistant/index.html`: Add `<script src="shared/js/lib/turndown.js"></script>`
2. `shared/js/views.js`: Import `showImportModal` and add Import tile + event handler
3. `eslint.config.js`: Add `TurndownService: 'readonly'` global and `'shared/js/lib/**'` ignore

---

## Verification Checkpoints (MUST Confirm)

Before committing, STOP and confirm all items:

```
CHECKPOINT: Pre-Commit Verification
□ 1. `npm run lint` passed with 0 errors
□ 2. `npm test` passed with ≥70% coverage
□ 3. `cd genesis/project-diff && node diff-projects.js --ci` shows "✓ ALL MUST-MATCH FILES ARE IDENTICAL"
□ 4. No `{{...}}` template variables remain

Confirm items 1-4 complete before proceeding.
```

Before claiming done, STOP and confirm:

```
CHECKPOINT: Completion Verification
□ 1. Web app loads without console errors
□ 2. Dark mode toggle works
□ 3. "New Project" button works
□ 4. All buttons have event handlers wired
□ 5. Import Document tile appears and opens modal
□ 6. Import modal converts pasted HTML to Markdown

Confirm items 1-6 complete before claiming done.
```

---

## Communication Rules (SHOULD Follow)

- **No flattery** - Skip "Great question!" or "Excellent point!"
- **No hype** - Avoid "revolutionary", "game-changing", "seamless"
- **Evidence-based** - Cite sources or qualify as opinion
- **Direct** - State facts without embellishment

**Banned phrases**: production-grade, world-class, leverage, utilize, incredibly, extremely, Happy to help!

[hello-world]: https://github.com/bordenet/genesis/tree/main/genesis/examples/hello-world
[CODE-CONSISTENCY-MANDATE.md]: genesis/CODE-CONSISTENCY-MANDATE.md

---

## Progressive Module Loading (SHOULD Follow)

Load the relevant module BEFORE these actions:

| Trigger | Module |
|---------|--------|
| Writing `.js`/`.ts` | `$HOME/.golden-agents/templates/languages/javascript.md` |
| Writing `.go` | `$HOME/.golden-agents/templates/languages/go.md` |
| Writing `.sh` | `$HOME/.golden-agents/templates/languages/shell.md` |
| Before commit/PR | `$HOME/.golden-agents/templates/workflows/security.md` |
| Tests fail 2+ times | `$HOME/.golden-agents/templates/workflows/testing.md` |

---

## Project Commands

```bash
# JavaScript (all 9 genesis-tools projects)
npm run lint && npm test

# Go (genesis-validator/)
cd genesis-validator && make test lint

# Consistency check (MUST run before commit)
cd genesis/project-diff && node diff-projects.js --ci
```

---

## Coverage Targets

| Language | Minimum |
|----------|---------|
| JavaScript | ≥70% (enforced in jest.config.js) |
| Go | ≥80% |

---

## Specialized Docs (Load On-Demand)

| Topic | Document |
|-------|----------|
| File categorization | [CODE-CONSISTENCY-MANDATE.md] |
| 7-step workflow details | [ADVERSARIAL-WORKFLOW-PATTERN.md] |
| Anti-patterns with examples | [ANTI-PATTERNS.md] |
| UI patterns | [UX-PATTERNS.md] |
| AI slop detection | Copy `slop-detection.js` from hello-world |
| Domain research | Save as `docs/About.md` |

[ADVERSARIAL-WORKFLOW-PATTERN.md]: docs/ADVERSARIAL-WORKFLOW-PATTERN.md
[ANTI-PATTERNS.md]: docs/ANTI-PATTERNS.md
[UX-PATTERNS.md]: docs/UX-PATTERNS.md
