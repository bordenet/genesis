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

---

## Import Document Feature (MUST CUSTOMIZE)

Every genesis project includes an Import Document feature that allows users to paste existing documents from Word/Google Docs. The feature converts HTML to Markdown, scores the result, and optionally suggests LLM cleanup.

### Files Involved

| File | Purpose | Customization |
|------|---------|---------------|
| `shared/js/lib/turndown.js` | HTML-to-Markdown library | Copy from hello-world (no changes) |
| `shared/js/import-document.js` | Import modal and logic | **MUST customize** |
| `shared/js/views.js` | Import tile and event handler | Already integrated |
| `index.html` | Turndown script tag | Already integrated |
| `assistant/index.html` | Turndown script tag | Already integrated |
| `eslint.config.js` | TurndownService global | Already integrated |

### What to Customize in `import-document.js`

```javascript
// ❌ WRONG - Using template defaults
const DOC_TYPE = 'Hello World';
const DOC_TYPE_SHORT = 'Document';

// ✅ CORRECT - Your document type
const DOC_TYPE = 'Business Justification';
const DOC_TYPE_SHORT = 'Justification';
```

### LLM Cleanup Prompt Structure

The `LLM_CLEANUP_PROMPT` constant defines the suggested document structure shown to users when their imported document scores below `MINIMUM_VIABLE_SCORE` (30%). Customize this to match your document type:

```javascript
const LLM_CLEANUP_PROMPT = `You are a documentation assistant. Convert this pasted ${DOC_TYPE} content into clean, well-structured Markdown.

**Rules:**
- Preserve ALL substantive content
- Use proper Markdown headings (# ## ###)
- Convert bullet points to Markdown lists
- Convert tables to Markdown tables
- Remove formatting artifacts (font names, colors, etc.)
- Do NOT add commentary - output ONLY the cleaned Markdown

**Suggested ${DOC_TYPE} Structure:**
# Business Justification: [Title]
## Problem Statement
## Proposed Solution
## Business Case
## Implementation Plan
## Risks and Mitigations

**Content to convert:**
`;
```

### How the Import Flow Works

1. User clicks "Import" tile on New Project screen
2. Modal opens with contenteditable paste area
3. User pastes from Word/Docs (preserves HTML formatting)
4. User clicks "Convert to Markdown"
5. Turndown.js converts HTML → Markdown
6. `validator-inline.js` scores the result
7. If score < 30%, LLM cleanup prompt is shown
8. User can copy prompt to Claude/ChatGPT for cleanup
9. User clicks "Save & Continue to Phase 1"
10. Project is created with imported content in Phase 1

### Testing the Import Feature

After customization, verify:

- [ ] Import tile appears on New Project screen
- [ ] Clicking Import opens the modal
- [ ] Pasting from Word preserves structure (headings, lists, tables)
- [ ] Convert button produces readable Markdown
- [ ] Score badge shows correct color and label
- [ ] Low scores show LLM cleanup suggestion
- [ ] Copy Prompt button works
- [ ] Save creates project and navigates to Phase 1
- [ ] Imported content appears in Phase 1 response area
