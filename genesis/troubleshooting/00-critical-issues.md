# Genesis Troubleshooting Guide

Common issues when creating projects from Genesis templates and how to fix them.

---

## 🚨 Critical Issues (Reverse-Integration Findings)

**Source**: Power Statement Assistant project (2024-12-09)
**Status**: All 7 issues have been fixed in Genesis templates as of 2024-12-09

These were the most common issues that prevented generated apps from working immediately after generation. They have all been fixed in the templates, but this section documents them for reference and troubleshooting.

### Quick Validation

Run these scripts to validate your generated project:

```bash
# Check for unreplaced template placeholders (Issue #3)
./genesis/scripts/validate-template-placeholders.sh .

# Comprehensive test suite (all 7 issues)
./genesis/scripts/test-generated-project.sh .
```

### Issue #1: Storage Export Mismatch ✅ FIXED

**Symptom**: `TypeError: storage.saveProject is not a function`

**Cause**: Template used named export (`export const storage = new Storage()`) but imports expected default export (`import storage from './storage.js'`)

**Fix**: Changed to `export default new Storage()` in storage-template.js

### Issue #2: HTML Element ID Mismatch ✅ FIXED

**Symptom**: `Cannot read properties of null (reading 'appendChild')`

**Cause**: JavaScript referenced `app-container` but HTML used different ID

**Fix**: Standardized on `id="app-container"` throughout templates

### Issue #3: Unreplaced Template Placeholders ✅ VALIDATION ADDED

**Symptom**: App shows `{{PROJECT_NAME}}` or `{{DB_NAME}}` in UI or code

**Cause**: Template generation script didn't replace all variables

**Fix**: Created `validate-template-placeholders.sh` script that runs automatically

### Issue #4: Missing Workflow Functions ✅ FIXED

**Symptom**: `ReferenceError: getPhaseMetadata is not defined`

**Cause**: project-view.js expected standalone functions but workflow.js only had class methods

**Fix**: Added standalone exported functions to workflow-template.js:
- `getPhaseMetadata(phaseNumber)`
- `generatePromptForPhase(project, phaseNumber)`
- `exportFinalDocument(project)`

### Issue #5: PRD-Specific Naming ✅ FIXED

**Symptom**: Generated app references "PRD" instead of generic document type

**Cause**: Template used `exportFinalPRD` instead of generic name

**Fix**: Changed to `exportFinalDocument` and `export-document-btn` throughout

### Issue #6: Missing HTML Elements ✅ FIXED

**Symptom**: `Cannot read properties of null (reading 'classList')`

**Cause**: JavaScript referenced `loading-overlay` or `toast-container` but HTML didn't have them

**Fix**: Added both elements to index-template.html

### Issue #7: Missing Storage Methods ✅ FIXED

**Symptom**: `TypeError: storage.getPrompt is not a function`

**Cause**: app.js and other files called methods that didn't exist in Storage class

**Fix**: Added missing methods to storage-template.js:
- `getPrompt(phase)`
- `savePrompt(phase, content)`
- `getSetting(key)`
- `saveSetting(key, value)`
- `getStorageEstimate()` (alias for getStorageInfo)

