# Adversarial Workflow: Overview & Why It Matters

> Part of [The 7-Step Adversarial Workflow Pattern](../ADVERSARIAL-WORKFLOW-PATTERN.md)

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

```text
User: "Generate a PRD for a mobile app"
AI: [generates 500-line document]
Result: Missing key sections, some assumptions are wrong, no user input
Quality: 6/10
```

**Adversarial approach:**

```text
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

