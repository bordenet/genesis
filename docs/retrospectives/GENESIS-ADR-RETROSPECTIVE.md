# Genesis Retrospective: Architecture Decision Record App Failures

## Summary

This document captures all the issues discovered in the Genesis-generated ADR app and the fixes applied. This will be used to update Genesis templates to prevent these issues in future projects.

---

## Critical Failures Discovered & Fixed

### 1. **Wrong Workflow Pattern** ✅ FIXED
**Problem**: App was auto-filling AI responses instead of generating prompts for external AI services

**Root Cause**: Genesis templates don't include the adversarial workflow pattern

**Fix Applied**:
- Changed from auto-fill to prompt generation workflow
- Phase 1: Generate prompt → Copy to Claude → Paste response
- Phase 2: Generate prompt → Copy to Gemini → Paste review
- Phase 3: Generate prompt → Copy to Claude → Paste synthesis

---

### 2. **Prompts Included Meta-Instructions** ✅ FIXED
**Problem**: Prompts included "What to do" instructions meant for users, confusing the AI

**Example of BAD prompt**:
```
# Phase 2: Review & Critique

**What to do**:
1. Copy the Phase 1 draft to your preferred AI...
2. Ask for critical feedback...

**Sample feedback prompts**:
> "Review this ADR for completeness..."
```

**Fix Applied**: Rewrote all prompts to be direct AI-to-AI communication:
```
You are reviewing an Architecture Decision Record (ADR).

Here is the ADR:
{phase1_output}

Provide critical feedback on:
- Completeness of the decision
- Validity of the context
- Realism of the consequences

Be constructive but critical.
```

---

### 3. **Wrong ADR Template** ✅ FIXED
**Problem**: App used a non-standard ADR template with "Rationale" section

**Official Michael Nygard Template**:
- Title
- Status
- Context
- Decision
- Consequences

**Our Template** (WRONG):
- Title ✅
- Status ✅
- Context ✅
- Decision ✅
- Consequences ✅
- **Rationale** ❌ (NOT in official template)

**Fix Applied**: Removed Rationale from all prompts and data model

---

### 4. **Phase 2/3 UI Didn't Match Phase 1** ✅ FIXED
**Problem**: Phase 1 had clean Step 1/Step 2 workflow, but Phase 2/3 were broken

**Phase 1** (GOOD):
- Step 1: Copy Prompt to Claude (button + preview)
- Step 2: Paste Claude's Response (single textarea)

**Phase 2/3** (BROKEN):
- No Step 1 (no prompt generation)
- Prompt was put INTO the response textarea
- No modal for viewing full prompt

**Fix Applied**:
- Added Step 1/Step 2 sections to Phase 2 and Phase 3
- Added prompt preview areas
- Added modals for viewing full prompts
- Prompts now copy to clipboard (not textarea)

---

### 5. **Data Model Mismatch** ✅ FIXED
**Problem**: Phase 2/3 tried to access `project.decision`, `project.consequences`, `project.rationale` which don't exist

**Old Data Model**:
```javascript
{
  title: "",
  status: "",
  context: "",
  decision: "",      // ❌ Doesn't exist
  consequences: "",  // ❌ Doesn't exist
  rationale: ""      // ❌ Doesn't exist
}
```

**New Data Model**:
```javascript
{
  title: "",
  status: "",
  context: "",
  phase1Response: "",  // ✅ Complete ADR from Claude
  phase2Review: "",    // ✅ Gemini's critique
  phase2Prompt: "",    // ✅ Saved Phase 2 prompt
  phase3Prompt: "",    // ✅ Saved Phase 3 prompt
  finalADR: ""         // ✅ Final synthesized ADR
}
```

---

### 6. **Prompt Put IN Response Textarea** ✅ FIXED
**Problem**: `generatePhase2Prompt()` did this:
```javascript
reviewTextarea.value = "PROMPT FOR GEMINI:\n\n" + promptTemplate;
```

**Fix Applied**: Now copies to clipboard and shows preview:
```javascript
await navigator.clipboard.writeText(promptTemplate);
showToast("Prompt copied to clipboard!", "success");
this.renderPhase2Form(); // Re-render to show preview
```

---

## Genesis Template Fixes Required

Based on these failures, Genesis templates need:

### 1. **Adversarial Workflow Pattern**
- Multi-phase forms with prompt generation
- "Copy Prompt" buttons that auto-copy to clipboard
- Single textarea for pasting AI responses (not multiple fields)
- Step 1/Step 2 UI pattern

### 2. **Prompt Template Directory**
- `prompts/` directory in generated projects
- Clean AI-to-AI prompts (no meta-instructions)
- Variable substitution: `{phase1_output}`, `{phase2_review}`, etc.

### 3. **Correct Data Model**
- Store complete AI responses, not parsed fields
- `phase1Response`, `phase2Review`, `finalADR` pattern
- Save prompts for reference: `phase1Prompt`, `phase2Prompt`, etc.

### 4. **UI Components**
- Prompt preview areas
- Modals for viewing full prompts
- Copy to clipboard functionality
- Consistent button layouts across phases

### 5. **Validation**
- Check for "Copy Prompt" buttons in multi-phase workflows
- Check for prompt template files
- Check for separation of user instructions from AI prompts
- Validate data model matches workflow

---

## Files Changed

### Prompt Templates
- `prompts/phase1.md` - Removed Rationale, clean AI prompt
- `prompts/phase2.md` - Removed meta-instructions, uses `{phase1_output}`
- `prompts/phase3.md` - Removed meta-instructions, uses `{phase1_output}` and `{phase2_review}`

### JavaScript
- `js/app.js`:
  - Updated data model (removed decision/consequences/rationale)
  - Fixed `generatePhase2Prompt()` - uses phase1Response, copies to clipboard
  - Fixed `generatePhase3Prompt()` - uses phase1Response and phase2Review
  - Updated `setupPhase2Handlers()` - added modal handlers
  - Updated `setupPhase3Handlers()` - added modal handlers
  - Updated `savePhase2Data()` - uses new textarea ID
  - Updated `savePhase3Data()` - uses new textarea ID

- `js/views.js`:
  - Rewrote `renderPhase2Form()` - Step 1/Step 2 pattern, modal
  - Rewrote `renderPhase3Form()` - Step 1/Step 2 pattern, modal

### Tests
- `tests/views.test.js` - Updated to use new textarea IDs

---

## Lessons Learned for Genesis

1. **Always implement adversarial workflow pattern** for AI-assisted apps
2. **Prompts should be AI-to-AI** - no user instructions in prompts
3. **Use official templates** - research before implementing (ADR, PRD, etc.)
4. **Consistent UI patterns** - all phases should follow same structure
5. **Data model should match workflow** - store complete responses, not parsed fields
6. **Copy to clipboard, not textarea** - prompts go to clipboard, responses go to textarea
7. **Test all phases** - E2E tests should cover every phase, not just Phase 1
