# Adversarial Workflow - Complete Code Examples

**This file contains complete implementation examples. For the pattern overview, see `ADVERSARIAL-WORKFLOW-PATTERN.md`.**

---

## Complete Implementation Example

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
    for (const [key, value] of formData.entries()) {
      this.project.formData[key] = value;
    }
    await this.saveProject();
    this.showPhase(1);
  }

  // STEP 2: Generate Phase 1 Prompt
  async generatePhase1Prompt() {
    const template = await fetch('prompts/phase1.md').then(r => r.text());
    let prompt = template;
    for (const [key, value] of Object.entries(this.project.formData)) {
      prompt = prompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
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
      </div>
    `;
    container.classList.remove('hidden');
  }

  // STEP 4: Generate Phase 2 Prompt (with Phase 1 output)
  async generatePhase2Prompt() {
    if (!this.project.phases[0].completed) {
      alert('Please complete Phase 1 first');
      return;
    }
    const template = await fetch('prompts/phase2.md').then(r => r.text());
    const prompt = template.replace(/\{phase1_output\}/g, this.project.phases[0].response);
    this.project.phases[1].prompt = prompt;
    await this.saveProject();
    this.displayPrompt(prompt, 2);
  }

  // STEP 6: Generate Phase 3 Prompt (with BOTH outputs)
  async generatePhase3Prompt() {
    if (!this.project.phases[1].completed) {
      alert('Please complete Phase 2 first');
      return;
    }
    const template = await fetch('prompts/phase3.md').then(r => r.text());
    const prompt = template
      .replace(/\{phase1_output\}/g, this.project.phases[0].response)
      .replace(/\{phase2_output\}/g, this.project.phases[1].response);
    this.project.phases[2].prompt = prompt;
    await this.saveProject();
    this.displayPrompt(prompt, 3);
  }
}
```

---

## Template Variable Replacement Function

```javascript
function replaceTemplateVars(template, vars) {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, value || '');
  }
  return result;
}
```

---

## Response Validation

```javascript
function validateResponse(response) {
  if (!response || response.trim().length < 50) {
    alert('Response seems too short or empty');
    return false;
  }
  if (!response.includes('#')) {
    if (!confirm('Response doesn\'t look like markdown. Continue anyway?')) {
      return false;
    }
  }
  return true;
}
```

---

## Event Handler Wiring (Stillborn App Prevention)

```javascript
// ALWAYS wire handlers immediately after rendering
function renderPhaseUI(project, phase) {
  container.innerHTML = `
    <button id="copy-prompt-btn">Copy Prompt</button>
    <button class="view-prompt-btn">View Full Prompt</button>
  `;

  // ✅ Wire up immediately - don't forget this!
  document.getElementById('copy-prompt-btn').addEventListener('click', () => {
    copyToClipboard(project.phases[phase].prompt);
  });

  document.querySelector('.view-prompt-btn').addEventListener('click', () => {
    showPromptModal(project.phases[phase].prompt);
  });
}
```

---

## Prompt Template Examples

**`prompts/phase1.md`:**

```markdown
You are an expert. Help me create a {document_type}.

**Project:** {project_name}
**Description:** {project_description}

Generate a comprehensive document. **Ask clarifying questions as you go.**
```

**`prompts/phase2.md`:**

```markdown
Review this document critically. Provide:
1. Strong critique of weaknesses
2. Questions to clarify ambiguities
3. An improved version

**Document to Review:**
{phase1_output}
```

**`prompts/phase3.md`:**

```markdown
Synthesize the original draft and the reviewer's improvements.

**Original (Claude):**
{phase1_output}

**Reviewer's Critique (Gemini):**
{phase2_output}

Create the final document combining the best of both.
```
