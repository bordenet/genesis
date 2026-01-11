# AI Assistant Instructions for {{PROJECT_NAME}}

**Project Status**: Production-ready
**Live URL**: https://{{GITHUB_USER}}.github.io/{{PROJECT_NAME}}/

**📐 Design Patterns**: See [DESIGN-PATTERNS.md](./DESIGN-PATTERNS.md) for architecture patterns.

---

## ⚠️ CRITICAL: Genesis Consistency Mandate

**THE ENTIRE POINT OF GENESIS IS RIGID CONSISTENCY.**

All genesis-derived tools MUST be indistinguishable except for document-type-specific logic.

### Consistency Rules

1. **No Snowflakes**: Do NOT add features to one repo without adding to ALL repos
2. **Reference Before Implement**: ALWAYS check genesis templates and sibling repos first
3. **Propagate All Changes**: Changes to patterns go to ALL repos AND genesis templates
4. **No Session Artifacts**: Do NOT create HANDOFF.md, NEXT_WORK.md, SESSION_X.md files
5. **Follow Templates Exactly**: Template structure is mandatory, not optional

### Before Every Commit

- [ ] Does this change need to go to ALL repos?
- [ ] Does this change need to go to genesis templates?
- [ ] Am I creating variance that undermines consistency?

---

## ⚠️ CRITICAL: Fix ALL Linting Issues Immediately

When you detect ANY linting issue, fix it immediately - regardless of whether it was pre-existing.

- Do NOT note that issues are "pre-existing" and move on
- Do NOT defer fixing to a later step
- Do NOT push code with known linting issues

---

## 🎯 Core Principles

### 1. Complete the Full Workflow

When asked to do a task:

1. ✅ Complete the work
2. ✅ Lint the code (`npm run lint`)
3. ✅ Run tests (`npm test`)
4. ✅ Verify coverage meets thresholds
5. ✅ **PROACTIVELY tell the user what's left**

### 2. Never Include Build Artifacts

- ❌ NEVER commit `node_modules/`, `coverage/`, `dist/`
- ✅ ALWAYS verify with `.gitignore`

### 3. Reference Known-Good Implementations

Before implementing ANY feature, check:
1. **Genesis templates**: `github.com/bordenet/genesis`
2. **Sibling repos**: Check how other genesis tools implement it

---

## 📁 Project-Specific Context

### Document Type
{{PROJECT_TITLE}} - {{PROJECT_DESCRIPTION}}

### Workflow Phases
- **Phase 1**: Initial generation (Claude)
- **Phase 2**: Adversarial review (Gemini)
- **Phase 3**: Synthesis (Claude)

### Key Files
- `js/workflow.js` - Phase orchestration
- `js/prompts.js` - AI prompt templates (if extracted)
- `prompts/phase1.md` - Phase 1 prompt
- `prompts/phase2.md` - Phase 2 prompt
- `prompts/phase3.md` - Phase 3 prompt

---

## 🔧 Technical Stack

- **Frontend**: Vanilla JavaScript, Tailwind CSS
- **Storage**: IndexedDB (local, privacy-first)
- **Testing**: Jest, 50% coverage threshold
- **Linting**: ESLint with strict rules
- **CI/CD**: GitHub Actions

---

## ✅ Quality Checklist

Before marking work complete:

- [ ] `npm run lint` passes with 0 warnings
- [ ] `npm test` passes with coverage ≥50%
- [ ] No console.log statements in production code
- [ ] No TODO/FIXME without tracking issues
- [ ] Changes propagated to sibling repos if applicable
- [ ] Genesis templates updated if applicable

---

## 🚫 Do NOT Create These Files

Session artifacts that introduce entropy:
- ❌ HANDOFF.md
- ❌ NEXT_WORK.md
- ❌ SESSION_*.md
- ❌ *_NOTES.md
- ❌ *_QUICKSTART.md

Use task management tools instead.

---

## 📚 Related Documentation

- [README.md](./README.md) - User guide
- [DESIGN-PATTERNS.md](./DESIGN-PATTERNS.md) - Architecture patterns
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment instructions
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues

