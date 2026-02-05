# Step 3: Copy Templates

> **For Claude:** Copy files from hello-world baseline, NOT templates directory.
> **Time Budget:** 15-20 minutes
> **Exit Criteria:** All files copied, variables replaced, diff tool shows 0 divergence.

---

## Entry Conditions

- [ ] Completed [Step 2: Domain Research](02-domain-research.md)
- [ ] Research document saved with key takeaways
- [ ] All template variables ready

---

## 🚨 CRITICAL: Use hello-world as Source

**DO NOT copy from `templates/` directory.** Copy from `genesis/examples/hello-world/`:

```bash
# CORRECT: Copy from hello-world
cp -r genesis/examples/hello-world/* .

# WRONG: Do not copy individual files from templates/ directory
# (that directory no longer exists - use hello-world instead)
```

The hello-world directory is the **canonical reference implementation**. All genesis-derived projects must match it byte-for-byte for MUST_MATCH files.

---

## 3.1 Copy Entire hello-world Structure

```bash
# Copy the complete hello-world structure
cp -r genesis/examples/hello-world/* .

# This gives you:
# ├── assistant/
# ├── validator/
# ├── js/core/          # Shared workflow engine
# ├── package.json
# ├── eslint.config.js
# └── ...
```

---

## 3.2 Register Project in Diff Tool (MANDATORY)

```bash
# Edit genesis/project-diff/diff-projects.js
# Add your project to the PROJECTS array:

const PROJECTS = [
  'architecture-decision-record',
  'your-new-project',  // ← ADD THIS LINE
  'one-pager',
  // ...
];
```

**⚠️ If you skip this step, the diff tool won't check your project for divergence!**

---

## 3.3 Replace Template Variables

Search and replace these variables in ALL files:

| Find | Replace With |
|------|--------------|
| `hello-world` | `{{PROJECT_NAME}}` |
| `Hello World` | `{{PROJECT_TITLE}}` |
| `A sample Genesis project` | `{{PROJECT_DESCRIPTION}}` |

```bash
# Verify no unreplaced variables:
grep -r "hello-world" . --exclude-dir=node_modules --exclude-dir=genesis
# Should return NO results (except maybe .git history)

grep -r "{{" . --exclude-dir=node_modules --exclude-dir=genesis
# Should return NO results
```

---

## 3.4 Customize Domain-Specific Files

These files MUST be customized for your document type:

| File | Customization |
|------|---------------|
| `assistant/js/workflow.js` | Phase logic, form fields, AI models |
| `assistant/js/prompts.js` | Prompt templates |
| `validator/js/validator.js` | Scoring dimensions, validation rules |
| `assistant/prompts/*.md` | LLM prompts for each phase |
| `assistant/templates/*` | Document output templates |

**Use your research document to inform these customizations!**

---

## 3.5 Run Diff Tool (MANDATORY CHECKPOINT)

```bash
cd genesis/project-diff
node diff-projects.js --ci
```

**Expected Output:**
```
✓ ALL MUST-MATCH FILES ARE IDENTICAL
  Total files scanned: XXX
  ✓ Identical (MUST_MATCH): 42
  ✗ Divergent (MUST_MATCH): 0
```

**⛔ BLOCKED: If divergent files > 0, FIX THEM before proceeding!**

---

## ⛔ Exit Criteria (ALL MUST PASS)

```bash
# 1. Verify directory structure
[ -d "assistant" ] && [ -d "validator" ] && echo "✅ Directories exist" || echo "❌ BLOCKED"

# 2. Verify js/core exists
[ -d "js/core" ] && echo "✅ js/core exists" || echo "❌ BLOCKED: Missing js/core"

# 3. Verify no unreplaced variables
grep -r "{{" . --exclude-dir=node_modules --exclude-dir=genesis || echo "✅ Variables replaced"

# 4. Verify no "hello-world" references
grep -r "hello-world" . --exclude-dir=node_modules --exclude-dir=genesis || echo "✅ hello-world replaced"

# 5. Run diff tool
cd genesis/project-diff && node diff-projects.js --ci
# MUST show: ✓ ALL MUST-MATCH FILES ARE IDENTICAL
```

### Verification Checklist

- [ ] Copied from hello-world (not templates/)
- [ ] Project added to diff-projects.js PROJECTS array
- [ ] All variables replaced
- [ ] Domain-specific files customized
- [ ] Diff tool shows 0 divergent MUST_MATCH files

---

## 🚫 DO NOT PROCEED if:

- Diff tool shows divergent files
- `js/core/` directory is missing
- Unreplaced template variables exist

---

**Next Step:** [Step 4: Install & Test →](04-install-test.md)

