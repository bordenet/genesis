# JavaScript Module Templates

## Purpose

This directory contains JavaScript ES6 module templates for web applications.

## Contents

1. **`storage-template.js`** - IndexedDB wrapper for data persistence
2. **`prompts-template.js`** - Prompt template loading and variable replacement
3. **`workflow-template.js`** - Multi-phase workflow engine (uses prompts.js)
4. **`ui-template.js`** - UI components and rendering
5. **`app-template.js`** - Application initialization and routing
6. **`lib/`** - Third-party libraries (excluded from linting/coverage)

## Third-Party Libraries (js/lib/)

The `js/lib/` directory contains third-party libraries that should be:
- **Excluded from ESLint** (minified code doesn't pass linting)
- **Excluded from Jest coverage** (no need to test third-party code)
- **Loaded directly** (not bundled/transformed)

Example libraries:
- `marked.min.js` - Markdown parser for rendering AI responses

## Module Overview

### storage-template.js

**Purpose**: Client-side data persistence using IndexedDB

**Exports**:
- `initDB()` - Initialize database
- `saveProject(project)` - Save project
- `getProject(id)` - Get project by ID
- `getAllProjects()` - Get all projects
- `deleteProject(id)` - Delete project
- `exportProject(id)` - Export as JSON
- `importProject(json)` - Import from JSON

**Usage**:
```javascript
import { initDB, saveProject, getAllProjects } from './storage.js';

await initDB();
const projects = await getAllProjects();
```

### prompts-template.js

**Purpose**: Prompt template loading and variable replacement

**Exports**:
- `WORKFLOW_CONFIG` - Phase configuration
- `generatePhase1Prompt(formData)` - Generate Phase 1 prompt
- `generatePhase2Prompt(phase1Output)` - Generate Phase 2 prompt
- `generatePhase3Prompt(phase1Output, phase2Output)` - Generate Phase 3 prompt
- `getPhaseMetadata(phaseNumber)` - Get phase metadata

**Template Variable Syntax**: `{{VAR_NAME}}` (double braces, SCREAMING_SNAKE_CASE)

**Usage**:
```javascript
import { generatePhase1Prompt, WORKFLOW_CONFIG } from './prompts.js';

const prompt = await generatePhase1Prompt({ title: 'My Doc', context: '...' });
```

### workflow-template.js

**Purpose**: Multi-phase workflow state management (uses prompts.js)

**Exports**:
- `WORKFLOW_CONFIG` - Re-exported from prompts.js
- `Workflow` - Workflow class for managing project phases
- `getPhaseMetadata(phaseNumber)` - Get phase metadata
- `generatePromptForPhase(project, phaseNumber)` - Generate prompt for phase

**Usage**:
```javascript
import { Workflow, WORKFLOW_CONFIG } from './workflow.js';

const workflow = new Workflow(project);
const prompt = await workflow.generatePrompt();
```

### ui-template.js

**Purpose**: UI component rendering and event handling

**Exports**:
- `renderProjectList(projects)` - Render project list
- `renderPhase(phase)` - Render phase UI
- `showModal(title, content)` - Show modal dialog
- `showToast(message, type)` - Show toast notification
- `updateProgress(percentage)` - Update progress bar

**Usage**:
```javascript
import { renderProjectList, showToast } from './ui.js';

renderProjectList(projects);
showToast('Project saved!', 'success');
```

### app-template.js

**Purpose**: Application initialization and global state

**Exports**:
- `init()` - Initialize application
- `setState(key, value)` - Update global state
- `getState(key)` - Get global state
- `navigate(route)` - Navigate to route

**Usage**:
```javascript
import { init } from './app.js';

document.addEventListener('DOMContentLoaded', init);
```

## Code Standards

All JavaScript modules must follow these standards:

### ES6 Modules
- ✅ Use `import`/`export` syntax
- ✅ No CommonJS (`require`)
- ✅ Named exports preferred
- ✅ One module per file

### Error Handling
- ✅ Try-catch for async operations
- ✅ Meaningful error messages
- ✅ Log errors to console (dev only)
- ✅ Show user-friendly messages

### Async/Await
- ✅ Use async/await (not callbacks)
- ✅ Handle promise rejections
- ✅ No unhandled promise rejections

### Code Style
- ✅ 2-space indentation
- ✅ Single quotes for strings
- ✅ Semicolons required
- ✅ camelCase for variables/functions
- ✅ PascalCase for classes

### Documentation
- ✅ JSDoc comments for functions
- ✅ Describe parameters and return values
- ✅ Include usage examples

## Testing

Each module should have corresponding tests:

- `storage-template.js` → `storage.test.js`
- `workflow-template.js` → `workflow.test.js`
- `ui-template.js` → `ui.test.js`
- `app-template.js` → `app.test.js`

See `../../../05-QUALITY-STANDARDS.md` for testing requirements.

## Related Documentation

- **Web App Templates**: `../../README.md`
- **Quality Standards**: `../../../../05-QUALITY-STANDARDS.md`
- **Testing Guide**: `../../../docs/TESTING-template.md`

