# The 7-Step Adversarial Workflow Pattern

**The Core Pattern That Makes Genesis Projects Excellent**

---

```text
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  ⚠️  THIS IS THE MOST IMPORTANT PATTERN IN GENESIS  ⚠️                      ║
║                                                                              ║
║  Every document-generation app MUST follow this pattern.                    ║
║  Missing even ONE step results in inferior documents.                        ║
║                                                                              ║
║  Read this entire document BEFORE implementing ANY Genesis project.         ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

## Table of Contents

1. [Overview](#overview)
2. [Why This Pattern Exists](#why-this-pattern-exists)
3. [The 7 Steps in Detail](#the-7-steps-in-detail)
4. [Data Flow Diagram](#data-flow-diagram)
5. [Code Examples](#code-examples)
6. [Common Mistakes](#common-mistakes)
7. [Quality Checklist](#quality-checklist)
8. [Reference Implementations](#reference-implementations)

---

## Overview

The 7-Step Adversarial Workflow Pattern is a systematic approach to generating high-quality documents using multiple AI models in an adversarial review process.

**Core Principle:** Different AI models provide different perspectives. By having one AI (Claude) generate a draft, another AI (Gemini) critique and improve it, and then Claude synthesize the best of both, we produce documents far superior to single-AI generation.

**Key Characteristics:**

- ✅ Apps generate PROMPTS for external AI services
- ✅ Users manually copy/paste between app and AI services
- ✅ Different AIs provide independent perspectives
- ✅ AIs ask clarifying questions throughout the process
- ✅ Each step builds on previous steps
- ✅ Final document benefits from adversarial review

**Anti-Pattern (WRONG):**

- ❌ Apps auto-generate AI responses
- ❌ Same AI used for all phases
- ❌ No questions asked
- ❌ Single-shot generation

---

## Why This Pattern Exists

### The Problem with Single-AI Document Generation

When a single AI generates a document in one shot:

- **Blind spots:** Every AI has biases and knowledge gaps
- **No review:** Errors and omissions go unnoticed
- **No iteration:** User doesn't get to refine through questions
- **Mediocre results:** Document is "good enough" but not excellent

### The Power of Adversarial Review

When multiple AIs collaborate adversarially:

- **Diverse perspectives:** Claude's strengths + Gemini's strengths
- **Error detection:** What one AI misses, another catches
- **Question-driven refinement:** User clarifies ambiguities iteratively
- **Excellent results:** Final document benefits from multiple viewpoints

### Real-World Example

**Single-AI approach:**

```text
User: "Generate a PRD for a mobile app"
AI: [generates 500-line document]
Result: Missing key sections, some assumptions are wrong, no user input
Quality: 6/10
```

**Adversarial approach:**

```text
Step 1-3: Claude generates initial draft, asking questions
          "What's your target user age range?"
          "How will you monetize?"
          User answers, Claude refines

Step 4-5: Gemini reviews: "This PRD lacks competitor analysis"
          "Success metrics are vague - can you quantify?"
          User answers, Gemini improves document

Step 6-7: Claude synthesizes both drafts
          "I see Gemini added ROI projections - let me integrate that"
          Final document has best of both

