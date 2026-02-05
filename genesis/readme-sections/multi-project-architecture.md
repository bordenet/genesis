# Genesis README: Multi-Project Architecture

> Part of [Genesis README](../README.md)

---

## 🚀 Multi-Project Architecture

Genesis now includes **full multi-project support** based on the proven architecture from product-requirements-assistant.

### Key Features

**Client-Side Routing** (`router-template.js`):
- Hash-based navigation (#, #new, #project/{id})
- Clean URL structure without page reloads
- Browser back/forward button support
- Automatic route handling and view rendering

**Project Management** (`projects-template.js`):
- Full CRUD operations (Create, Read, Update, Delete)
- Import/Export functionality (JSON format)
- Project metadata (title, created/updated timestamps)
- Phase-based workflow tracking

**View System** (`views-template.js`, `project-view-template.js`):
- Project list view with grid layout
- New project form with validation
- Individual project workflow view
- Phase tabs with completion indicators

**UI Utilities** (`ui-template.js`):
- Toast notifications (success, error, info, warning)
- Loading overlays with customizable text
- Modal dialogs with confirm/cancel
- Date formatting (relative time: "2 hours ago")
- Clipboard operations
- XSS prevention (HTML escaping)

**Storage** (`storage-template.js`):
- IndexedDB for client-side persistence
- Multi-project support with indexes
- Efficient querying (sorted by updatedAt)
- Storage quota monitoring

---

## Architecture Decision

**When to use multi-project architecture:**
- ✅ Users will create multiple documents (PRDs, one-pagers, etc.)
- ✅ Users need to switch between projects
- ✅ Users want to compare/export multiple projects
- ✅ Application is document-centric (not single-purpose)

**When to use simple single-project architecture:**
- ✅ Application is a single-purpose tool
- ✅ Users only need one active workflow at a time
- ✅ No need for project history or comparison

**Default**: Genesis templates now include multi-project architecture by default.

---

## Migration from Simple to Multi-Project

If you have an existing Genesis project with simple architecture, see `GENESIS-GAP-ANALYSIS.md` for detailed migration steps.

