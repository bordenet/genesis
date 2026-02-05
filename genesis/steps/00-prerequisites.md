# Step 0: Prerequisites

> **For Claude:** Execute this step BEFORE any project work begins.
> **Time Budget:** 5-10 minutes
> **Exit Criteria:** All verification commands must pass before proceeding to Step 1.

---

## Directory Structure

Genesis projects use a **sibling directory layout**:

```
genesis-tools/              ← Parent workspace
├── genesis/                ← Genesis templates (THIS repo)
│   ├── genesis/
│   │   ├── examples/
│   │   │   └── hello-world/  ← Copy files FROM here
│   │   └── steps/
│   └── project-diff/
├── one-pager/              ← Example sibling project
├── jd-assistant/           ← Your NEW project goes here
└── ... other projects
```

**Key points:**
1. You create the new project as a **sibling** to `genesis/`, NOT inside it
2. You **copy** files FROM `genesis/genesis/examples/hello-world/` TO your new project
3. The `genesis/project-diff/` tool checks ALL sibling projects for consistency

---

## Entry Conditions

- [ ] You are in the `genesis-tools/` workspace (or equivalent)
- [ ] The `genesis/` directory exists as a sibling to where you'll create the project
- [ ] User has requested a new genesis project

---

## Required Reading (in order)

Before touching any templates, you MUST study these files:

1. **[`docs/AI-QUICK-REFERENCE.md`](../../docs/AI-QUICK-REFERENCE.md)** ⭐ **CHEAT SHEET** — Keep this open while coding (~130 lines)
2. **[`docs/ADVERSARIAL-WORKFLOW-PATTERN.md`](../../docs/ADVERSARIAL-WORKFLOW-PATTERN.md)** — The 7-step pattern
3. **[`docs/ANTI-PATTERNS.md`](../../docs/ANTI-PATTERNS.md)** — What NOT to do
4. **[`CODE-CONSISTENCY-MANDATE.md`](../CODE-CONSISTENCY-MANDATE.md)** — Deviation from hello-world is FORBIDDEN
5. **Live example**: https://github.com/bordenet/product-requirements-assistant

---

## Critical Understanding

### The 7-Step Workflow Pattern

Genesis apps implement a **7-STEP workflow pattern**:
- **WRONG**: Auto-generating AI responses
- **RIGHT**: Generating prompts for external AI

### Dark Mode Fix (MANDATORY)

**EVERY Genesis project has broken dark mode without this fix:**

```html
<!-- In HTML <head> -->
<script src="https://cdn.tailwindcss.com"></script>
<script>
    tailwind.config = {
        darkMode: 'class'  // ← CRITICAL: Without this, toggle won't work!
    }
</script>
```

### Paired Architecture

All Genesis projects have TWO components:
- **`assistant/`** — Document creation workflow (3-phase)
- **`validator/`** — Document validation/scoring

### GitHub Pages Architecture

Genesis projects use a specific file layout for deployment:

| Path | Purpose |
|------|---------|
| `/` (root) | Web app entry point (index.html) |
| `/assistant/` | Assistant web app |
| `/validator/` | Validator web app |
| `/docs/` | Markdown documentation ONLY (not web app!) |

**Important:**
- The web app is served from root (`/`), NOT from `/docs`
- The `/docs` folder contains design documents (DESIGN-PATTERNS.md, UI_STYLE_GUIDE.md)
- GitHub Pages is configured with "Source: GitHub Actions" (not "Deploy from branch")
- CI workflow handles lint/test; deployment is configured separately in repo settings

---

## ⛔ Exit Criteria (ALL MUST PASS)

```bash
# 1. Verify genesis directory exists
[ -d "genesis" ] && echo "✅ PASS: genesis/ exists" || echo "❌ BLOCKED: genesis/ not found"

# 2. Verify you've read the reference files (ask yourself):
# - [ ] I understand the 7-step workflow pattern
# - [ ] I understand why dark mode requires tailwind.config
# - [ ] I understand the paired assistant+validator architecture
# - [ ] I understand that deviation from hello-world is FORBIDDEN
```

### Verification Checklist

Before proceeding to Step 1, confirm:

- [ ] Read AI-QUICK-REFERENCE.md
- [ ] Read ADVERSARIAL-WORKFLOW-PATTERN.md
- [ ] Read CODE-CONSISTENCY-MANDATE.md
- [ ] Understand paired architecture (assistant + validator)
- [ ] Know the dark mode fix

---

## 🚫 DO NOT PROCEED if:

- You haven't read the reference files
- You don't understand the 7-step workflow
- You're unsure about the paired architecture

---

**Next Step:** [Step 1: Gather Requirements →](01-requirements.md)

