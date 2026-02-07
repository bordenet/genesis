# UI Visual Design Guidelines

> Standards for consistent UI/UX across all genesis document assistants.

## Project Tile Status Display

Every project tile on the landing page must show document status.

### In-Progress Documents

Show phase completion progress:

```
┌─────────────────────────┐
│ 📄 My Document          │
│ Phase Progress: 2/3     │
│ [Continue →]            │
└─────────────────────────┘
```

### Completed Documents

Show quality score with color indicator:

```
┌─────────────────────────┐
│ 📄 My Document          │
│ Quality Score: 85       │  ← Green (≥80), Yellow (50-79), Red (<50)
│ [View →]                │
└─────────────────────────┘
```

### Required Code Elements

In `views.js`:

```javascript
// Store validation results
let scoreData = null;

// Compute phase completion
const completedPhases = /* count completed phases */;

// For completed documents
scoreData = validateDocument(doc);
const scoreColor = getScoreColor(scoreData.score);
const scoreLabel = getScoreLabel(scoreData.score);

// Display in tile
<span>Quality Score: ${scoreData.score}</span>
// or
<span>Phase Progress: ${completedPhases}/3</span>
```

---

## Navigation Dropdown Order

The "Related Tools" dropdown must list tools in canonical order, excluding self:

1. One-Pager
2. PRD Assistant  
3. Acceptance Criteria
4. ADR Tool
5. Business Justification
6. JD Assistant
7. PR-FAQ Assistant
8. Power Statement
9. Strategic Proposal

**Why?** Consistent navigation helps users find tools quickly.

---

## Footer Requirements

Every project must include in the footer:

```html
<a href="https://github.com/bordenet/genesis/blob/main/BACKGROUND.md">
  About Genesis
</a>
```

**Why?** Users should be able to learn about the genesis project ecosystem.

---

## Import Document Feature

### Required UI Elements

1. **Import tile** on landing page with 📥 icon
2. **Modal** with contenteditable input area
3. **Validation feedback** showing quality score
4. **Save button** with double-click prevention

### Double-Click Prevention Pattern

```javascript
let isSaving = false;

async function saveImportedDocument() {
  if (isSaving) return;  // Guard clause
  isSaving = true;
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';
  
  try {
    // ... save logic ...
  } finally {
    isSaving = false;
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save';
  }
}
```

**Why?** Prevents duplicate document creation from impatient clicks.

---

## Dark Mode Support

All projects should support dark mode via CSS custom properties:

```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #1a1a2e;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1a1a2e;
    --text-primary: #e8e8e8;
  }
}
```

---

## Validation and Enforcement

These guidelines are enforced by the [project-diff tool](../project-diff/README.md):

```bash
cd genesis/project-diff
node diff-projects.js --summary
```

The fit-and-finish checks verify:
- Navigation dropdown order
- Footer GitHub link
- Double-click prevention
- Import tile presence
- Project tile status display

