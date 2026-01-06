# Genesis UX Patterns

**Critical UX patterns for AI workflow applications.** These patterns were refined through testing in power-statement-assistant, one-pager, and product-requirements-assistant projects.

---

## Overview

These 12 patterns improve user experience in multi-phase AI workflow applications. All patterns are implemented in `genesis/templates/web-app/js/project-view-template.js`.

| Pattern | Purpose | Implementation |
|---------|---------|----------------|
| Sequential Button Reveal | Guides user through workflow | Open AI button disabled until Copy Prompt clicked |
| Sequential Textarea Enable | Prevents premature input | Response textarea disabled until prompt copied |
| Shared Browser Tab | Reduces tab clutter | All AI links use `target="ai-assistant-tab"` |
| Auto-Advance on Save | Smooth flow | Saving response auto-advances to next phase |
| Step A/B Labeling | Avoids confusion | Use letters (A/B) for sub-steps, not numbers |
| Dynamic AI Name Labels | Clear context | Show "Claude"/"Gemini", not generic "AI" |
| Footer Stats Auto-Update | Always current | Project count updates after create/delete |
| Phase Tab Underline Sync | Visual consistency | Active tab underline updates from all navigation |
| Export Button for Completed | Quick export access | Completed projects show Export button in home view |
| Export Attribution | Source tracking | Exported markdown includes tool attribution footer |
| Cross-Site Navigation | Tool discovery | Header links to related assistant tools |
| Landing Page Validator Link | Quality awareness | Empty state links to validator with target score |

---

## Pattern 1: Sequential Button Reveal

**Problem**: Users click "Open AI" before copying the prompt, leading to confusion.

**Solution**: Disable the "Open AI" button until "Copy Prompt" is clicked.

```javascript
// Determine if Open AI button should be enabled
const openAiEnabled = promptCopiedForCurrentPhase || phaseData.prompt;

// Render with conditional styling
<a id="open-ai-btn" class="${openAiEnabled 
    ? 'bg-purple-600 text-white' 
    : 'bg-gray-300 cursor-not-allowed pointer-events-none'}"
    ${openAiEnabled ? '' : 'aria-disabled="true"'}>
```

**Testing Checklist**:
- [ ] Open AI button is disabled when page loads
- [ ] Open AI button enables after Copy Prompt clicked
- [ ] Button state persists if user returns to completed phase

---

## Pattern 2: Sequential Textarea Enable

**Problem**: Users paste responses before copying the prompt, missing context.

**Solution**: Disable the response textarea until prompt is copied.

```javascript
const hasExistingResponse = phaseData.response?.trim().length > 0;
const textareaEnabled = hasExistingResponse || promptCopiedForCurrentPhase;

<textarea id="response-textarea"
    ${textareaEnabled ? '' : 'disabled'}
    class="${textareaEnabled ? '' : 'bg-gray-100 cursor-not-allowed'}"
    placeholder="${textareaEnabled ? 'Paste response...' : 'Copy prompt first...'}"
>
```

**Testing Checklist**:
- [ ] Textarea disabled on fresh phase
- [ ] Textarea enables after Copy Prompt
- [ ] Textarea auto-focuses after enabling
- [ ] Textarea enabled if returning to phase with existing response

---

## Pattern 3: Shared Browser Tab

**Problem**: Opening AI links creates many browser tabs.

**Solution**: All AI links open in the same named tab.

```html
<a href="https://claude.ai/new" target="ai-assistant-tab" rel="noopener">
    Open Claude
</a>
```

**Testing Checklist**:
- [ ] All phases open AI in same tab (no new tabs)
- [ ] User can switch between phases without creating tabs

---

## Pattern 4: Auto-Advance on Save

**Problem**: User must manually click "Next Phase" after saving.

**Solution**: Automatically advance to next phase when response is saved.

