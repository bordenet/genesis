# Design Patterns

This document describes the core design patterns used consistently across all genesis-tools repositories.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Web Application                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │  │
│  │  │   UI Layer  │  │  Business   │  │   Storage    │  │  │
│  │  │  (Views)    │◄─┤   Logic     │◄─┤  (IndexedDB) │  │  │
│  │  │             │  │  (Workflow) │  │              │  │  │
│  │  └─────────────┘  └─────────────┘  └──────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Module Pattern (ES6 Modules)

**Purpose**: Single-responsibility modules with clear imports/exports.

**Implementation**:
```javascript
// storage.js - Single responsibility: data persistence
class Storage {
  constructor() { this.db = null; }
  async init() { /* ... */ }
  async saveProject(project) { /* ... */ }
}
const storage = new Storage();
export default storage;
```

**Standard Modules**:

| Module | Responsibility |
|--------|----------------|
| `app.js` | Entry point, initialization, global event listeners |
| `router.js` | Hash-based SPA routing |
| `views.js` | Home, new project, edit project forms |
| `project-view.js` | Project workflow view with phase tabs |
| `projects.js` | Project CRUD operations |
| `workflow.js` | Prompt generation, phase management |
| `storage.js` | IndexedDB abstraction |
| `ui.js` | Toast, clipboard, formatting utilities |
| `error-handler.js` | Global error handling |
| `ai-mock.js` | Mock AI responses for development |

---

## 2. Singleton Pattern

**Purpose**: Single instance of storage and app state.

**Implementation**:
```javascript
// storage.js
class Storage { /* ... */ }
const storage = new Storage();  // Single instance
export default storage;         // Same instance everywhere

// Usage in other modules
import storage from './storage.js';
await storage.init();
```

---

## 3. Hash-based SPA Router

**Purpose**: Client-side navigation without page reloads.

**Routes**:

| Hash | Route | Handler |
|------|-------|---------|
| `#` or empty | home | `renderProjectsList()` |
| `#new` | new-project | `renderNewProjectForm()` |
| `#project/{id}` | project | `renderProjectView(id)` |
| `#edit/{id}` | edit-project | `renderEditProjectForm(id)` |

**Implementation**:
```javascript
// router.js
window.addEventListener('hashchange', handleHashChange);

function handleHashChange() {
  const hash = window.location.hash.slice(1);
  const [route, param] = hash.split('/');
  renderRoute(route || 'home', param);
}

export function navigateTo(route, param) {
  window.location.hash = param ? `${route}/${param}` : route;
}
```

---

## 4. Repository Pattern

**Purpose**: Abstract data storage operations behind a clean interface.

**Implementation**:
```javascript
// storage.js - Repository for IndexedDB
class Storage {
  async saveProject(project) { /* IndexedDB put */ }
  async getProject(id) { /* IndexedDB get */ }
  async getAllProjects() { /* IndexedDB getAll */ }
  async deleteProject(id) { /* IndexedDB delete */ }
}
```

**Benefits**:
- Swap storage backends without changing business logic
- Testable with mock implementations
- Consistent error handling

---

## 5. Multi-Phase State Machine

**Purpose**: Guide users through a structured 3-phase AI workflow.

**States**:
```
Phase 1 (Draft)     →    Phase 2 (Review)    →    Phase 3 (Synthesis)
  │                         │                         │
  ├─ Empty                  ├─ Empty                  ├─ Empty
  ├─ Prompt Generated       ├─ Prompt Generated       ├─ Prompt Generated
  └─ Complete               └─ Complete               └─ Complete
```

**Phase Types**:
- `mock`: AI interaction can be simulated (Phase 1, 3)
- `manual`: User must interact with external AI (Phase 2 - Gemini)

---

## 6. Form-to-Prompt Pattern

**Purpose**: Convert structured form data into AI prompts.

**Flow**:
```
User fills form → Form data stored → Template loaded → Variables replaced → Prompt displayed
```

**Implementation**:
```javascript
// workflow.js
function replaceTemplateVars(template, vars) {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, value || '[Not provided]');
  }
  return result;
}
```

**Standard Variables**:
- Phase 1: `{projectName}`, `{problemStatement}`, `{proposedSolution}`, etc.
- Phase 2+: `{phase1_output}`, `{phase2_output}`

---

## 7. Observer/Event Pattern

**Purpose**: Decouple UI interactions from business logic.

**Implementation**:
```javascript
// Event delegation for dynamic content
document.addEventListener('click', async (e) => {
  if (e.target.matches('[data-action="delete-project"]')) {
    const id = e.target.dataset.projectId;
    await deleteProject(id);
  }
});
```

---

## 8. Defensive Coding Pattern

**Purpose**: Prevent errors through validation and graceful degradation.

**Techniques**:
```javascript
// Input validation
if (!project?.id) throw new Error('Project ID required');

// Graceful degradation
const response = project.phases[0]?.response || '[Not completed]';

// Error boundaries
try {
  await riskyOperation();
} catch (error) {
  console.error('Operation failed:', error);
  showToast('Something went wrong', 'error');
}
```

---

## 9. Mock Mode Pattern

**Purpose**: Enable offline development and testing without AI APIs.

**Implementation**:
```javascript
// ai-mock.js
let mockModeEnabled = false;

export function initMockMode() {
  mockModeEnabled = localStorage.getItem('aiMockMode') === 'true';
  if (isLocalhost()) showMockToggle();
}

export async function getMockResponse(phase) {
  await delay(500);  // Simulate network
  return mockResponses[phase];
}
```

**UI**: Mock toggle only visible on localhost.

---

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6 modules)
- **Styling**: Tailwind CSS 3.x (CDN)
- **Storage**: IndexedDB (native API)
- **Build**: None (zero build step)
- **Testing**: Jest with ES6 module support
- **Deployment**: GitHub Pages (static)

---

## Design Principles

1. **Zero Dependencies**: No npm packages in production code
2. **Privacy-First**: All data stays in browser (IndexedDB)
3. **Offline-Capable**: Works without network after initial load
4. **Progressive Enhancement**: Core functionality without JavaScript
5. **Mobile-Responsive**: Tailwind responsive utilities

---

## Related Documentation

- [WORKFLOW-ARCHITECTURE.md](../genesis/docs/WORKFLOW-ARCHITECTURE.md) - Detailed workflow patterns
- [UI_STYLE_GUIDE.md](./UI_STYLE_GUIDE.md) - UI component standards
- [TESTING.md](./TESTING.md) - Testing patterns and coverage requirements

