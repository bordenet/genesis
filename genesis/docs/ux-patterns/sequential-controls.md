# UX Patterns: Sequential Controls

> Part of [Genesis UX Patterns](../UX-PATTERNS.md)

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

