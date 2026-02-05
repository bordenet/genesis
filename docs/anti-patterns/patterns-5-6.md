# Anti-Patterns: Missing Context & Single-Shot Generation

> Part of [Anti-Patterns Guide](../ANTI-PATTERNS.md)

---

## Anti-Pattern #5: Missing Context

### ❌ WRONG: Phase 2 Without Phase 1 Output

```markdown
<!-- ❌ BAD PHASE 2 PROMPT -->

Review the following Product Requirements Document.

Provide critique and improvements.
```

**Problems:**
- No document to review!
- Reviewer has no context
- Can't provide meaningful feedback

### ✅ RIGHT: Phase 2 With Full Phase 1 Output

```markdown
<!-- ✅ GOOD PHASE 2 PROMPT -->

FORGET all previous sessions. You are starting fresh as an adversarial reviewer.

Review the following complete Product Requirements Document.

**DOCUMENT TO REVIEW:**

{phase1_output}

**YOUR TASK:**
1. Identify gaps, vague statements, unrealistic claims
2. Ask clarifying questions about ambiguous sections
3. Provide an IMPROVED version with all issues fixed

Be critical - this is adversarial review.

**Your Review:**
```

**Benefits:**
- Reviewer sees complete document
- Can provide specific, actionable feedback
- Has full context for critique

---

## Anti-Pattern #6: Single-Shot Generation

### ❌ WRONG: Generate Entire Document at Once

```javascript
// ❌ BAD CODE
async function generateDocument() {
  const prompt = `Generate a complete 50-page technical specification for ${productName}`;

  // Single API call, no iteration
  const response = await callAI(prompt);

  // Done! (but probably mediocre)
  return response;
}
```

**Problems:**
- No user input during generation
- No clarification of assumptions
- AI makes guesses instead of asking
- Results are generic

### ✅ RIGHT: Iterative Refinement Through Phases

```javascript
// ✅ GOOD CODE
async function runAdversarialWorkflow() {
  // Phase 1: Draft with questions
  const draft = await generateWithQuestions('claude', phase1Prompt);
  // User answered questions: budget = $50k, timeline = Q2, etc.

  // Phase 2: Critique with more questions
  const critique = await generateWithQuestions('gemini', phase2Prompt);
  // User clarified: priority is mobile-first, MVP scope is 5 features

  // Phase 3: Synthesis with final questions
  const final = await generateWithQuestions('claude', phase3Prompt);
  // User confirmed: yes, include API versioning section

  // Result: Highly refined, user-validated document
  return final;
}
```

**Benefits:**
- User involved throughout
- Ambiguities clarified iteratively
- Final document matches user's intent

