# Workflow Architecture: Data Flow Pattern

> Part of [Workflow Architecture Guide](../WORKFLOW-ARCHITECTURE.md)

---

## Phase 1: Form → Prompt → Response

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

---

## Phase 2: Previous Response → Prompt → Response

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

---

## Phase 3: All Previous Responses → Prompt → Final Document

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

