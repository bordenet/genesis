# Step 1: Gather Requirements

> **For Claude:** Ask the user ONLY these essential questions.
> **Time Budget:** 5 minutes
> **Exit Criteria:** All required variables captured and stored.

---

## Entry Conditions

- [ ] Completed [Step 0: Prerequisites](00-prerequisites.md)
- [ ] User is ready to provide project details

---

## Required Questions

Ask the user these questions (copy/paste this block):

```
I need the following information to create your project:

1. **Project name?** (e.g., "one-pager") — lowercase, hyphenated
2. **Project title?** (e.g., "One-Pager Assistant") — display name
3. **One-line description?**
4. **GitHub username?**
5. **GitHub repo name?**
6. **Document type?** (e.g., "One-Pager", "PRD", "Design Doc")
7. **Link to document template/example?** (if available)
8. **Deviations from standard 3-phase workflow?** (default: NO)
9. **🔗 Peer site navigation?** Should this link to related tools? If yes, provide URLs and titles.
10. **📄 GitHub Pages model?**
    - Option A: Serve from /docs folder (needs deploy script)
    - Option B: Serve from / (root) — RECOMMENDED for simple web apps
```

---

## Variable Storage

Store the user's answers as template variables:

| Variable | Example Value |
|----------|---------------|
| `{{PROJECT_NAME}}` | `one-pager` |
| `{{PROJECT_TITLE}}` | `One-Pager Assistant` |
| `{{PROJECT_DESCRIPTION}}` | `Create professional one-page documents` |
| `{{GITHUB_USER}}` | `bordenet` |
| `{{GITHUB_REPO}}` | `one-pager` |
| `{{GITHUB_PAGES_URL}}` | `https://bordenet.github.io/one-pager/` |
| `{{DOCUMENT_TYPE}}` | `One-Pager` |
| `{{HEADER_EMOJI}}` | `📄` |
| `{{FAVICON_EMOJI}}` | `📄` |
| `{{PHASE_1_AI}}` | `Claude Sonnet 4.5` |
| `{{PHASE_2_AI}}` | `Gemini 2.5 Pro` |
| `{{PHASE_3_AI}}` | `Claude Sonnet 4.5` |

---

## DO NOT ASK (Infer from defaults)

- ❌ How many phases? (Default: 3)
- ❌ Should prompts be in files? (YES — always in `prompts/` directory)
- ❌ Should templates be abstracted? (YES — always in `templates/` directory)
- ❌ How should mock mode work? (See product-requirements-assistant)
- ❌ Should Phase 1 have a form? (YES — if document is structured)

---

## ⛔ Exit Criteria (ALL MUST PASS)

```bash
# Verify you have all required variables (mentally check):
# - [ ] PROJECT_NAME is set (lowercase, hyphenated)
# - [ ] PROJECT_TITLE is set
# - [ ] PROJECT_DESCRIPTION is set
# - [ ] GITHUB_USER is set
# - [ ] GITHUB_REPO is set
# - [ ] DOCUMENT_TYPE is set
# - [ ] User has confirmed peer site navigation (yes/no)
# - [ ] User has confirmed GitHub Pages model (A or B)

echo "All required variables captured: ✅"
```

### Verification Checklist

- [ ] All 10 questions answered
- [ ] Variables stored for template replacement
- [ ] Peer site navigation decision recorded
- [ ] GitHub Pages model confirmed

---

## 🚫 DO NOT PROCEED if:

- Any required variable is missing
- User hasn't confirmed GitHub Pages model
- You're unsure about the document type

---

**Next Step:** [Step 2: Domain Research →](02-domain-research.md)

