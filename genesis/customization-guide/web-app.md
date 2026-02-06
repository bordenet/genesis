# Genesis Customization: Web App

> Part of [Customization Guide](../03-CUSTOMIZATION-GUIDE.md)

---

## 🚨 CRITICAL: IndexedDB Database Name (MUST DO FIRST)

**Every new project MUST have a unique IndexedDB database name!**

When creating a new project from hello-world, you **MUST** change these values in **BOTH** files:

### Files to Update

1. **`js/storage.js`** (root)
2. **`assistant/js/storage.js`** (assistant)
3. **`assistant/tests/storage.test.js`** (update test expectation)

### What to Change

```javascript
// ❌ WRONG - Using template default (causes data corruption!)
const DB_NAME = 'hello-world-assistant-db';
const STORE_NAME = 'projects';

// ✅ CORRECT - Unique to your project
const DB_NAME = 'my-new-assistant-db';  // MUST be unique!
const STORE_NAME = 'documents';          // Descriptive name
```

### Why This Matters

All genesis tools are hosted on the same domain (`bordenet.github.io`). IndexedDB databases are scoped by **domain**, NOT by URL path. If two tools use the same `DB_NAME`, they will **share data and corrupt each other**.

### Naming Convention

| Field | Convention | Example |
|-------|------------|---------|
| `DB_NAME` | `{project-name}-db` | `business-justification-assistant-db` |
| `STORE_NAME` | Descriptive noun | `justifications`, `criteria`, `proposals` |

### Test Update

In `assistant/tests/storage.test.js`, update the store name test:

```javascript
// Change from:
it('should create projects store', async () => {
    expect(storage.db.objectStoreNames.contains('projects')).toBe(true);
});

// To (using your new STORE_NAME):
it('should create justifications store', async () => {
    expect(storage.db.objectStoreNames.contains('justifications')).toBe(true);
});
```

---

## Change Branding

**Colors**:
Edit `templates/web-app/css/styles-template.css`:
```css
:root {
  --primary-color: #3b82f6;    /* Change to your brand color */
  --secondary-color: #8b5cf6;  /* Change to your accent color */
}
```

**Logo**:
Edit `templates/web-app/index-template.html`:
```html
<div class="logo">
  <img src="img/logo.png" alt="{{PROJECT_TITLE}}">
</div>
```

**Title**:
Already uses `{{PROJECT_TITLE}}` variable - just set it in config.

---

## Change Storage Mechanism

**From IndexedDB to LocalStorage**:

1. Edit `config.json`:
   ```json
   {
     "architecture": {
       "storage_type": "localstorage"
     }
   }
   ```

2. Update `templates/web-app/js/storage-template.js`:
   - Replace IndexedDB calls with localStorage
   - Simplify data structure (localStorage has 5-10MB limit)

**From IndexedDB to Backend API**:

1. Edit `config.json`:
   ```json
   {
     "architecture": {
       "enable_backend": true,
       "storage_type": "backend"
     }
   }
   ```

2. Generate backend templates:
   ```bash
   ./scripts/generate-backend.sh
   ```

3. Update `templates/web-app/js/storage-template.js`:
   - Replace IndexedDB calls with fetch() API calls
   - Add authentication if needed

---

## Add New Features

**Example**: Add export to PDF

1. **Add library** to `templates/web-app/index-template.html`:
   ```html
   <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
   ```

2. **Add button** to UI:
   ```html
   <button onclick="exportToPDF()">Export to PDF</button>
   ```

3. **Add function** to `templates/web-app/js/export-template.js`:
   ```javascript
   async function exportToPDF() {
     const { jsPDF } = window.jspdf;
     const doc = new jsPDF();
     // Add content...
     doc.save('{{PROJECT_NAME}}.pdf');
   }
   ```

