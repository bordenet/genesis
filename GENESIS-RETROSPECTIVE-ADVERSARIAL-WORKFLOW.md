# Genesis Retrospective: Fix Adversarial Workflow Pattern

## Context

I just fixed a **critical architectural flaw** in the architecture-decision-record project that was bootstrapped from Genesis templates. The app was implementing the WRONG workflow pattern, which defeats the entire purpose of adversarial AI review.

## The Problem

**What Genesis templates currently generate**:
- Apps that AUTO-FILL AI responses using mock functions
- "Generate with AI" buttons that call `generatePhase1Draft()`, `generatePhase2Review()`, etc.
- AI responses are generated IN-APP using the same AI model
- No external AI service integration
- No true adversarial review

**Why this is wrong**:
- Defeats the purpose of adversarial review (different AI models providing independent perspectives)
- Violates the core principle documented in Genesis's own WORKFLOW-ARCHITECTURE.md
- Creates apps that don't match the reference implementations (one-pager, product-requirements-assistant)
- Users never get the benefit of Claude vs Gemini adversarial comparison

## The Correct Pattern (What I Just Implemented)

**Adversarial Workflow Pattern**:
1. **Phase 1**: User fills form → App generates prompt → User copies prompt → User pastes to Claude.ai → User pastes Claude's response back into app
2. **Phase 2**: App generates prompt with Phase 1 output → User copies prompt → User pastes to Gemini → User pastes Gemini's review back into app
3. **Phase 3**: App generates synthesis prompt with Phase 1 + Phase 2 outputs → User copies prompt → User pastes to Claude.ai → User pastes Claude's synthesis back into app

**Key characteristics**:
- App GENERATES PROMPTS, not AI responses
- User MANUALLY copies prompts to external AI services (Claude.ai, Gemini, etc.)
- Different AI models provide independent perspectives
- True adversarial review

## What Needs to Change in Genesis

### 1. Template Files to Update

**`genesis/templates/web-app/js/app-template.js`**:
- REMOVE: Auto-generation methods like `generatePhase1AI()`, `generatePhase2Review()`, `synthesizeADR()`
- ADD: Prompt generation methods like `generatePhase1Prompt()`, `generatePhase2Prompt()`, `generatePhase3Prompt()`
- ADD: Import `loadPrompt` from workflow.js
- CHANGE: Methods should load prompts from `prompts/*.md` files and replace template variables

**`genesis/templates/web-app/js/views-template.js`**:
- CHANGE: Button text from "Generate with AI" to "Generate Prompt for Claude"
- ADD: Prompt display area with copy button and instructions
- ADD: Clear instructions: "1. Copy prompt, 2. Paste to Claude.ai, 3. Paste response back here"
- CHANGE: Textarea labels to indicate where to paste AI responses

**`genesis/templates/web-app/js/ai-mock-template.js`**:
- KEEP: Mock mode for development/testing
- CLARIFY: This is for TESTING ONLY, not production workflow

### 2. Documentation to Update

**`genesis/docs/WORKFLOW-ARCHITECTURE.md`**:
- EMPHASIZE: Apps should generate prompts for external AI services
- CLARIFY: Mock mode is for development/testing, not the primary workflow
- ADD: Clear examples of prompt generation vs auto-filling
- ADD: Warning about the anti-pattern of auto-filling

**`genesis/01-AI-INSTRUCTIONS.md`**:
- ADD: Section on adversarial workflow pattern
- ADD: Explicit instruction: "NEVER auto-fill AI responses in production workflow"
- ADD: Requirement: "Apps MUST generate prompts for users to copy/paste to external AI services"

**`genesis/CLAUDE.md`**:
- ADD: Quality gate: "Verify app generates prompts for external AI services, not auto-fills"
- ADD: Testing requirement: "Test that prompts can be copied and pasted to Claude.ai/Gemini"

### 3. Reference Implementation

**Study the fix I just made**:
- Repository: https://github.com/bordenet/architecture-decision-record
- Commit: 81095e9 "Fix: Implement adversarial workflow pattern with external AI services"
- Files changed: `js/app.js`, `js/views.js`

**Key patterns to copy**:
```javascript
// CORRECT: Generate prompt for external AI
async generatePhase1Prompt() {
  let promptTemplate = await loadPrompt(1);
  promptTemplate = promptTemplate.replace(/\{title\}/g, title);
  // ... more replacements
  
  // Display prompt with copy button
  document.getElementById("prompt-text").textContent = promptTemplate;
  document.getElementById("prompt-display").classList.remove("hidden");
}

// WRONG: Auto-fill with AI (DO NOT USE)
async generatePhase1AI() {
  const aiResult = await generatePhase1Draft(title, context);
  document.getElementById("decision-textarea").value = aiResult.decision;
}
```

## Action Items for Genesis

1. ✅ **Audit all Genesis templates** for auto-generation anti-pattern
2. ✅ **Update templates** to use prompt generation pattern
3. ✅ **Update documentation** to emphasize adversarial workflow
4. ✅ **Add validation** to genesis-validator to detect auto-generation anti-pattern
5. ✅ **Update reference implementations** (one-pager, product-requirements-assistant) if needed
6. ✅ **Test** that new projects follow the correct pattern

## Success Criteria

- [x] Genesis-generated apps display prompts with copy buttons
- [x] Genesis-generated apps have clear instructions for external AI workflow
- [x] Genesis-generated apps do NOT auto-fill AI responses in production workflow
- [x] Genesis documentation clearly explains adversarial workflow pattern
- [x] genesis-validator detects and warns about auto-generation anti-pattern

## Timeline

**Priority**: CRITICAL - This is a fundamental architectural flaw that affects all Genesis-generated projects

**Estimated effort**: 4-6 hours to update all templates and documentation

---

**Bottom line**: Genesis templates are teaching developers to build the WRONG kind of app. Fix this immediately.

