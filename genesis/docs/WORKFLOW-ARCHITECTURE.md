# Workflow Architecture Guide

## Overview

Genesis projects use a **multi-phase AI workflow** pattern where different AI models (or the same model with different perspectives) collaborate to produce high-quality documents.

## Phase Types

### 1. Mock Mode Phases (type: 'mock')
**Purpose**: AI interaction happens WITHIN the application during development

**How it works**:
1. User clicks "Generate Prompt"
2. App displays the prompt with a "Copy Prompt" button
3. **DEVELOPMENT MODE**: App shows "[MOCK MODE] Use Mock Response" button
4. **PRODUCTION MODE**: User manually copies prompt to Claude/GPT in another tab
5. User pastes AI response back into the app
6. App validates and stores the response

**When to use**:
- Phase 1 (Initial Draft) - Usually mock mode
- Phase 3 (Final Synthesis) - Usually mock mode
- Any phase where you want to simulate AI interaction during development

**Example** (from product-requirements-assistant):
```javascript
{
  id: 1,
  name: 'Initial Draft',
  description: 'Generate initial PRD using Claude',
  type: 'mock',  // ← This enables mock mode
  completed: false,
  prompt: '',
  response: ''
}
```

### 2. Manual Mode Phases (type: 'manual')
**Purpose**: User MUST interact with external AI (e.g., Gemini) manually

**How it works**:
1. User clicks "Generate Prompt"
2. App displays the prompt with a "Copy Prompt" button
3. User copies prompt to external AI (e.g., Gemini in browser)
4. User copies AI response back into the app
5. App validates and stores the response

**When to use**:
- Phase 2 (Review/Critique) - Usually manual mode with Gemini
- Any phase where you want a different AI model's perspective
- When you don't have API access to the AI model

**Example** (from product-requirements-assistant):
```javascript
{
  id: 2,
  name: 'Gemini Review',
  description: 'Review and critique using Gemini',
  type: 'manual',  // ← No mock mode available
  completed: false,
  prompt: '',
  response: ''
}
```

## Data Flow Pattern

### Phase 1: Form → Prompt → Response
```
User fills form
  ↓
Form data stored in project.formData
  ↓
generatePrompt() loads prompts/phase1.md
  ↓
Template variables replaced with form data
  ↓
Prompt displayed to user
  ↓
User gets AI response (mock or manual)
  ↓
Response stored in project.phases[0].response
```

### Phase 2: Previous Response → Prompt → Response
```
Phase 1 response retrieved
  ↓
generatePrompt() loads prompts/phase2.md
  ↓
{phase1Output} replaced with Phase 1 response
  ↓
Prompt displayed to user
  ↓
User copies to Gemini manually
  ↓
User pastes Gemini response
  ↓
Response stored in project.phases[1].response
```

### Phase 3: All Previous Responses → Prompt → Final Document
```
Phase 1 & 2 responses retrieved
  ↓
generatePrompt() loads prompts/phase3.md
  ↓
{phase1Output} and {phase2Output} replaced
  ↓
Prompt displayed to user
  ↓
User gets AI response (mock or manual)
  ↓
Response stored in project.phases[2].response
  ↓
User downloads final markdown document
```

## Form-to-Prompt Pattern (Phase 1)

### Why Phase 1 Uses a Form

Phase 1 collects **structured data** that maps to the document template sections. This ensures:
- Consistent document structure
- Required fields are captured
- Validation before AI interaction
- Clear user guidance

### Implementation Pattern

1. **Define form fields in workflow.js**:
```javascript
formData: {
  projectName: '',
  problemStatement: '',
  proposedSolution: '',
  keyGoals: '',
  // ... more fields matching template
}
```

2. **Create form in app.js**:
```javascript
function renderPhase1Form(project) {
  return `
    <form id="phase1-form">
      <label>Project Name</label>
      <input name="projectName" value="${project.formData.projectName}" required>

      <label>Problem Statement</label>
      <textarea name="problemStatement" required>${project.formData.problemStatement}</textarea>

      <!-- More fields -->
    </form>
  `;
}
```

3. **Validate and generate prompt**:
```javascript
window.generatePhase1Prompt = async (projectId) => {
  const project = await getProject(projectId);

  // Collect form data
  const form = document.getElementById('phase1-form');
  const formData = new FormData(form);

  // Validate required fields
  if (!formData.get('projectName')) {
    alert('Project name is required');
    return;
  }

  // Update project with form data
  await updateFormData(projectId, Object.fromEntries(formData));

  // Generate prompt with form data
  const prompt = await generatePrompt(project, 1);
  // ... display prompt
};
```

4. **Use form data in prompt template** (`prompts/phase1.md`):
```markdown
Generate a one-pager document with the following information:

**Project Name**: {projectName}
**Problem Statement**: {problemStatement}
**Proposed Solution**: {proposedSolution}

Please create a crisp, professional one-pager...
```

## Template Variable Replacement

### Standard Variables

**Phase 1** (from form data):
- `{projectName}` - Project name from form
- `{problemStatement}` - Problem from form
- `{proposedSolution}` - Solution from form
- Any other form fields

**Phase 2** (from previous phase):
- `{phase1Output}` - Complete response from Phase 1

**Phase 3** (from all previous phases):
- `{phase1Output}` - Complete response from Phase 1
- `{phase2Output}` - Complete response from Phase 2

### Implementation

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

## Defensive Coding Patterns

### 1. Input Validation
```javascript
// Validate required fields
const requiredFields = ['projectName', 'problemStatement', 'proposedSolution'];
for (const field of requiredFields) {
  if (!project.formData[field]) {
    alert(`${field} is required`);
    return;
  }
}
```

### 2. Error Handling
```javascript
// Handle missing prompt files
async function loadPromptTemplate(phase) {
  try {
    const response = await fetch(`prompts/phase${phase}.md`);
    if (!response.ok) {
      throw new Error(`Failed to load prompt template for phase ${phase}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading prompt:', error);
    alert('Failed to load prompt template. Please check your connection.');
    return null;
  }
}
```

### 3. Data Sanitization
```javascript
// Sanitize user input before storing
function sanitizeInput(input) {
  return input.trim().replace(/[<>]/g, '');
}
```

### 4. Graceful Degradation
```javascript
// Handle missing phase responses
const phase1Output = project.phases[0]?.response || '[Phase 1 not completed]';
```

## Testing Async Prompt Loading

```javascript
// Mock fetch for testing
global.fetch = async (url) => {
  const templates = {
    'prompts/phase1.md': 'Phase 1 template with {projectName}',
    'prompts/phase2.md': 'Phase 2 template with {phase1Output}',
    'prompts/phase3.md': 'Phase 3 template with {phase1Output} and {phase2Output}'
  };

  return {
    ok: true,
    text: async () => templates[url] || 'Default template'
  };
};

// Test async prompt generation
test('should generate prompt for phase 1', async () => {
  const project = createProject('Test', 'Description');
  await updateFormData(project.id, {
    projectName: 'My Project',
    problemStatement: 'The problem'
  });

  const prompt = await generatePrompt(project, 1);
  expect(prompt).toContain('My Project');
  expect(prompt).toContain('The problem');
});
```

