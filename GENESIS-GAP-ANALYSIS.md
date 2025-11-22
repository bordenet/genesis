# Genesis Gap Analysis: One-Pager vs PRD-Assistant

**Date:** 2025-11-21  
**Purpose:** Deep diff between one-pager and product-requirements-assistant repos to identify gaps in Genesis templates  
**Status:** 🔴 CRITICAL GAPS IDENTIFIED

---

## Executive Summary

After performing a comprehensive diff between the two Genesis-derived repos, I've identified **significant architectural gaps** in Genesis templates. PRD-assistant has evolved to a much more sophisticated multi-project architecture that Genesis doesn't currently support.

### Key Findings

| Category | One-Pager | PRD-Assistant | Genesis Templates | Gap Severity |
|----------|-----------|---------------|-------------------|--------------|
| **Architecture** | Simple single-view | Multi-project with routing | Simple single-view | 🔴 CRITICAL |
| **JS Modules** | 4 files (app, storage, workflow, ai-mock) | 8 files (+ router, views, ui, projects, project-view) | 7 files (includes same-llm) | 🟡 MEDIUM |
| **Evolutionary Optimization** | ❌ None | ✅ Full tooling (tools/) | ✅ Module created | ✅ RESOLVED |
| **Backend Support** | ❌ None | ✅ Go backend (28 files) | ❌ None | 🟢 LOW (optional) |
| **Electron Support** | ❌ None | ✅ Desktop app support | ❌ None | 🟢 LOW (optional) |
| **File Structure** | Duplicate (root + docs/) | Clean (docs/ only) | Clean (docs/ only) | ✅ GOOD |

---

## Detailed Gap Analysis

### 1. 🔴 CRITICAL: Multi-Project Architecture

**PRD-Assistant Has:**
- Client-side routing (`router.js`) with hash-based navigation
- Multi-project management (`projects.js`) with CRUD operations
- Separate views module (`views.js`) for rendering different screens
- Project-specific view (`project-view.js`) for individual project workflows
- UI utilities module (`ui.js`) for common UI operations

**Genesis Currently Has:**
- Simple single-project workflow
- No routing support
- No multi-project management
- Inline view rendering in `app.js`

**Impact:**
- ❌ Genesis-spawned projects can only handle ONE project at a time
- ❌ No way to switch between multiple projects
- ❌ Poor user experience for users with multiple documents
- ❌ No project list view

**Example from PRD-Assistant:**
```javascript
// router.js - Client-side routing
export function navigateTo(route, ...params) {
    currentRoute = route;
    currentParams = params;
    
    if (route === 'home') {
        window.location.hash = '';
    } else if (route === 'project' && params[0]) {
        window.location.hash = `#project/${params[0]}`;
    }
    
    const handler = routes[route];
    if (handler) {
        handler(...params);
    }
}

