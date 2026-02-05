# Anti-Patterns: No Questions & Skipping Steps

> Part of [Anti-Patterns Guide](../ANTI-PATTERNS.md)

---

## Anti-Pattern #3: No Questions

### ❌ WRONG: Prompt Doesn't Request Questions

```markdown
<!-- ❌ BAD PROMPT TEMPLATE -->

Generate a Product Requirements Document.

Product Name: {productName}
Problem: {problemStatement}

Please generate the PRD now.
```

**Problems:**
- AI makes assumptions
- User doesn't get to clarify
- Results are generic
- Misses project-specific nuances

### ✅ RIGHT: Prompt Explicitly Requests Questions

```markdown
<!-- ✅ GOOD PROMPT TEMPLATE -->

Generate a Product Requirements Document.

Product Name: {productName}
Problem: {problemStatement}

**IMPORTANT:** Ask me clarifying questions as you go. Don't make assumptions.

Questions you should ask:
- Who are the target users? (demographics, tech savvy, use cases)
- What's the budget constraint?
- What's the timeline?
- What are the technical constraints?
- How will we measure success?
- What's out of scope?

Please start generating the PRD, asking questions along the way.
```

**Benefits:**
- AI asks about ambiguities
- User clarifies project-specific details
- Results are tailored to actual requirements
- Iterative refinement produces better output

---

## Anti-Pattern #4: Skipping Steps

### ❌ WRONG: Jumping to Later Phases

```javascript
// ❌ BAD CODE
function startWorkflow() {
  // User fills form
  collectFormData();

  // ❌ Skipping directly to Phase 3!
  generatePhase3Prompt();  // Where's Phase 1 and 2?
}
```

**Problems:**
- Phase 3 needs Phase 1 and 2 outputs
- No adversarial review happened
- Missing critical workflow steps

### ✅ RIGHT: Enforcing Sequential Flow

```javascript
// ✅ GOOD CODE
function canStartPhase(phaseNumber) {
  // Phase 1 can always start
  if (phaseNumber === 1) return true;

  // Phase 2 requires Phase 1 complete
  if (phaseNumber === 2) {
    return project.phases[0].completed;
  }

  // Phase 3 requires Phase 1 AND 2 complete
  if (phaseNumber === 3) {
    return project.phases[0].completed && project.phases[1].completed;
  }

  return false;
}

function startPhase(phaseNumber) {
  if (!canStartPhase(phaseNumber)) {
    alert(`Complete previous phases first. Current: Phase ${getCurrentPhase()}`);
    return;
  }

  // Safe to proceed
  showPhase(phaseNumber);
}
```

**Benefits:**
- Enforces correct workflow
- Prevents skipping critical steps
- Clear error messages guide users

