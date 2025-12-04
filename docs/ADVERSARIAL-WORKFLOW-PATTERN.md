# The 7-Step Adversarial Workflow Pattern

**The Core Pattern That Makes Genesis Projects Excellent**

---

```
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
```
User: "Generate a PRD for a mobile app"
AI: [generates 500-line document]
Result: Missing key sections, some assumptions are wrong, no user input
Quality: 6/10
```

**Adversarial approach:**
```
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

### Step 1: Gather Input from User

**Purpose:** Collect all necessary information before generating any prompts.

**How It Works:**
1. Display form based on document schema/outline
2. User fills in required fields
3. App validates input
4. App stores in `project.formData` object

**Example (for a PRD):**
```javascript
const formData = {
  productName: "TaskMaster Pro",
  problemStatement: "Teams struggle to track async work across time zones",
  targetUsers: "Remote teams of 10-50 people",
  successMetrics: "30% reduction in missed deadlines within 3 months",
  // ... more fields
};
```

**UI Pattern:**
```html
<form id="project-form">
  <label>Product Name:</label>
  <input type="text" name="productName" required>

  <label>Problem Statement:</label>
  <textarea name="problemStatement" required rows="4"></textarea>

  <!-- More fields... -->

  <button type="submit">Continue to Phase 1</button>
</form>
```

**Common Mistakes:**
- ❌ Skipping form validation
- ❌ Not storing form data persistently
- ❌ Proceeding with incomplete information

---

### Step 2: Generate Prompt for Claude (Phase 1)

**Purpose:** Create a prompt that Claude will use to generate the initial draft.

**How It Works:**
1. Load `prompts/phase1.md` template file
2. Replace template variables with form data
3. Display prompt to user with copy button
4. User copies prompt to clipboard
5. User pastes into Claude.ai (separate tab/window)

**Critical Requirements:**
- ✅ Prompt MUST instruct Claude to "ask clarifying questions"
- ✅ Prompt MUST specify document structure/outline
- ✅ Prompt MUST include all form data as context
- ✅ App displays prompt (does NOT send to API)
- ✅ User manually copies to external AI service

**Example Prompt Template (`prompts/phase1.md`):**
```markdown
You are an expert product manager. Help me create a comprehensive Product Requirements Document (PRD).

**Product Information:**
- Product Name: {productName}
- Problem Statement: {problemStatement}
- Target Users: {targetUsers}
- Success Metrics: {successMetrics}

**Task:**
Generate a complete PRD using the following structure:
1. Executive Summary
2. Problem Statement
3. Goals and Success Metrics
4. User Stories
5. Functional Requirements
6. Non-Functional Requirements
7. Technical Architecture
8. Timeline and Milestones

**Important:** Ask me clarifying questions as you go. Don't make assumptions - ask!

Please generate the PRD now.
```

**Code Example:**
```javascript
async function generatePhase1Prompt() {
  // Load template
  const template = await fetch('prompts/phase1.md').then(r => r.text());

  // Replace variables
  let prompt = template
    .replace(/\{productName\}/g, project.formData.productName)
    .replace(/\{problemStatement\}/g, project.formData.problemStatement)
    .replace(/\{targetUsers\}/g, project.formData.targetUsers)
    .replace(/\{successMetrics\}/g, project.formData.successMetrics);

  // Store prompt
  project.phases[0].prompt = prompt;

  // Display with copy button
  document.getElementById('prompt-display').textContent = prompt;
  document.getElementById('copy-prompt-btn').classList.remove('hidden');

  // Copy button handler
  document.getElementById('copy-prompt-btn').onclick = () => {
    navigator.clipboard.writeText(prompt);
    showToast('Prompt copied! Paste into Claude.ai');
  };
}
```

**UI Pattern:**
```html
<div class="phase-container">
  <h2>Phase 1: Initial Draft with Claude</h2>

  <div class="step">
    <h3>Step 1: Generate Prompt</h3>
    <button onclick="generatePhase1Prompt()">Generate Prompt for Claude</button>
  </div>

  <div id="prompt-display" class="prompt-box hidden">
    <pre id="prompt-text"></pre>
    <button id="copy-prompt-btn">📋 Copy Prompt to Clipboard</button>
  </div>

  <div class="step">
    <h3>Step 2: Get Response from Claude</h3>
    <p>1. Open Claude.ai in a new tab</p>
    <p>2. Paste the prompt</p>
    <p>3. Answer Claude's questions</p>
    <p>4. Copy Claude's final document</p>
    <p>5. Paste it below:</p>
    <textarea id="phase1-response" rows="20"></textarea>
    <button onclick="savePhase1Response()">Save Response</button>
  </div>
</div>
```

