# Genesis AI Instructions: Reference Implementations

> Part of [AI Instructions](../01-AI-INSTRUCTIONS.md)

---

## Reference Implementations (Paired Projects)

**⭐ PRIMARY REFERENCE** (study this first):
- [one-pager](https://github.com/bordenet/one-pager) - **Complete paired assistant+validator project**
  - Assistant: https://bordenet.github.io/one-pager/
  - Validator: https://bordenet.github.io/one-pager/validator/

---

## ✅ All Paired Projects

| Project | Assistant | Validator |
|---------|-----------|-----------|
| [one-pager](https://github.com/bordenet/one-pager) | [Demo](https://bordenet.github.io/one-pager/) | [Demo](https://bordenet.github.io/one-pager/validator/) |
| [product-requirements-assistant](https://github.com/bordenet/product-requirements-assistant) | [Demo](https://bordenet.github.io/product-requirements-assistant/) | [Demo](https://bordenet.github.io/product-requirements-assistant/validator/) |
| [architecture-decision-record](https://github.com/bordenet/architecture-decision-record) | [Demo](https://bordenet.github.io/architecture-decision-record/) | [Demo](https://bordenet.github.io/architecture-decision-record/validator/) |
| [strategic-proposal](https://github.com/bordenet/strategic-proposal) | [Demo](https://bordenet.github.io/strategic-proposal/) | [Demo](https://bordenet.github.io/strategic-proposal/validator/) |
| [pr-faq-assistant](https://github.com/bordenet/pr-faq-assistant) | [Demo](https://bordenet.github.io/pr-faq-assistant/) | [Demo](https://bordenet.github.io/pr-faq-assistant/validator/) |
| [power-statement-assistant](https://github.com/bordenet/power-statement-assistant) | [Demo](https://bordenet.github.io/power-statement-assistant/) | [Demo](https://bordenet.github.io/power-statement-assistant/validator/) |

---

## ❌ What NOT to Do

- Using `require()` in browser code
- Using `module.exports` in browser code
- Defining event handlers without attaching them
- Leaving `{{TEMPLATE_VAR}}` unreplaced
- Creating standalone assistant-only or validator-only projects (use paired model)

---

## Common Failures and Fixes

| Symptom | Cause | Fix |
|---------|-------|-----|
| "require is not defined" | CommonJS in browser | Replace with ES6 `import` |
| "process is not defined" | Node.js globals in browser | Guard with `typeof process !== 'undefined'` |
| "Cannot find module" | Wrong module syntax | Use ES6 `export` |
| Buttons don't work | Missing event listeners | Add `addEventListener()` calls |
| Dark mode broken | Missing Tailwind config | Add `tailwind.config = { darkMode: 'class' }` |
| `{{VAR}}` in output | Template not replaced | Replace all template variables |
| Gray GitHub text | Footer link not styled | Ensure `<a>` tag wraps GitHub text |
| **Score discrepancy between Assistant and Validator** | `validator-inline.js` has different scoring than `validator.js` | Align scoring dimensions in both files - see [Web App Customization](../customization-guide/web-app.md#-critical-validator-alignment-validator-inlinejs) |
| **Title shows as `{Document Title}`** | `extractTitleFromMarkdown()` matched template placeholder | Add check: `if (title.includes('{')) return null` |

