# Workflow Architecture: Phase Types

> Part of [Workflow Architecture Guide](../WORKFLOW-ARCHITECTURE.md)

---

## 1. Mock Mode Phases (type: 'mock')

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

---

## 2. Manual Mode Phases (type: 'manual')

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