// projects.js - Multi-project management
export async function createProject(title, problems, context) {
    const project = {
        id: crypto.randomUUID(),
        title: title.trim(),
        problems: problems.trim(),
        context: context.trim(),
        phase: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        phases: {
            1: { prompt: '', response: '', completed: false },
            2: { prompt: '', response: '', completed: false },
            3: { prompt: '', response: '', completed: false }
        }
    };
    await storage.saveProject(project);
    return project;
}
```

**One-Pager Has:**
- Basic multi-project support (project list view)
- Simple view switching (show/hide divs)
- No routing, just DOM manipulation

**Recommendation:**
🔴 **CRITICAL** - Genesis should support BOTH architectures:
1. **Simple Mode** (current): Single-project workflow for simple use cases
2. **Multi-Project Mode** (new): Full routing + multi-project management

---

### 2. 🟡 MEDIUM: JavaScript Module Organization

**File Count Comparison:**

**One-Pager (4 core files):**
- `app.js` (21,731 lines) - Monolithic, handles everything
- `storage.js` (3,996 lines)
- `workflow.js` (4,613 lines)
- `ai-mock.js` (2,708 lines)

**PRD-Assistant (8 core files):**
- `app.js` (7,446 lines) - Smaller, focused on initialization
- `storage.js` (5,759 lines)
- `workflow.js` (5,170 lines)
- `router.js` (1,756 lines) - NEW
- `views.js` (10,574 lines) - NEW
- `ui.js` (4,924 lines) - NEW
- `projects.js` (4,515 lines) - NEW
- `project-view.js` (9,937 lines) - NEW

**Genesis Templates (7 files):**
- `app-template.js`
- `storage-template.js`
- `workflow-template.js`
- `ai-mock-template.js`
- `ai-mock-ui-template.js`
- `same-llm-adversarial-template.js`

**Gap:**
- ❌ No `router.js` template
- ❌ No `views.js` template
- ❌ No `ui.js` template
- ❌ No `projects.js` template
- ❌ No `project-view.js` template

**Recommendation:**
🟡 **MEDIUM** - Add optional templates for multi-project architecture

---

### 3. ✅ RESOLVED: Evolutionary Optimization

**Status:** Already integrated in previous session!
- ✅ Created `genesis/modules/evolutionary-optimization/`
- ✅ Copied all tools from PRD-assistant
- ✅ Created project-type-specific scorers
- ✅ Documented in main README

**No action needed.**

---

### 4. 🟢 LOW: Backend Support (Optional)

**PRD-Assistant Has:**
- Go backend (28 files, ~5,000 lines)
- REST API for AI integration
- File pool management
- Metrics and monitoring
- E2E tests

**Genesis Has:**
- Client-side only
- Mock AI for testing
- Manual AI integration (copy/paste)

**Recommendation:**
🟢 **LOW PRIORITY** - Backend is optional, not core to Genesis mission
- Genesis focuses on 100% client-side apps
- Backend adds complexity
- Manual AI integration works well

**Action:** Document as optional enhancement, not core feature

---

### 5. 🟢 LOW: Electron Support (Optional)

**PRD-Assistant Has:**
- Electron wrapper (`cmd/electron/`)
- Desktop app builds
- Native file system access
- Build scripts for Windows/Mac/Linux

**Genesis Has:**
- Web-only deployment
- GitHub Pages focus

**Recommendation:**
🟢 **LOW PRIORITY** - Electron is optional
- Web deployment is core Genesis value proposition
- Electron adds significant complexity
- Not needed for most use cases

**Action:** Document as optional enhancement

---

### 6. 🟡 MEDIUM: File Structure Inconsistencies

**One-Pager Issue:**
- Has `index.html` in BOTH root AND `docs/` directory
- Has `js/` in BOTH root AND `docs/js/` directory
- Duplicate files cause confusion

**PRD-Assistant:**
- Clean structure: `docs/` only
- No duplicates
- Clear deployment target

**Genesis Templates:**
- Clean structure: `docs/` only
- Follows PRD-assistant pattern

**Status:** ✅ Genesis is correct, one-pager has technical debt

**Action:** None needed for Genesis

---

## Critical Questions for User

Before implementing fixes, I need your input on these key decisions:

### Question 1: Multi-Project Architecture

**Should Genesis support multi-project architecture?**

**Option A: Add Multi-Project Support (RECOMMENDED)**
- ✅ Better user experience
- ✅ Matches PRD-assistant evolution
- ✅ More professional
- ❌ More complex templates
- ❌ Steeper learning curve for AI

**Option B: Keep Simple Single-Project**
- ✅ Simpler templates
- ✅ Easier for AI to understand
- ✅ Faster project creation
- ❌ Poor UX for multiple documents
- ❌ Doesn't match reference implementations

**Option C: Support Both (HYBRID)**
- ✅ Best of both worlds
- ✅ User can choose complexity level
- ❌ More templates to maintain
- ❌ More documentation needed

**My Recommendation:** Option C (Hybrid)
- Create `templates/web-app-simple/` (current architecture)
- Create `templates/web-app-multi-project/` (PRD-assistant architecture)
- Let user choose during project creation

### Question 2: Template Granularity

**Should we create separate templates for each JS module?**

**Current:** 7 template files (app, storage, workflow, ai-mock, ai-mock-ui, same-llm)

**PRD-Assistant:** 8+ files (router, views, ui, projects, project-view, etc.)

**Options:**
- **A:** Add all 5 new templates (router, views, ui, projects, project-view)
- **B:** Add only router + projects (minimal multi-project support)
- **C:** Keep current simple architecture

**My Recommendation:** Option A if we go with multi-project, Option C if we stay simple

### Question 3: Evolutionary Optimization Integration

**Should spawned projects automatically include evolutionary optimization tools?**

**Current Status:**
- ✅ Module exists in `genesis/modules/evolutionary-optimization/`
- ❌ NOT automatically copied to spawned projects
- ❌ No spawn script integration

**Options:**
- **A:** Auto-copy to all spawned projects (in `tools/` directory)
- **B:** Optional flag during project creation
- **C:** Manual copy only (current)

**My Recommendation:** Option A - Auto-copy to all projects
- It's production-validated
- Adds significant value
- Minimal overhead (~3,300 lines)
- Users can ignore if not needed

---

## Proposed Action Plan

Based on my analysis, here's what I recommend:

### Phase 1: CRITICAL Fixes (Do Now)

1. **Integrate Evolutionary Optimization into Spawn Process**
   - Modify spawn scripts to copy `modules/evolutionary-optimization/` to `tools/`
   - Update documentation
   - Test with sample project

2. **Add Multi-Project Architecture Templates (Optional)**
   - Create `templates/web-app-multi-project/` directory
   - Copy PRD-assistant architecture (router, views, ui, projects, project-view)
   - Create documentation for when to use simple vs multi-project

### Phase 2: MEDIUM Enhancements (Do Soon)

3. **Improve Template Documentation**
   - Document architecture differences
   - Add decision tree for choosing architecture
   - Update START-HERE.md with architecture options

4. **Create Architecture Comparison Guide**
   - Side-by-side comparison of simple vs multi-project
   - Use cases for each
   - Migration path from simple to multi-project

### Phase 3: LOW Priority (Future)

5. **Document Optional Enhancements**
   - Backend integration guide
   - Electron wrapper guide
   - Advanced features documentation

---

## Files Requiring Updates

If we proceed with multi-project support:

### New Files to Create:
1. `genesis/templates/web-app-multi-project/js/router-template.js`
2. `genesis/templates/web-app-multi-project/js/views-template.js`
3. `genesis/templates/web-app-multi-project/js/ui-template.js`
4. `genesis/templates/web-app-multi-project/js/projects-template.js`
5. `genesis/templates/web-app-multi-project/js/project-view-template.js`
6. `genesis/templates/web-app-multi-project/index-template.html` (updated for routing)
7. `genesis/docs/ARCHITECTURE-DECISION-GUIDE.md`

### Files to Update:
1. `genesis/START-HERE.md` - Add architecture choice
2. `genesis/AI-EXECUTION-CHECKLIST.md` - Add multi-project steps
3. `genesis/README.md` - Document architecture options
4. `genesis/scripts/spawn.sh` (if exists) - Add evolutionary optimization copy

---

## Metrics

**File Counts:**
- One-Pager: 102 files
- PRD-Assistant: 171 files
- Genesis Templates: 68 files

**Common Files:** 28 files (core Genesis structure)

**Unique to PRD-Assistant:** 143 files
- Backend: 28 files (Go)
- Electron: 5 files
- Advanced JS: 5 files (router, views, ui, projects, project-view)
- Documentation: 105+ files

**Unique to One-Pager:** 74 files
- Experimental features (generalized prompt tuning)
- Temporary docs (docs-temp/)
- Duplicate files (root + docs/)

---

## Next Steps

**Awaiting your decision on:**

1. ❓ Should Genesis support multi-project architecture? (A/B/C)
2. ❓ Should we auto-copy evolutionary optimization to spawned projects? (A/B/C)
3. ❓ What's the priority: CRITICAL fixes only, or full enhancement?

**Once you decide, I will:**
1. Implement approved changes
2. Update all documentation
3. Run Genesis validator
4. Test with sample project
5. Commit and push to origin/main


