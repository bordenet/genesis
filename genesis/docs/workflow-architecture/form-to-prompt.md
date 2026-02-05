# Workflow Architecture: Form-to-Prompt Pattern

> Part of [Workflow Architecture Guide](../WORKFLOW-ARCHITECTURE.md)

---

## Why Phase 1 Uses a Form

Phase 1 collects **structured data** that maps to the document template sections. This ensures:
- Consistent document structure
- Required fields are captured
- Validation before AI interaction
- Clear user guidance

---

## Implementation Pattern

### 1. Define form fields in workflow.js

```javascript
formData: {
  projectName: '',
  problemStatement: '',
  proposedSolution: '',
  keyGoals: '',
  // ... more fields matching template
}
```

### 2. Create form in app.js

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

### 3. Validate and generate prompt

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

### 4. Use form data in prompt template

In `prompts/phase1.md`:
```markdown
Generate a one-pager document with the following information:

**Project Name**: {projectName}
**Problem Statement**: {problemStatement}
**Proposed Solution**: {proposedSolution}

Please create a crisp, professional one-pager...
```

---

## Template Variable Replacement

### Standard Variables

**Phase 1** (from form data):
- `{projectName}` - Project name from form
- `{problemStatement}` - Problem from form
- `{proposedSolution}` - Solution from form
- Any other form fields

**Phase 2** (from previous phase):
- `{phase1_output}` - Complete response from Phase 1

**Phase 3** (from all previous phases):
- `{phase1_output}` - Complete response from Phase 1
- `{phase2_output}` - Complete response from Phase 2

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