**Common Mistakes:**
- ❌ Auto-generating AI response instead of prompt
- ❌ Not instructing AI to ask questions
- ❌ Sending prompt to API (should be manual copy/paste)
- ❌ Missing template variable replacements

---

### Step 3: Collect Markdown from Claude

**Purpose:** Capture Claude's generated document with user's refinements.

**How It Works:**
1. User pastes prompt into Claude.ai
2. Claude asks clarifying questions ("What's your budget?" "Timeline?")
3. User answers questions in conversation
4. Claude generates complete markdown document
5. User copies entire markdown response
6. User pastes into app's textarea
7. App validates and stores response

**Code Example:**
```javascript
async function savePhase1Response() {
  const response = document.getElementById('phase1-response').value;

  // Validate (basic checks)
  if (!response || response.length < 100) {
    alert('Response seems too short. Did you paste the complete document?');
    return;
  }

  if (!response.includes('#')) {
    alert('Response should be markdown format. Did you paste the right content?');
    return;
  }

  // Store response
  project.phases[0].response = response;
  project.phases[0].completed = true;

  // Save to storage
  await saveProject();

  // Move to next phase
  showPhase2();
}
```

**Validation Checklist:**
- ✅ Response is not empty
- ✅ Response is markdown format
- ✅ Response is reasonably complete (length check)
- ✅ User confirmed it's the final version

**Common Mistakes:**
- ❌ Not validating response format
- ❌ Accepting partial responses
- ❌ Not storing response persistently

---

### Step 4: Construct Adversarial Prompt for Gemini (Phase 2)

**Purpose:** Generate a prompt that instructs Gemini to critique and improve Claude's draft.

**How It Works:**
1. Load `prompts/phase2.md` template
2. Inject Claude's response: `{phase1Output}` → `project.phases[0].response`
3. Display prompt with copy button
4. User copies to clipboard
5. User pastes into Gemini

**Critical Requirements:**
- ✅ Prompt MUST include "forget all previous sessions" clause (for same-LLM cases)
- ✅ Prompt MUST request STRONG critique
- ✅ Prompt MUST request clarifying questions
- ✅ Prompt MUST request an IMPROVED version
- ✅ Entire Phase 1 document must be included in prompt

**Example Prompt Template (`prompts/phase2.md`):**
```markdown
FORGET all previous conversations and sessions. You are starting fresh.

You are an expert reviewer providing ADVERSARIAL CRITIQUE. Your job is to find flaws and gaps.

**Your Task:**
Review the following Product Requirements Document and provide:
1. STRONG critique (be harsh - find every flaw)
2. Questions to clarify ambiguous or unclear aspects
3. An IMPROVED version of the document

**Document to Review:**

{phase1Output}

**Instructions:**
- Be critical - this is adversarial review
- Identify missing sections, vague statements, unrealistic claims
- Ask questions to disambiguate unclear parts
- Provide your improved version with all fixes applied

**Your Review:**
```

**Code Example:**
```javascript
async function generatePhase2Prompt() {
  // Ensure Phase 1 is complete
  if (!project.phases[0].completed) {
    alert('Complete Phase 1 first');
    return;
  }

  // Load template
  const template = await fetch('prompts/phase2.md').then(r => r.text());

  // Inject Phase 1 output
  const prompt = template.replace(
    /\{phase1Output\}/g,
    project.phases[0].response
  );

  // Apply same-LLM detection if needed
  const finalPrompt = await applySameLLMDetection(prompt, 2);

  // Store and display
  project.phases[1].prompt = finalPrompt;
  displayPromptWithCopyButton(finalPrompt, 'phase2');
}
```