Result: Comprehensive PRD with no gaps, user-validated assumptions
Quality: 9/10
```

---

## The 7 Steps in Detail

> **For complete code examples, see:** [`examples/WORKFLOW-CODE-EXAMPLES.md`](examples/WORKFLOW-CODE-EXAMPLES.md)

### Step 1: Gather Input from User

**Purpose:** Collect all necessary information before generating any prompts.

| Action | Details |
|--------|---------|
| Display form | Based on document schema/outline |
| Validate input | Required fields, format checks |
| Store data | `project.formData` object |

**Common Mistakes:** Skipping validation, not persisting data, proceeding with incomplete info.

---

### Step 2: Generate Prompt for Claude (Phase 1)

**Purpose:** Create a prompt that Claude will use to generate the initial draft.

| Action | Details |
|--------|---------|
| Load template | `prompts/phase1.md` |
| Replace variables | `{project_name}` → form data |
| Display prompt | With "Copy to Clipboard" button |
| User copies | To Claude.ai (external) |

**Critical:** Prompt MUST instruct Claude to "ask clarifying questions."

**Common Mistakes:** Auto-generating response, not requesting questions, missing variable replacements.

---

### Step 3: Collect Markdown from Claude

**Purpose:** Capture Claude's generated document with user's refinements.

| Action | Details |
|--------|---------|
| User pastes to Claude | External AI service |
| Claude asks questions | User answers in conversation |
| User copies response | Complete markdown document |
| App validates | Not empty, is markdown, reasonable length |
| App stores | `project.phases[0].response` |

**Common Mistakes:** Not validating format, accepting partial responses.

---

### Step 4: Construct Adversarial Prompt for Gemini (Phase 2)

**Purpose:** Generate a prompt that instructs Gemini to critique and improve Claude's draft.

| Action | Details |
|--------|---------|
| Load template | `prompts/phase2.md` |
| Inject Phase 1 | `{phase1_output}` → Claude's response |
| Add "forget" clause | For same-LLM detection |
| Display prompt | With "Copy to Clipboard" button |

**Critical:** Include "FORGET all previous sessions" clause. Request STRONG critique AND improved version.

**Common Mistakes:** Not including full Phase 1 document, missing forget clause.

---

### Step 5: Collect Improved Document from Gemini

**Purpose:** Capture Gemini's critique and improved version.

| Action | Details |
|--------|---------|
| User pastes to Gemini | External AI service |
| Gemini critiques | Asks questions, provides improvements |
| User copies response | Complete critique + improved doc |
| App validates | Contains critique markers |
| App stores | `project.phases[1].response` |

**Common Mistakes:** Accepting response without critique, truncated responses.

---

### Step 6: Generate Final Synthesis Prompt for Claude (Phase 3)

**Purpose:** Create a prompt for Claude to synthesize both drafts into final document.

| Action | Details |
|--------|---------|
| Load template | `prompts/phase3.md` |
| Inject Phase 1 | `{phase1_output}` → Claude's original |
| Inject Phase 2 | `{phase2_output}` → Gemini's critique |
| Display prompt | With "Copy to Clipboard" button |

**Critical:** Both Phase 1 AND Phase 2 must be included. Emphasize synthesis, not just picking one.

**Common Mistakes:** Only including one previous output, not emphasizing synthesis.

---

### Step 7: Collect Final Result from Claude

**Purpose:** Capture the final synthesized document.

| Action | Details |
|--------|---------|
| User pastes to Claude | External AI service |
| Claude synthesizes | Best of both versions |
| User copies response | Final markdown document |
| App stores | `project.phases[2].response` AND `project.finalDocument` |
| App shows completion | Download/export options |

**Result:** Excellent document through adversarial review! 🎉

**Common Mistakes:** Not marking workflow complete, no download option.

---

## Data Flow Diagram

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         THE 7-STEP WORKFLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 1: GATHER INPUT
┌──────────────┐
│ User fills   │
│ form with    │──────▶ Stored in project.formData
│ requirements │
└──────────────┘

                    ↓

STEP 2: GENERATE CLAUDE PROMPT (Phase 1)
┌──────────────────────────────┐
│ Load prompts/phase1.md       │
│ Replace {variables}          │──────▶ Stored in project.phases[0].prompt
│ Display with copy button     │
└──────────────────────────────┘
                    │
                    │ User copies
                    ↓
            ┌──────────────┐
            │  Claude.ai   │
            │  (external)  │
            └──────────────┘
                    │ Claude asks questions
                    │ User answers
                    │ Claude generates document
                    ↓

STEP 3: COLLECT CLAUDE'S DOCUMENT
┌──────────────────────────────┐
│ User pastes markdown         │
│ App validates response       │──────▶ Stored in project.phases[0].response
│ Mark Phase 1 complete        │
└──────────────────────────────┘

                    ↓

STEP 4: GENERATE GEMINI PROMPT (Phase 2)
┌──────────────────────────────┐
│ Load prompts/phase2.md       │
│ Inject {phase1_output}       │──────▶ Stored in project.phases[1].prompt
│ Apply same-LLM detection     │
│ Display with copy button     │
└──────────────────────────────┘
                    │
                    │ User copies
                    ↓
            ┌──────────────┐
            │   Gemini     │
            │  (external)  │
            └──────────────┘
                    │ Gemini critiques
                    │ Gemini asks questions
                    │ User answers
                    │ Gemini provides improved doc
                    ↓

STEP 5: COLLECT GEMINI'S IMPROVED DOCUMENT
┌──────────────────────────────┐
│ User pastes markdown         │
│ App validates critique       │──────▶ Stored in project.phases[1].response
│ Mark Phase 2 complete        │
└──────────────────────────────┘

                    ↓

STEP 6: GENERATE FINAL SYNTHESIS PROMPT (Phase 3)
┌──────────────────────────────┐
│ Load prompts/phase3.md       │
│ Inject {phase1_output}       │
│ Inject {phase2_output}       │──────▶ Stored in project.phases[2].prompt
│ Display with copy button     │
└──────────────────────────────┘
                    │
                    │ User copies
                    ↓
            ┌──────────────┐
            │  Claude.ai   │
            │  (external)  │
            └──────────────┘
                    │ Claude synthesizes both
                    │ Claude asks final questions
                    │ User answers
                    │ Claude generates final doc
                    ↓

STEP 7: COLLECT FINAL DOCUMENT
┌──────────────────────────────┐
│ User pastes final markdown   │
│ App validates response       │──────▶ Stored in project.phases[2].response
│ Mark workflow complete       │        AND project.finalDocument
│ Show completion screen       │
└──────────────────────────────┘

                    ↓

            ✨ EXCELLENT DOCUMENT! ✨
```

