# Workflow Architecture: Defensive Coding Patterns

> Part of [Workflow Architecture Guide](../WORKFLOW-ARCHITECTURE.md)

---

## 1. Input Validation

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

---

## 2. Error Handling

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

---

## 3. Data Sanitization

```javascript
// Sanitize user input before storing
function sanitizeInput(input) {
  return input.trim().replace(/[<>]/g, '');
}
```

---

## 4. Graceful Degradation

```javascript
// Handle missing phase responses
const phase1Output = project.phases[0]?.response || '[Phase 1 not completed]';
```

---

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