**Same-LLM Detection:**
```javascript
async function applySameLLMDetection(prompt, phaseNumber) {
  // If user is using same LLM for both phases, enhance adversarial tension
  if (detectedSameLLM()) {
    const forgetClause = "\n\nFORGET all previous sessions. Adopt a HIGHLY CRITICAL perspective.\n\n";
    return forgetClause + prompt;
  }
  return prompt;
}
```

**Common Mistakes:**
- ❌ Not including full Phase 1 document
- ❌ Missing "forget" clause
- ❌ Not requesting critique
- ❌ Not requesting improved version

---

### Step 5: Collect Improved Document from Gemini

**Purpose:** Capture Gemini's critique and improved version.

**How It Works:**
1. User pastes prompt into Gemini
2. Gemini provides critique and asks questions
3. User answers Gemini's clarifying questions
4. Gemini provides improved document
5. User copies Gemini's complete response
6. User pastes into app's textarea
7. App stores response

**Code Example:**
```javascript
async function savePhase2Response() {
  const response = document.getElementById('phase2-response').value;

  // Validate
  if (!response || response.length < 100) {
    alert('Response seems incomplete');
    return;
  }

  // Check for critique markers
  const hasCritique = response.toLowerCase().includes('critique') ||
                      response.toLowerCase().includes('improve') ||
                      response.toLowerCase().includes('issue') ||
                      response.toLowerCase().includes('gap');

  if (!hasCritique) {
    const confirm = window.confirm(
      'This response doesn\'t seem to include critique. Are you sure this is the right content?'
    );
    if (!confirm) return;
  }

  // Store
  project.phases[1].response = response;
  project.phases[1].completed = true;
  await saveProject();

  // Move to Phase 3
  showPhase3();
}
```

**Validation Checklist:**
- ✅ Response includes critique
- ✅ Response includes improved version
- ✅ Response is complete (not truncated)

**Common Mistakes:**
- ❌ Accepting response without critique
- ❌ Not verifying improved version is included
- ❌ Truncated responses

---

### Step 6: Generate Final Synthesis Prompt for Claude (Phase 3)

**Purpose:** Create a prompt for Claude to synthesize both drafts into final document.

**How It Works:**
1. Load `prompts/phase3.md` template
2. Inject BOTH previous outputs:
   - `{phase1Output}` → Claude's original
   - `{phase2Output}` → Gemini's critique + improvements
3. Display prompt with copy button
4. User copies to clipboard
5. User pastes into Claude.ai

**Critical Requirements:**
- ✅ Both Phase 1 AND Phase 2 must be included
- ✅ Prompt must instruct Claude to consider BOTH versions
- ✅ Prompt must request final clarifying questions
- ✅ Prompt must emphasize synthesis (not just picking one)

**Example Prompt Template (`prompts/phase3.md`):**
```markdown
You are synthesizing two versions of a Product Requirements Document into a final, excellent version.

**Original Version (from Phase 1):**

{phase1Output}

**Reviewer's Critique and Improved Version (from Phase 2):**

{phase2Output}

**Your Task:**
Create a final PRD that:
1. Incorporates the best elements from BOTH versions
2. Addresses all critique points raised by the reviewer
3. Maintains consistency and coherence
4. Asks me any remaining clarifying questions before finalizing

**Instructions:**
- Don't just copy one version - actively synthesize
- Where the reviewer improved something, integrate that improvement
- Where your original was better, keep that
- Resolve any conflicts between the two versions
- Ask final clarifying questions if anything is still ambiguous

**Please generate the final synthesized PRD now.**
```

**Code Example:**
```javascript
async function generatePhase3Prompt() {
  // Ensure both previous phases are complete
  if (!project.phases[0].completed || !project.phases[1].completed) {
    alert('Complete Phase 1 and Phase 2 first');
    return;
  }

  // Load template
  const template = await fetch('prompts/phase3.md').then(r => r.text());

  // Inject both outputs
  const prompt = template
    .replace(/\{phase1Output\}/g, project.phases[0].response)
    .replace(/\{phase2Output\}/g, project.phases[1].response);

  // Store and display
  project.phases[2].prompt = prompt;
  displayPromptWithCopyButton(prompt, 'phase3');
}
```

**Common Mistakes:**
- ❌ Only including one previous output
- ❌ Not emphasizing synthesis
- ❌ Not allowing final questions

