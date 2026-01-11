# Prompt Tuning Guide

Guide for optimizing the AI prompts that drive {{PROJECT_TITLE}}.

---

## The Three-Phase Workflow

### Phase 1: Initial Generation (Claude)

**File**: `prompts/phase1.md`
**Purpose**: Generate a complete initial draft from user inputs

**Key Requirements**:
- Output must be specific, not generic
- Must address all user-provided context
- Must follow the document format completely

### Phase 2: Adversarial Review (Gemini)

**File**: `prompts/phase2.md`
**Purpose**: Critically review and identify weaknesses

**Key Requirements**:
- Must identify real gaps and weaknesses
- Must provide specific, actionable feedback
- Must not simply validate weak work

### Phase 3: Synthesis (Claude)

**File**: `prompts/phase3.md`
**Purpose**: Combine draft and feedback into final document

**Key Requirements**:
- Choose the clearer/better option each time
- Don't average or water down content
- Maintain balance (pros AND cons)

---

## Common Issues & Fixes

### Issue: Output Too Generic

**Symptoms**: Vague language like "improve", "better", "optimize"

**Fix**: Add specific examples to the prompt:
```
BEFORE: "Describe the benefits"
AFTER: "List 3 specific benefits with measurable outcomes"
```

### Issue: Missing Critical Sections

**Symptoms**: Output skips required sections

**Fix**: Add explicit section requirements:
```
AFTER: "Your response MUST include these sections: [list]"
```

### Issue: Phase 2 Not Critical Enough

**Symptoms**: Review just agrees with Phase 1

**Fix**: Strengthen adversarial instructions:
```
AFTER: "You MUST identify at least 3 weaknesses or gaps"
```

---

## Prompt Structure Best Practices

### 1. Clear Role Definition
```markdown
You are a [specific role] helping to [specific task].
```

### 2. Explicit Output Format
```markdown
Format your response as:
## Section 1
[content]
## Section 2
[content]
```

### 3. Quality Criteria
```markdown
Your response must:
- Be specific (no vague language)
- Be complete (all sections)
- Be actionable (concrete next steps)
```

### 4. Anti-Patterns to Avoid
```markdown
Do NOT:
- Use generic phrases like "best practices"
- Skip required sections
- Provide surface-level analysis
```

---

## Testing Prompts

### Manual Testing

1. Copy prompt to AI (Claude/Gemini)
2. Provide sample inputs
3. Evaluate output quality
4. Iterate on prompt

### Evaluation Criteria

- **Completeness**: All sections present?
- **Specificity**: Concrete details, not vague?
- **Actionability**: Clear next steps?
- **Balance**: Pros AND cons addressed?

---

## Customizing for Your Use Case

### Adding Domain Context

Edit the prompt to include domain-specific:
- Terminology
- Examples
- Constraints
- Evaluation criteria

### Adjusting Output Length

Control verbosity:
```markdown
Keep each section to 2-3 paragraphs maximum.
```

Or:
```markdown
Provide comprehensive detail, minimum 500 words per section.
```

---

## Related Files

- `prompts/phase1.md` - Phase 1 prompt
- `prompts/phase2.md` - Phase 2 prompt
- `prompts/phase3.md` - Phase 3 prompt
- `js/workflow.js` - Prompt integration

