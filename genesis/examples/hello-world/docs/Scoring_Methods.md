# [Project Name] Scoring Methods

> **⚠️ TEMPLATE NOTICE**: This is a template file. When creating a new genesis-derived project, you MUST customize this document to reflect your specific scoring methodology.

This document describes the scoring methodology used by the [Project Name] Validator.

## Overview

The validator scores [document type] on a **100-point scale** across [N] dimensions. [Brief description of what makes this document type unique and what the scoring emphasizes.]

## Scoring Taxonomy

| Dimension | Points | What It Measures |
|-----------|--------|------------------|
| **Dimension 1** | XX | [Description] |
| **Dimension 2** | XX | [Description] |
| **Dimension 3** | XX | [Description] |
| **Dimension 4** | XX | [Description] |

> **Note**: Point totals should sum to 100. Adjust weights based on what matters most for your document type.

## Dimension Details

### 1. Dimension 1 (XX pts)

**Scoring Breakdown:**
- Sub-criterion A: X pts
- Sub-criterion B: X pts
- Sub-criterion C: X pts

**Detection Patterns:**
```javascript
// Example pattern - customize for your domain
patternName: /your\s+regex\s+pattern\s+here/gi
```

### 2. Dimension 2 (XX pts)

**Scoring Breakdown:**
- Sub-criterion A: X pts
- Sub-criterion B: X pts

### 3. Dimension 3 (XX pts)

**Scoring Breakdown:**
- Sub-criterion A: X pts
- Sub-criterion B: X pts

### 4. Dimension 4 (XX pts)

**Scoring Breakdown:**
- Sub-criterion A: X pts
- Sub-criterion B: X pts

## Adversarial Robustness

Document common "gaming" attempts and why your scoring methodology catches them:

| Gaming Attempt | Why It Fails |
|----------------|--------------|
| [Attempt 1] | [Explanation] |
| [Attempt 2] | [Explanation] |
| [Attempt 3] | [Explanation] |

## Calibration Notes

### [Calibration Topic 1]
[Explanation of why certain scoring decisions were made]

### [Calibration Topic 2]
[Explanation of trade-offs in the scoring model]

## Score Interpretation

| Score Range | Grade | Interpretation |
|-------------|-------|----------------|
| 80-100 | A | [What this means for your document type] |
| 60-79 | B | [Improvement guidance] |
| 40-59 | C | [Major gaps] |
| 20-39 | D | [Significant issues] |
| 0-19 | F | [Restart guidance] |

## Related Files

- `validator/js/validator.js` - Implementation of scoring functions
- `validator/js/prompts.js` - LLM scoring prompt (should be aligned)
- `shared/prompts/phase1.md` - User-facing instructions (source of truth)

---

## Creating Your Scoring_Methods.md

When creating a new genesis-derived project, follow these steps:

### Step 1: Identify Your Scoring Dimensions

What are the 3-5 most important aspects of your document type? Common patterns:

| Document Type | Common Dimensions |
|---------------|-------------------|
| Technical Docs | Clarity, Completeness, Structure, Accuracy |
| Sales Materials | Impact, Specificity, Action Language, Evidence |
| Executive Docs | Problem Clarity, Solution Quality, Business Impact |
| Requirements | Testability, Clarity, Prioritization, Traceability |

### Step 2: Assign Weights

Weights should reflect:
- **What's hardest to fake** (higher weight)
- **What's most important for the document's purpose** (higher weight)
- **What's easily gamed** (lower weight, or use penalties instead)

### Step 3: Document Detection Patterns

For each sub-criterion, document:
1. The regex or heuristic used for detection
2. Why this pattern was chosen
3. Known edge cases or false positives

### Step 4: Add Adversarial Robustness

Think like an adversary. How would someone try to game each criterion? Document why your patterns catch these attempts.

### Step 5: Align with phase1.md

Your Scoring_Methods.md must align with:
- `shared/prompts/phase1.md` - What users are told to do
- `validator/js/prompts.js` - What the LLM is told to score
- `validator/js/validator.js` - What the JavaScript actually scores

If these diverge, users experience "silent failures" where following instructions doesn't yield expected scores.

---

## Maintenance

This document should be updated whenever:
- `validator.js` scoring logic changes
- `prompts.js` LLM prompt changes
- `phase1.md` user instructions change
- Adversarial review discovers new gaps

Keep this document as the **human-readable source of truth** for scoring methodology.