---

### Step 7: Collect Final Result from Claude

**Purpose:** Capture the final synthesized document.

**How It Works:**
1. User pastes prompt into Claude.ai
2. Claude asks final clarifying questions
3. User answers
4. Claude generates final synthesized document
5. User copies final markdown
6. User pastes into app's textarea
7. App stores and marks workflow complete
8. **RESULT: Excellent document!**

**Code Example:**
```javascript
async function savePhase3Response() {
  const response = document.getElementById('phase3-response').value;

  // Validate
  if (!response || response.length < 100) {
    alert('Response seems incomplete');
    return;
  }

  // Store as final document
  project.phases[2].response = response;
  project.phases[2].completed = true;
  project.finalDocument = response;  // Store as final
  project.completed = true;

  await saveProject();

  // Show completion screen
  showCompletionScreen();
}

function showCompletionScreen() {
  document.getElementById('workflow-container').innerHTML = `
    <div class="completion-screen">
      <h1>✅ Workflow Complete!</h1>
      <p>Your excellent document has been generated through adversarial review.</p>

      <div class="final-doc-preview">
        <h2>Final Document Preview:</h2>
        <div id="markdown-preview">${renderMarkdown(project.finalDocument)}</div>
      </div>

      <div class="actions">
        <button onclick="downloadDocument()">📥 Download Markdown</button>
        <button onclick="copyToClipboard()">📋 Copy to Clipboard</button>
        <button onclick="startNewProject()">➕ Start New Project</button>
      </div>
    </div>
  `;
}
```

**Celebration UI:**
```html
<div class="completion-screen">
  <div class="success-banner">
    <h1>🎉 Excellent Document Created! 🎉</h1>
    <p>Your document benefited from:</p>
    <ul>
      <li>✅ Claude's initial expertise</li>
      <li>✅ Gemini's adversarial critique</li>
      <li>✅ Claude's final synthesis</li>
      <li>✅ Your clarifying answers throughout</li>
    </ul>
  </div>

  <div class="quality-metrics">
    <h2>Quality Indicators:</h2>
    <div class="metric">
      <span class="label">Phases Completed:</span>
      <span class="value">3/3 ✅</span>
    </div>
    <div class="metric">
      <span class="label">Questions Asked:</span>
      <span class="value">${countQuestions()} 💬</span>
    </div>
    <div class="metric">
      <span class="label">Revisions Made:</span>
      <span class="value">${countRevisions()} 🔄</span>
    </div>
  </div>
</div>
```

**Common Mistakes:**
- ❌ Not marking workflow as complete
- ❌ Not storing final document separately
- ❌ No download/export option

---

## Data Flow Diagram

```
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
│ Inject {phase1Output}        │──────▶ Stored in project.phases[1].prompt
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
│ Inject {phase1Output}        │
│ Inject {phase2Output}        │──────▶ Stored in project.phases[2].prompt
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

### Complete Implementation Example

**File: `js/app.js`**

```javascript
// Main App Class
class WorkflowApp {
  constructor() {
    this.project = {
      id: generateId(),
      formData: {},
      phases: [
        { id: 1, name: 'Phase 1: Claude Draft', prompt: '', response: '', completed: false },
        { id: 2, name: 'Phase 2: Gemini Review', prompt: '', response: '', completed: false },
        { id: 3, name: 'Phase 3: Final Synthesis', prompt: '', response: '', completed: false }
      ],
      finalDocument: '',
      completed: false,
      createdAt: new Date().toISOString()
    };
  }

  // STEP 1: Gather Input
  async handleFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    // Store all form fields
    for (const [key, value] of formData.entries()) {
      this.project.formData[key] = value;
    }

