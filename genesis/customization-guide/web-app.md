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

---

## 🚨 CRITICAL: Validator Alignment (validator-inline.js)

**Every project has TWO validator files that MUST be aligned:**

| File | Location | Purpose |
|------|----------|---------|
| `validator.js` | `validator/js/validator.js` | Standalone Validator tool |
| `validator-inline.js` | `assistant/js/validator-inline.js` | Inline scoring in Assistant Phase 3 |

### Why Alignment Matters

When users complete Phase 3 in the Assistant, they see a quality score in the completion banner. This score comes from `validator-inline.js`. When they paste the same document into the Validator tool, they expect the **same score**.

**If the scoring dimensions differ, users see conflicting scores!**

### What Must Match

Both files MUST have the same:

1. **Scoring dimensions** (the 4 categories that add up to 100 points)
2. **Score calculations** (same logic for each dimension)
3. **Score labels and colors** (same thresholds for Excellent/Good/Needs Work)

### Example: Business Justification Assistant

```javascript
// validator.js scoring dimensions (MUST match validator-inline.js):
// 1. Problem Clarity: 25 points
// 2. Solution Quality: 25 points
// 3. Business Case: 25 points
// 4. Implementation Plan: 25 points

// validator-inline.js MUST use the same dimensions and point values!
```

### Customization Checklist

When creating a new project:

- [ ] Define your 4 scoring dimensions in `validator.js`
- [ ] Copy the scoring logic to `validator-inline.js`
- [ ] Ensure point totals add up to 100 in both files
- [ ] Run `npm test` to verify both validators produce same scores
- [ ] Test manually: paste same document in Assistant (Phase 3) and Validator

### Common Mistake

❌ **WRONG**: Copying `validator-inline.js` from hello-world with generic functions:
```javascript
// Generic functions that don't match your validator.js
scoreDocumentStructure(markdown)
scoreClarity(markdown)
```

✅ **CORRECT**: Creating document-specific functions that match `validator.js`:
```javascript
// Same dimensions as validator.js
scoreProblemClarity(markdown)
scoreSolutionQuality(markdown)
scoreBusinessCase(markdown)
scoreImplementationPlan(markdown)
```