---

## Code Examples

**For complete implementation examples, see:** [`examples/WORKFLOW-CODE-EXAMPLES.md`](examples/WORKFLOW-CODE-EXAMPLES.md)

Key code patterns:

```javascript
// Template variable replacement
function replaceVars(template, vars) {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value || '');
  }
  return result;
}

// Phase 2 prompt generation (includes Phase 1 output)
const phase2Prompt = template.replace(/\{phase1_output\}/g, phase1Response);

// Phase 3 prompt generation (includes BOTH outputs)
const phase3Prompt = template
  .replace(/\{phase1_output\}/g, phase1Response)
  .replace(/\{phase2_output\}/g, phase2Response);
```

---

## Common Mistakes

**For detailed anti-patterns with examples, see:** [`ANTI-PATTERNS.md`](ANTI-PATTERNS.md)

Quick reference:

| Mistake | What's Wrong | Fix |
|---------|--------------|-----|
| Auto-generation | App calls AI API directly | Display prompt with "Copy" button |
| Same AI all phases | No adversarial perspective | Claude → Gemini → Claude |
| No questions | Single-shot generation | Prompt says "ask clarifying questions" |
| Skipping steps | Phase 3 without Phase 1/2 | Validate previous phases complete |
| Missing context | Phase 2 without `{phase1_output}` | Include full previous output |
| Stillborn buttons | UI elements with no handlers | Wire handlers immediately |

---

## Quality Checklist

Use this checklist to verify correct implementation:

### Implementation Checklist

- [ ] **Step 1: Form Collection**
  - [ ] Form has all required fields
  - [ ] Form validates input
  - [ ] Form data stored in `project.formData`