    await this.saveProject();
    this.showPhase(1);
  }

  // STEP 2: Generate Phase 1 Prompt
  async generatePhase1Prompt() {
    const template = await fetch('prompts/phase1.md').then(r => r.text());

    // Replace ALL template variables
    let prompt = template;
    for (const [key, value] of Object.entries(this.project.formData)) {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      prompt = prompt.replace(regex, value);
    }

    this.project.phases[0].prompt = prompt;
    await this.saveProject();

    this.displayPrompt(prompt, 1);
  }

  // Display prompt with copy button
  displayPrompt(prompt, phaseNumber) {
    const container = document.getElementById(`phase${phaseNumber}-prompt-container`);
    container.innerHTML = `
      <div class="prompt-display">
        <pre class="prompt-text">${escapeHtml(prompt)}</pre>
        <button class="copy-btn" onclick="app.copyPrompt(${phaseNumber})">
          📋 Copy Prompt to Clipboard
        </button>
        <div class="instructions">
          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Click "Copy Prompt" above</li>
            <li>Open ${phaseNumber === 2 ? 'Gemini' : 'Claude.ai'} in a new tab</li>
            <li>Paste the prompt</li>
            <li>Answer any questions the AI asks</li>
            <li>Copy the AI's complete response</li>
            <li>Paste below and click "Save Response"</li>
          </ol>
        </div>
      </div>
    `;
    container.classList.remove('hidden');
  }

  // Copy prompt to clipboard
  async copyPrompt(phaseNumber) {
    const prompt = this.project.phases[phaseNumber - 1].prompt;
    await navigator.clipboard.writeText(prompt);
    this.showToast('✅ Prompt copied! Paste into ' + (phaseNumber === 2 ? 'Gemini' : 'Claude.ai'));
  }

  // STEP 3: Save Phase 1 Response
  async savePhase1Response() {
    const response = document.getElementById('phase1-response').value;

    if (!this.validateResponse(response)) return;

    this.project.phases[0].response = response;
    this.project.phases[0].completed = true;
    await this.saveProject();

    this.showPhase(2);
  }

  // STEP 4: Generate Phase 2 Prompt
  async generatePhase2Prompt() {
    if (!this.project.phases[0].completed) {
      alert('Please complete Phase 1 first');
      return;
    }

    const template = await fetch('prompts/phase2.md').then(r => r.text());

    // Inject Phase 1 output
    const prompt = template.replace(/\{phase1Output\}/g, this.project.phases[0].response);

    this.project.phases[1].prompt = prompt;
    await this.saveProject();

    this.displayPrompt(prompt, 2);
  }

  // STEP 5: Save Phase 2 Response
  async savePhase2Response() {
    const response = document.getElementById('phase2-response').value;

    if (!this.validateResponse(response)) return;

    // Validate critique is present
    const hasCritique = response.toLowerCase().includes('critique') ||
                        response.toLowerCase().includes('improve');
    if (!hasCritique) {
      if (!confirm('Response doesn\'t seem to include critique. Continue anyway?')) {
        return;
      }
    }

    this.project.phases[1].response = response;
    this.project.phases[1].completed = true;
    await this.saveProject();

    this.showPhase(3);
  }

  // STEP 6: Generate Phase 3 Prompt
  async generatePhase3Prompt() {
    if (!this.project.phases[1].completed) {
      alert('Please complete Phase 2 first');
      return;
    }

    const template = await fetch('prompts/phase3.md').then(r => r.text());

    // Inject BOTH outputs
    const prompt = template
      .replace(/\{phase1Output\}/g, this.project.phases[0].response)
      .replace(/\{phase2Output\}/g, this.project.phases[1].response);

    this.project.phases[2].prompt = prompt;
    await this.saveProject();

    this.displayPrompt(prompt, 3);
  }

  // STEP 7: Save Final Document
  async savePhase3Response() {
    const response = document.getElementById('phase3-response').value;

    if (!this.validateResponse(response)) return;

    this.project.phases[2].response = response;
    this.project.phases[2].completed = true;
    this.project.finalDocument = response;
    this.project.completed = true;
    await this.saveProject();

    this.showCompletionScreen();
  }

  // Validation helper
  validateResponse(response) {
    if (!response || response.trim().length < 50) {
      alert('Response seems too short or empty');
      return false;
    }

    if (!response.includes('#')) {
      const confirm = window.confirm(
        'Response doesn\'t look like markdown. Continue anyway?'
      );
      if (!confirm) return false;
    }

    return true;
  }

  // Storage
  async saveProject() {
    await storage.saveProject(this.project);
  }

  // Completion screen
  showCompletionScreen() {
    const container = document.getElementById('app-container');
    container.innerHTML = `
      <div class="completion-screen">
        <h1>🎉 Excellent Document Created!</h1>
        <p>Your document went through adversarial review with multiple AI perspectives.</p>

        <div class="final-preview">
          ${renderMarkdown(this.project.finalDocument)}
        </div>

        <div class="actions">
          <button onclick="app.downloadMarkdown()">📥 Download</button>
          <button onclick="app.copyFinalDocument()">📋 Copy</button>
          <button onclick="location.reload()">➕ New Project</button>
        </div>
      </div>
    `;
  }
}