```javascript
saveResponseBtn.addEventListener('click', async () => {
    await updatePhase(project.id, phase, prompt, response);
    
    if (!isFinalPhase) {
        project.phase = phase + 1;
        document.getElementById('phase-content').innerHTML = 
            renderPhaseContent(project, phase + 1);
        updatePhaseTabStyles(phase + 1);
        attachPhaseEventListeners(project, phase + 1);
    }
});
```

**Testing Checklist**:
- [ ] Save advances to next phase (phases 1, 2)
- [ ] Final phase does NOT auto-advance
- [ ] Tab underline updates on advance

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

---

## Pattern 9: Export Button for Completed Projects

**Problem**: Completed projects in home view have no way to export without re-opening.

**Solution**: Show Export button on completed projects in the project list.

```javascript
function renderProjectList(projects) {
    return projects.map(p => {
        const isComplete = p.phase > WORKFLOW_CONFIG.phaseCount;
        return `
            <div class="project-card">
                <div class="project-info">
                    <h3>${p.title}</h3>
                    ${isComplete ? `
                        <span class="badge badge-success">✓ Complete</span>
                    ` : `
                        <span>Phase ${p.phase} of ${WORKFLOW_CONFIG.phaseCount}</span>
                    `}
                </div>
                <div class="project-actions">
                    ${isComplete ? `
                        <button onclick="exportProject('${p.id}')" class="btn btn-success">
                            Export
                        </button>
                    ` : ''}
                    <button onclick="deleteProject('${p.id}')" class="btn btn-danger">
                        Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}
```

**Testing Checklist**:

- [ ] Completed projects show Export button
- [ ] In-progress projects do NOT show Export button
- [ ] Export button downloads markdown file

---

## Pattern 10: Export Attribution

**Problem**: Exported documents have no attribution, so readers don't know the source.

**Solution**: Add attribution footer to all exported markdown.

```javascript
exportAsMarkdown() {
    const finalOutput = this.getPhaseOutput(3);
    const attribution = '\n\n---\n\n*Generated with [Tool Name](https://url-to-tool/)*';

    if (finalOutput) {
        return finalOutput + attribution;
    }
    // ... fallback logic
}
```

**Testing Checklist**:

- [ ] Exported markdown includes attribution footer
- [ ] Attribution link points to the tool's URL
- [ ] Attribution is styled as italics

---

## Pattern 11: Cross-Site Navigation Links

**Problem**: Each assistant tool is isolated - users don't know about related tools.

**Solution**: Include navigation links to related assistants in header and README.

```html
<!-- In app header -->
<nav class="related-tools">
    <span class="text-gray-400">Related:</span>
    <a href="https://bordenet.github.io/pr-faq-assistant/" target="_blank">PR-FAQ</a>
    <a href="https://bordenet.github.io/one-pager/" target="_blank">One-Pager</a>
    <a href="https://bordenet.github.io/product-requirements-assistant/" target="_blank">PRD</a>
</nav>
```

**Testing Checklist**:

- [ ] Header includes links to related tools
- [ ] Links open in new tabs
- [ ] README has "Related Projects" table

---

## Pattern 12: Landing Page Validator Link

**Problem**: Landing page doesn't link to the validator tool that scores documents.

**Solution**: Empty state should mention the validator and target score.

```html
<p class="text-sm text-gray-400">
    Documents are optimized for
    <a href="https://github.com/bordenet/genesis" target="_blank"
       class="text-blue-500 hover:underline">
        genesis-validator
    </a>
    (70+ score target)
</p>
```

**Testing Checklist**:

- [ ] Empty state mentions validator
- [ ] Link to validator works
- [ ] Target score is displayed

---

## Reference Implementations

- **power-statement-assistant**: https://github.com/bordenet/power-statement-assistant
- **one-pager**: https://github.com/bordenet/one-pager
- **product-requirements-assistant**: https://github.com/bordenet/product-requirements-assistant
- **pr-faq-assistant**: https://github.com/bordenet/pr-faq-assistant

All 12 patterns are implemented in `genesis/templates/web-app/js/project-view-template.js`.