- [ ] **Step 2: Phase 1 Prompt**
  - [ ] Loads `prompts/phase1.md`
  - [ ] Replaces ALL template variables
  - [ ] Displays prompt (doesn't send to API)
  - [ ] Has "Copy Prompt" button
  - [ ] Prompt instructs AI to ask questions

- [ ] **Step 3: Phase 1 Response**
  - [ ] Textarea for user to paste
  - [ ] Validates response (not empty, is markdown)
  - [ ] Stores in `project.phases[0].response`
  - [ ] Marks phase as completed

- [ ] **Step 4: Phase 2 Prompt**
  - [ ] Loads `prompts/phase2.md`
  - [ ] Injects complete Phase 1 output
  - [ ] Includes "forget" clause
  - [ ] Requests critique and improved version
  - [ ] Displays with copy button

- [ ] **Step 5: Phase 2 Response**
  - [ ] Textarea for user to paste
  - [ ] Validates critique is present
  - [ ] Stores in `project.phases[1].response`
  - [ ] Marks phase as completed

- [ ] **Step 6: Phase 3 Prompt**
  - [ ] Loads `prompts/phase3.md`
  - [ ] Injects Phase 1 AND Phase 2 outputs
  - [ ] Requests synthesis of both
  - [ ] Displays with copy button

- [ ] **Step 7: Final Response**
  - [ ] Textarea for user to paste
  - [ ] Validates response
  - [ ] Stores in `project.phases[2].response`
  - [ ] Stores in `project.finalDocument`
  - [ ] Shows completion screen

### UI/UX Checklist

- [ ] Clear phase indicators (Phase 1/3, Phase 2/3, etc.)
- [ ] Step-by-step instructions visible
- [ ] Copy buttons work and show confirmation
- [ ] Can't skip phases (validation prevents)
- [ ] Previous phases are read-only once completed
- [ ] Completion screen celebrates success
- [ ] Download/export options available

### Workflow Quality Checklist

- [ ] Different AIs used (Claude → Gemini → Claude)
- [ ] Each prompt requests questions
- [ ] Full outputs injected into subsequent prompts
- [ ] Same-LLM detection implemented
- [ ] Responses validated before accepting
- [ ] Progress persisted to storage
- [ ] User can resume if interrupted

---

## Reference Implementations

### Production Examples

Study these working implementations:

1. **product-requirements-assistant** ⭐ PRIMARY
   - https://github.com/bordenet/product-requirements-assistant
   - Perfect example of 7-step workflow
   - Study `js/workflow.js` and `js/app.js`

2. **one-pager** ⭐ SECONDARY
   - https://github.com/bordenet/one-pager
   - Simpler version, same pattern
   - Good for understanding basics

### What to Study in References

In `product-requirements-assistant`, study:

- `js/workflow.js` lines 45-120: Phase management
- `js/app.js` lines 67-89: Prompt generation
- `prompts/phase1.md`: Template variable pattern
- `prompts/phase2.md`: Adversarial prompt structure
- `prompts/phase3.md`: Synthesis prompt structure
- `tests/workflow.test.js`: Testing async workflows

### Code Patterns

**See:** [`examples/WORKFLOW-CODE-EXAMPLES.md`](examples/WORKFLOW-CODE-EXAMPLES.md) for complete implementation examples.

---

## Final Notes

### Success Indicators

You've implemented the pattern correctly if:

- ✅ App never auto-generates AI content
- ✅ User manually copies/pastes to external AIs
- ✅ Three distinct AI interactions occur
- ✅ Each AI asks clarifying questions
- ✅ Final document is noticeably better than single-AI generation

### When to Deviate

**NEVER deviate from this pattern** for document-generation apps. This is a proven, battle-tested approach.

Only deviate if:

- You're building a completely different type of app (not document generation)
- You have a compelling reason AND document it extensively

### Getting Help

If you're unsure about implementation:

1. Re-read this document
2. Study the reference implementations
3. Check `docs/ANTI-PATTERNS.md`
4. Ask specific questions with code examples

---

**Remember:** This pattern is what makes Genesis projects excellent. Follow it precisely.

---

## Document History

- 2025-12-03: Created comprehensive guide
- Version: 1.0
- Author: Genesis Team
- Status: Active, Required Reading