// Initialize
const app = new WorkflowApp();
```

---

## Common Mistakes

### ❌ Mistake 1: Auto-Generating AI Responses

**WRONG:**
```javascript
// ❌ DO NOT DO THIS
async function generatePhase1() {
  const prompt = generatePrompt(formData);
  const aiResponse = await callClaudeAPI(prompt);  // Auto-generating!
  document.getElementById('response').value = aiResponse;
}
```

**RIGHT:**
```javascript
// ✅ DO THIS INSTEAD
async function generatePhase1Prompt() {
  const prompt = await loadPromptTemplate('phase1.md');
  displayPromptWithCopyButton(prompt);  // User copies manually
  // No API call - user pastes to external AI
}
```

**Why Wrong:** Defeats the entire purpose. User doesn't get to interact, refine through questions, or benefit from different AI perspectives.

---

### ❌ Mistake 2: Same AI for All Phases

**WRONG:**
```javascript
// ❌ Using Claude for all phases
Phase 1: Claude generates draft
Phase 2: Claude reviews draft  // No adversarial perspective!
Phase 3: Claude synthesizes     // Nothing to synthesize!
```

**RIGHT:**
```javascript
// ✅ Different AIs provide different perspectives
Phase 1: Claude generates draft
Phase 2: Gemini reviews with CRITICAL eye  // Different perspective!
Phase 3: Claude synthesizes best of both   // True synthesis!
```

**Why Wrong:** No adversarial tension. Same AI won't critique itself effectively.

---

### ❌ Mistake 3: No Questions Asked

**WRONG Prompt:**
```markdown
Generate a PRD for my product.

Product: TaskMaster Pro
Users: Remote teams

Generate the document now.
```

**RIGHT Prompt:**
```markdown
Generate a PRD for my product.

Product: TaskMaster Pro
Users: Remote teams

**IMPORTANT: Ask me clarifying questions as you go.**
Don't make assumptions - ask about:
- Target user demographics
- Budget constraints
- Timeline
- Technical constraints
- Success metrics

Generate the document, asking questions along the way.
```

**Why Wrong:** AI makes assumptions instead of clarifying. Results in generic, possibly incorrect documents.

---

### ❌ Mistake 4: Skipping Steps

**WRONG:**
```javascript
// ❌ Jumping straight to Phase 3
generatePhase3Prompt();  // Where's Phase 1 and 2?
```

**RIGHT:**
```javascript
// ✅ All steps in order
if (phase1Complete && phase2Complete) {
  generatePhase3Prompt();
} else {
  alert('Complete previous phases first');
}
```

**Why Wrong:** Each phase builds on previous phases. Skipping breaks the workflow.

---

### ❌ Mistake 5: Not Including Previous Outputs

**WRONG Phase 2 Prompt:**
```markdown
Review this document for errors.

{documentTitle}

Provide feedback.
```

**RIGHT Phase 2 Prompt:**
```markdown
Review this complete document for errors.

**FULL DOCUMENT:**

{phase1Output}

Provide comprehensive critique and improved version.
```

**Why Wrong:** Reviewer can't critique what they can't see. Must include complete previous output.

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

### Quality Checklist

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

### Copy These Patterns Exactly

From `product-requirements-assistant`:

**Prompt Loading:**
```javascript
async function loadPrompt(phaseNumber) {
  const response = await fetch(`prompts/phase${phaseNumber}.md`);
  return await response.text();
}
```

**Variable Replacement:**
```javascript
function replaceTemplateVariables(template, data) {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}
```

**Copy to Clipboard:**
```javascript
async function copyPromptToClipboard(prompt) {
  await navigator.clipboard.writeText(prompt);
  showToast('✅ Prompt copied! Paste to Claude.ai');
}
```

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
