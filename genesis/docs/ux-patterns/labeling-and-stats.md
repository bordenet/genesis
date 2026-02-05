# UX Patterns: Labeling and Stats

> Part of [Genesis UX Patterns](../UX-PATTERNS.md)

---

## Pattern 5: Step A/B Labeling

**Problem**: "Step 1" and "Step 2" confuse users already in "Phase 1/2/3".

**Solution**: Use letters (A/B) for sub-steps within phases.

```html
<h4>Step A: Copy Prompt to Claude</h4>
<h4>Step B: Paste Claude's Response</h4>
```

**Testing Checklist**:
- [ ] All phases use "Step A" and "Step B" labels
- [ ] No numbered steps within phases

---

## Pattern 6: Dynamic AI Name Labels

**Problem**: Generic "AI" labels don't tell user which AI to use.

**Solution**: Display specific AI names (Claude, Gemini) in all labels.

```javascript
// Get AI name from phase metadata
const aiName = meta.ai || meta.aiModel;

<h4>Step A: Copy Prompt to ${aiName}</h4>
<h4>Step B: Paste ${aiName}'s Response</h4>
<div>Use with ${aiName}</div>
```

**Testing Checklist**:
- [ ] Phase 1 shows "Claude" (or configured AI)
- [ ] Phase 2 shows "Gemini" (or configured AI)
- [ ] Phase 3 shows "Claude" (or configured AI)

---

## Pattern 7: Footer Stats Auto-Update

**Problem**: Project count in footer becomes stale after operations.

**Solution**: Call `updateStorageInfo()` after every route render.

```javascript
// In router.js - after every navigation
export async function navigateTo(route, ...params) {
    await handler(...params);
    await updateStorageInfo();  // Always update footer
}

export async function updateStorageInfo() {
    const projects = await storage.getAllProjects();
    const storageInfo = document.getElementById('storage-info');
    if (storageInfo) {
        storageInfo.textContent = `${projects.length} project${projects.length !== 1 ? 's' : ''} stored`;
    }
}
```

**Testing Checklist**:
- [ ] Footer shows correct count on page load
- [ ] Count updates after creating project
- [ ] Count updates after deleting project

---

## Pattern 8: Phase Tab Underline Sync

**Problem**: Phase tab underline doesn't update when navigating via buttons.

**Solution**: Call `updatePhaseTabStyles()` on ALL navigation methods.

```javascript
function updatePhaseTabStyles(activePhase) {
    document.querySelectorAll('.phase-tab').forEach(tab => {
        const phase = parseInt(tab.dataset.phase);
        if (phase === activePhase) {
            tab.classList.add('border-b-2', 'border-blue-600');
        } else {
            tab.classList.remove('border-b-2', 'border-blue-600');
        }
    });
}

// Call on: tab click, prev/next buttons, auto-advance
```

**Testing Checklist**:
- [ ] Tab underline updates on tab click
- [ ] Tab underline updates on Previous/Next buttons
- [ ] Tab underline updates on auto-advance (save)

