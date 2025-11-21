# Genesis Project Template System

**Version**: 1.0  
**Created**: 2025-11-20  
**Status**: ✅ READY FOR USE

---

## What is Genesis?

Genesis is a **comprehensive project template system** that abstracts the Product Requirements Assistant into reusable, AI-readable templates. It enables rapid creation of derivative projects with similar architecture but different workflows.

**Success Criteria**: Copy `genesis/` to empty repo → AI reads instructions → Creates fully working project with GitHub Pages deployment in <2 hours.

---

## Quick Start

### For AI Assistants (PRIMARY)

**🎯 READ THIS FILE FIRST**: [`START-HERE.md`](START-HERE.md)

This is your ONLY entry point. It contains:
- Complete step-by-step execution plan (30-60 minutes)
- All mandatory files to read (with direct links)
- Exact commands to run
- Success criteria and verification steps

**DO NOT** read other files until `START-HERE.md` tells you to.

---

## 📚 Reference Implementations (CRITICAL)

Genesis is based on **TWO known-good reference implementations**. When implementing a new project from Genesis, **ALWAYS reference these first** before asking questions or making assumptions.

### Primary References:

1. **[product-requirements-assistant](https://github.com/bordenet/product-requirements-assistant)** ⭐ **PRIMARY REFERENCE**
   - **Live Demo**: https://bordenet.github.io/product-requirements-assistant/
   - **What it demonstrates**: 3-phase PRD generator with mock/manual modes
   - **Key patterns**: Dark mode toggle, workflow architecture, form-to-prompt, deployment scripts, setup scripts
   - **Study BEFORE implementing**: See [`REFERENCE-IMPLEMENTATIONS.md`](REFERENCE-IMPLEMENTATIONS.md) for specific files

2. **[one-pager](https://github.com/bordenet/one-pager)** ⭐ **SECONDARY REFERENCE**
   - **Live Demo**: https://bordenet.github.io/one-pager/
   - **What it demonstrates**: 3-phase one-pager generator (same pattern, different document type)
   - **Key patterns**: Related projects dropdown, privacy notice, UI patterns
   - **Lessons learned**: See `GENESIS-DARK-MODE-IMPLEMENTATION.md`, `GENESIS-PROCESS-IMPROVEMENTS.md`

### When to Reference:

**✅ ALWAYS reference these implementations when:**
- Implementing dark mode toggle (CRITICAL - always broken without Tailwind config)
- Setting up workflow phases (mock vs manual modes)
- Creating form-to-prompt patterns
- Writing deployment scripts (compact mode, quality gates)
- Writing setup scripts (fast, resumable, smart caching)
- Adding UI patterns (dropdowns, modals, notifications)
- Structuring prompts and templates
- Testing async functionality

**📝 ALWAYS create a reverse-integration note when:**
- You reference the implementations to solve a problem
- You discover a pattern that should be in Genesis templates
- You fix a bug that Genesis should prevent
- You implement a feature that future projects will need

**Format for reverse-integration notes:**
```markdown
## REVERSE-INTEGRATION NOTE

**Date**: YYYY-MM-DD
**Project**: [project-name]
**Issue**: [What problem did you encounter?]
**Solution**: [How did you solve it by referencing the implementations?]
**Genesis Gap**: [What's missing from Genesis that caused this?]
**Recommendation**: [What should be added/updated in Genesis?]
**Files to Update**: [List Genesis files that need changes]
**Priority**: [CRITICAL / HIGH / MEDIUM / LOW]
```

**Where to save notes**: Create `REVERSE-INTEGRATION-NOTES.md` in your project root and share with Genesis maintainer.

### Why This Matters:

**Genesis is a living system.** Every project built from Genesis teaches us:
- What patterns work well (keep in Genesis)
- What's missing (add to Genesis)
- What's broken (fix in Genesis)
- What's confusing (document better in Genesis)

**The cycle**:
1. Build project from Genesis
2. Reference implementations when stuck
3. Document what you learned
4. Reverse-integrate improvements back to Genesis
5. Next project is easier

**This ensures Genesis gets better with every project, not worse.**

---

## 🔧 Understanding the 3-Phase Workflow Pattern

Genesis projects use a **3-phase workflow pattern** by default. Understanding this pattern is critical for successful implementation.

### The Pattern

**Phase 1: Initial Draft (Mock Mode)**
- **Purpose**: Fast iteration with structured inputs
- **How it works**: User fills form → AI generates draft (client-side)
- **AI Model**: Typically Claude Sonnet 4.5
- **Key Feature**: Form fields map to template sections
- **Output**: Initial draft document

**Phase 2: Review & Critique (Manual Mode)**
- **Purpose**: Get different AI perspective for quality improvement
- **How it works**: User copies Phase 1 output → pastes to external AI → gets critique → copies back
- **AI Model**: Typically Gemini 2.5 Pro (different from Phase 1)
- **Key Feature**: Different AI provides fresh perspective
- **Output**: Critique and improvement suggestions

**Phase 3: Final Synthesis (Mock Mode)**
- **Purpose**: Combine best of both versions
- **How it works**: AI synthesizes Phase 1 + Phase 2 → final document (client-side)
- **AI Model**: Typically Claude Sonnet 4.5 (same as Phase 1)
- **Key Feature**: Best of both worlds
- **Output**: Final polished document

### Why 3 Phases?

1. **Phase 1**: Fast iteration with structured inputs (form-driven)
2. **Phase 2**: Different AI perspective prevents groupthink
3. **Phase 3**: Synthesis combines strengths of both

### Configuration

**Default Configuration** (recommended for most projects):
```javascript
// In workflow.js
const PHASES = {
  1: { name: 'Initial Draft', mode: 'mock', ai: 'Claude Sonnet 4.5' },
  2: { name: 'Review & Critique', mode: 'manual', ai: 'Gemini 2.5 Pro' },
  3: { name: 'Final Synthesis', mode: 'mock', ai: 'Claude Sonnet 4.5' }
};
```

**Customization Options**:
- **2-phase workflow**: Skip Phase 2 (no external review)
- **5-phase workflow**: Add more review/refinement cycles
- **Different AI models**: Use different models per phase
- **All manual**: Set all phases to manual mode (no mock)
- **All mock**: Set all phases to mock mode (no external AI)

**When to customize**:
- ✅ Different document types may need different phase counts
- ✅ Some workflows benefit from more review cycles
- ✅ Some users prefer all-manual or all-mock modes
- ❌ Don't customize without good reason (3-phase is proven)

### File Structure for Phases

```
prompts/
  phase1.md          # Prompt for Phase 1 (form → draft)
  phase2.md          # Prompt for Phase 2 (draft → critique)
  phase3.md          # Prompt for Phase 3 (draft + critique → final)

templates/
  {document-type}-template.md  # Document structure template

js/
  workflow.js        # Phase configuration and logic
  app.js            # Form rendering and phase transitions
```

**See reference implementations for concrete examples!**

---

### For Humans

1. **Read quick start**: `02-QUICK-START.md`
2. **Choose an example**: See `examples/` directory
3. **Customize**: See `03-CUSTOMIZATION-GUIDE.md`

---

## What's Included

### 📚 Core Documentation

- **`00-GENESIS-PLAN.md`** - Master plan (double-checked, ready for implementation)
- **`01-AI-INSTRUCTIONS.md`** - Step-by-step AI guidance with quality standards
- **`02-DEPENDENCY-MANAGEMENT.md`** - **THE IRON LAW OF DEPENDENCIES** (MANDATORY - Read First)
- **`02-QUICK-START.md`** - Human-readable quick start
- **`03-CUSTOMIZATION-GUIDE.md`** - Customization guide
- **`04-DEPLOYMENT-GUIDE.md`** - Deployment guide (GitHub Pages, Netlify, Vercel)
- **`05-QUALITY-STANDARDS.md`** - Professional standards and best practices
- **`SUMMARY.md`** - Comprehensive overview of Genesis system

### 🔧 Integration (Starter-Kit)

All files from [bordenet/scripts/starter-kit](https://github.com/bordenet/scripts/tree/main/starter-kit):

- `SAFETY_NET.md` - Pre-commit hooks, validation, security
- `DEVELOPMENT_PROTOCOLS.md` - AI-assisted development protocols
- `PROJECT_SETUP_CHECKLIST.md` - Step-by-step setup guide
- `SHELL_SCRIPT_STANDARDS.md` - Shell script conventions
- `CODE_STYLE_STANDARDS.md` - Cross-language style guide
- `common.sh` - Reusable shell script library

### 📝 Templates

**Project Structure**:
- `README-template.md` - Project README with badges ✅
- `gitignore-template` - Comprehensive .gitignore ✅

**Web App**:
- `index-template.html` - Main HTML file with Tailwind CSS ✅
- `js/storage-template.js` - IndexedDB storage module ✅
- `js/workflow-template.js` - Multi-phase workflow engine ✅
- `css/styles-template.css` - Custom styles ✅
- `js/ui-template.js` - UI helpers (Coming Soon)
- `js/router-template.js` - Client-side routing (Coming Soon)
- `js/app-template.js` - Main app logic (Coming Soon)
- `data/prompts-template.json` - Default prompts (Coming Soon)

**Documentation**:
- `SHELL_SCRIPT_STANDARDS-template.md` - Shell script standards (MANDATORY) ✅
- `TESTING-template.md` - Testing guide with AI mock mode ✅
- Architecture templates (Coming Soon)
- Deployment guides (Coming Soon)

**Scripts**:
- `setup-macos-template.sh` - macOS setup script ✅
- `validate-template.sh` - Quality validation script (enforces all standards) ✅
- `lib/common-template.sh` - Reusable shell library ✅
- Setup scripts for Linux/Windows (Coming Soon)

**GitHub Actions**:
- `workflows/ci-template.yml` - Full CI/CD pipeline with quality gates ✅
- `workflows/lint-template.yml` - Comprehensive linting (shellcheck, JS, HTML, CSS) ✅
- Enforces shell script standards (timer, help, verbose) ✅
- Automated testing and coverage reporting ✅
- GitHub Pages deployment ✅

**Git Hooks**:
- `git-hooks/pre-commit-template` - Enforces quality standards before commit ✅
- Runs shellcheck, JavaScript validation, standards compliance ✅
- Prevents commits with TODO/FIXME or console.log ✅

### 📖 Examples

**One-Pager Assistant** (`examples/one-pager/`):
- Complete 2-phase workflow example
- Scoring and feedback system
- Ready-to-use prompts
- Full configuration

**Minimal Project** (`examples/minimal/`):
- Simplest possible project
- Single-phase workflow
- ~50 files total
- <30 minute setup

### ✅ Validation

- `validation/validate-genesis.sh` - Validates Genesis structure

---

## Current Status

### ✅ Completed (Phase 1-2)

**Core Documentation**:
- [x] Master plan created and double-checked (1,016 lines)
- [x] AI instructions complete (7-phase process)
- [x] Quick start guide complete
- [x] Customization guide complete
- [x] Deployment guide complete (GitHub Pages, Netlify, Vercel)

**Integration**:
- [x] Starter-kit integration complete (all 6 files)
- [x] Directory structure created (24 directories)

**Templates - Project Structure**:
- [x] README template with badges
- [x] Gitignore template

**Templates - Web App** (Core templates ready for rapid deployment):
- [x] `index-template.html` - Tailwind CSS, dark mode, responsive
- [x] `js/storage-template.js` - IndexedDB with export/import
- [x] `js/workflow-template.js` - Multi-phase workflow engine
- [x] `css/styles-template.css` - Custom styles and animations

**Examples**:
- [x] Hello World example complete (fully functional, deployable)
- [x] One-Pager Generator example complete (2-phase workflow)
- [x] COE Generator example complete (3-phase workflow)
- [x] One-Pager example complete (README + 2 prompts)
- [x] Minimal example complete (README)

**Tools**:
- [x] Validation script created
- [x] Genesis added to .gitignore

### 🚧 Remaining (Phase 3-9)

**Web App Templates** (Nice-to-have):
- [ ] `js/app-template.js` - Main application logic
- [ ] `js/ui-template.js` - UI helper functions
- [ ] `js/router-template.js` - Client-side routing
- [ ] `data/prompts-template.json` - Default prompts

**Documentation Templates**:
- [ ] `ARCHITECTURE-template.md`
- [ ] `CONTRIBUTING-template.md`
- [ ] `CLAUDE-template.md`
- [ ] Deployment guides

**Script Templates**:
- [ ] `setup-macos-template.sh`
- [ ] `setup-linux-template.sh`
- [ ] `validate-template.sh`
- [ ] `check-binaries-template.sh`
- [ ] `check-secrets-template.sh`

**GitHub Actions Templates**:
- [ ] `ci-template.yml`
- [ ] `deploy-web-template.yml`
- [ ] `release-template.yml`

**Git Hooks Templates**:
- [ ] `pre-commit-template`
- [ ] `install-hooks-template.sh`

---

## How to Use

### Option 1: With AI Assistant (Recommended)

```bash
# Copy Genesis to new project
mkdir my-new-project
cp -r genesis/* my-new-project/
cd my-new-project

# Open with AI (Claude, Cursor, etc.)
# Tell AI: "Please read 01-AI-INSTRUCTIONS.md and help me create a new project"
```

### Option 2: Manual Setup

```bash
# Copy Genesis
mkdir my-new-project
cp -r genesis/* my-new-project/
cd my-new-project

# Follow 02-QUICK-START.md
```

---

## Examples

### Create One-Pager Assistant

```bash
mkdir one-pager-assistant
cp -r genesis/* one-pager-assistant/
cd one-pager-assistant

# Tell AI: "Create a One-Pager assistant using examples/one-pager/ as reference"
```

### Create Minimal Project

```bash
mkdir my-minimal-app
cp -r genesis/* my-minimal-app/
cd my-minimal-app

# Tell AI: "Create a minimal project using examples/minimal/ as reference"
```

---

## Next Steps

To complete the Genesis system, the remaining templates need to be created following the plan in `00-GENESIS-PLAN.md`.

**Priority Order**:
1. Web app templates (most critical)
2. GitHub Actions templates (for deployment)
3. Script templates (for setup)
4. Documentation templates (for polish)

---

## Support

- **Master Plan**: See `00-GENESIS-PLAN.md`
- **AI Instructions**: See `01-AI-INSTRUCTIONS.md`
- **Quick Start**: See `02-QUICK-START.md`
- **Customization**: See `03-CUSTOMIZATION-GUIDE.md`
- **Examples**: See `examples/` directory

---

**Status**: Phase 1-2 complete. ✅ **READY FOR RAPID DEPLOYMENT**

Core web app templates complete with:
- Tailwind CSS integration (no build step)
- IndexedDB storage with export/import
- Multi-phase workflow engine
- Professional quality standards (85% coverage requirement)
- AI mock mode for testing
- Comprehensive documentation (6 guides)

**27 files | 24 directories | 268KB**

