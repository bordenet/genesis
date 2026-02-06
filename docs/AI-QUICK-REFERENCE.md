# AI Quick Reference - Genesis Projects

**Target: < 200 lines | Read time: 2 minutes | Use this as your cheat sheet**

---

## The Only Pattern You Need to Know

Genesis apps generate **PROMPTS** for external AI services. They do NOT auto-generate AI responses.

```text
User Input → App generates PROMPT → User copies to Claude/Gemini → User pastes response back
```

**Wrong:** App calls AI API and displays result
**Right:** App displays prompt with "Copy to Clipboard" button

---

## The 7-Step Workflow (Memorize This)

| Step | Action | AI Used | What App Does |
|------|--------|---------|---------------|
| 1 | Gather Input | None | Display form, collect user data |
| 2 | Generate Phase 1 Prompt | None | Load template, replace `{variables}`, show "Copy Prompt" |
| 3 | Collect Response | Claude | User pastes response into textarea |
| 4 | Generate Phase 2 Prompt | None | Include `{phase1_output}` in adversarial prompt |
| 5 | Collect Response | Gemini | User pastes critique/improvements |
| 6 | Generate Phase 3 Prompt | None | Include `{phase1_output}` + `{phase2_output}` |
| 7 | Collect Final | Claude | User pastes synthesized document |

**Key Points:**

- Phase 2 uses DIFFERENT AI (Gemini) for adversarial perspective
- Each prompt tells AI to "ask clarifying questions"
- App stores responses, never generates them

---

## Critical Placeholders (snake_case)

```text
{project_name}     - From form input
{project_description} - From form input
{phase1_output}    - AI response from Phase 1
{phase2_output}    - AI response from Phase 2
```

---

## Stillborn App Prevention

After creating ANY button, immediately wire the event handler:

```javascript
// BAD - Button with no handler
container.innerHTML = `<button id="view-btn">View</button>`;

// GOOD - Handler wired immediately
container.innerHTML = `<button id="view-btn">View</button>`;
document.getElementById('view-btn').addEventListener('click', () => { ... });
```

---

## Dark Mode (Always Broken Without This)

In `index.html` head:

```html
<script>
  if (localStorage.theme === 'dark' || (!localStorage.theme && 
      window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
</script>
```

In Tailwind config:

```javascript
module.exports = { darkMode: 'class', ... }
```

---

## Template Variable Replacement

```javascript
function replaceVars(template, vars) {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value || '');
  }
  return result;
}
```

---

## ES6 Modules Only

All browser JS must use ES6:

```javascript
// ✅ CORRECT
import { foo } from './bar.js';
export function baz() { }

// ❌ WRONG (won't work in browser)
const foo = require('./bar');
module.exports = { baz };
```

---

## Quality Gates

Before any commit:

- [ ] All tests pass: `npm test`
- [ ] Lint passes: `npm run lint`
- [ ] Coverage ≥ 85%
- [ ] All buttons have event handlers
- [ ] All template placeholders exist in templates

---

## Anti-Patterns (Don't Do These)

| Anti-Pattern | What's Wrong |
|--------------|--------------|
| Auto-generation | App calls AI API directly |
| Same AI all phases | No adversarial perspective |
| No questions | Single-shot generation |
| Stillborn buttons | UI elements with no handlers |
| Missing placeholders | `{phase1_output}` not in template |

---

## File Locations

| File | Purpose |
|------|---------|
| `prompts/phase1.md` | Phase 1 prompt template |
| `prompts/phase2.md` | Phase 2 adversarial prompt |
| `prompts/phase3.md` | Phase 3 synthesis prompt |
| `js/workflow.js` | Phase logic, prompt generation |
| `js/storage.js` | IndexedDB persistence ⚠️ **MUST CUSTOMIZE** |
| `js/ui.js` | Toast, modals, clipboard |
| `js/slop-detection.js` | AI slop detection (150+ patterns) |
| `js/document-specific-templates.js` | Document-type starter templates |
| `docs/About.md` | Perplexity research Q&A (if applicable) |

---

## 🚨 CRITICAL: IndexedDB Database Names

**Every new project MUST have a unique IndexedDB database name!**

When creating a new project from hello-world, you **MUST** change these values in **BOTH** `js/storage.js` AND `assistant/js/storage.js`:

```javascript
// ❌ WRONG - Using template default
const DB_NAME = 'hello-world-assistant-db';
const STORE_NAME = 'projects';

// ✅ CORRECT - Unique to your project
const DB_NAME = 'my-new-assistant-db';  // Change this!
const STORE_NAME = 'documents';          // Change this!
```

**Why this matters**: All genesis tools are hosted on the same domain (`bordenet.github.io`). IndexedDB databases are scoped by domain, NOT by path. If two tools use the same `DB_NAME`, they will **share data and corrupt each other**.

**Naming convention**:
- `DB_NAME`: `{project-name}-db` (e.g., `business-justification-assistant-db`)
- `STORE_NAME`: Descriptive noun for what you're storing (e.g., `justifications`, `criteria`, `proposals`)

**Files to update**:
1. `js/storage.js` - Root storage module
2. `assistant/js/storage.js` - Assistant storage module
3. `assistant/tests/storage.test.js` - Update test to expect new STORE_NAME

---

## AI Slop Detection

All validators include slop detection to penalize AI-generated content patterns:

```javascript
import { calculateSlopScore, getSlopPenalty } from './slop-detection.js';

// In your validation function:
const slopPenalty = getSlopPenalty(text);
if (slopPenalty.penalty > 0) {
  // Apply penalty to total score
  slopDeduction = Math.min(5, Math.floor(slopPenalty.penalty * 0.6));
}
```

**Detected patterns:**
- Generic boosters (delve, incredibly, truly)
- Buzzwords (robust, seamless, leverage)
- Filler phrases ("it's important to note that")
- Em-dashes (classic AI marker)
- Formulaic introductions

---

## When Stuck

1. Check `docs/ANTI-PATTERNS.md` - Are you doing something wrong?
2. Check `docs/ADVERSARIAL-WORKFLOW-PATTERN.md` - Full pattern details
3. Study https://github.com/bordenet/product-requirements-assistant - Working example

---

## Remember

> "The app generates prompts, not responses. The user is the bridge between your app and the AI services."

**This document is your cheat sheet. Keep it open while coding.**
