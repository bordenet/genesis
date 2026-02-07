# Adversarial Review Prompt Templates

Use these prompts to submit Genesis tool prompts to external LLMs (Gemini 2.5 Pro, Perplexity Sonar) for critical evaluation.

---

## Prompt A: Assistant Quality Evaluation

```
You are an expert in LLM prompt engineering and document quality assessment.

CONTEXT:
- Tool: [TOOL_NAME]
- Purpose: [DOCUMENT_PURPOSE]
- Target Audience: [AUDIENCE]

CURRENT PROMPT:
---
[PASTE PHASE 1/2/3 PROMPT HERE]
---

EVALUATION CRITERIA:

1. **Anti-Slop Effectiveness** (Does this prompt prevent vague language, buzzwords, and filler?)
2. **Specificity Enforcement** (Does it require concrete examples and measurable outcomes?)
3. **Scoring Calibration** (Are quality targets realistic and achievable?)
4. **Domain Best Practices** (Does it incorporate industry-standard approaches?)
5. **Decision-Driving Focus** (Does it guide toward actionable content vs. documentation theater?)

TASK:
For each criterion:
- Rate 1-10
- Identify specific weaknesses
- Suggest concrete improvements with examples

Be ruthlessly critical. Identify edge cases where this prompt would produce low-quality output.

OUTPUT FORMAT:
## Evaluation Summary
| Criterion | Score | Key Issue |
|-----------|-------|-----------|
| Anti-Slop | X/10 | ... |
| Specificity | X/10 | ... |
| Calibration | X/10 | ... |
| Best Practices | X/10 | ... |
| Decision-Driving | X/10 | ... |

## Detailed Analysis
[Per-criterion analysis]

## Priority Improvements
1. [Most impactful change]
2. [Second most impactful]
3. [Third most impactful]

## Edge Cases That Would Produce Bad Output
1. [Edge case 1]
2. [Edge case 2]
```

---

## Prompt B: Validator Blind Spot Analysis

```
You are an expert in document validation and quality scoring systems.

CONTEXT:
- Tool: [TOOL_NAME]
- Purpose: [DOCUMENT_PURPOSE]
- Scoring Dimensions: [LIST_DIMENSIONS]

CURRENT VALIDATOR LOGIC:
---
[PASTE VALIDATOR SCORING CODE OR RUBRIC]
---

EVALUATION CRITERIA:

1. **Dimension Coverage** (Do scoring dimensions cover all critical quality aspects?)
2. **Edge Case Handling** (Are there scenarios where the validator gives misleading scores?)
3. **Specificity Rewards** (Does it reward concrete details and penalize vagueness?)
4. **Threshold Calibration** (Are scoring thresholds aligned with real-world quality?)
5. **Assistant Alignment** (Does the validator score what the assistant prompts for?)

TASK:
Identify blind spots in this validator:
- What edge cases would fool it into giving high scores to bad documents?
- What quality issues would it miss entirely?
- Where do the scoring weights seem miscalibrated?

Provide specific examples of documents that would score incorrectly.

OUTPUT FORMAT:
## Blind Spot Summary
| Issue | Severity | Example |
|-------|----------|---------|
| ... | High/Med/Low | ... |

## Detailed Analysis
[Per-dimension analysis]

## Documents That Would Score Incorrectly
### Example 1: Would score HIGH but is LOW quality
[Description of document that games the rubric]

### Example 2: Would score LOW but is HIGH quality
[Description of good document that gets penalized]

## Recommended Fixes
1. [Fix for highest-severity issue]
2. [Fix for second issue]
```

---

## Prompt C: Engineering Culture Integration

```
You are an expert in engineering culture and professional writing best practices.

CONTEXT:
- Tool: [TOOL_NAME]
- Purpose: [DOCUMENT_PURPOSE]

ENGINEERING CULTURE PRINCIPLES (from reference blog post):
---
[PASTE RELEVANT SECTIONS FROM ENGINEERING_CULTURE BLOG]
---

CURRENT PROMPT:
---
[PASTE PROMPT HERE]
---

EVALUATION CRITERIA:

1. **Clarity over Comprehensiveness** (Does it enforce brevity and focus?)
2. **What vs. How Separation** (Does it keep outcomes separate from implementation?)
3. **Decision-Driving Content** (Does it create content that drives decisions, not documentation theater?)
4. **Professional Writing Standards** (Conciseness, specificity, no hedging?)
5. **Industry Best Practices** (Does it align with how professionals actually use this document type?)

TASK:
Evaluate how well this prompt incorporates engineering culture best practices.

For each criterion:
- Rate alignment 1-10
- Quote specific prompt text that's misaligned
- Suggest concrete rewording

OUTPUT FORMAT:
## Alignment Summary
| Criterion | Score | Quote of Misaligned Text |
|-----------|-------|--------------------------|
| Clarity | X/10 | "..." |
| What vs How | X/10 | "..." |
| Decision-Driving | X/10 | "..." |
| Writing Standards | X/10 | "..." |
| Industry Practices | X/10 | "..." |

## Key Misalignments
1. [Most significant gap between prompt and culture principles]
2. [Second gap]

## Suggested Rewording
### Before:
[Quote original text]

### After:
[Improved text that better embodies the principle]
```

---

## Usage Instructions

### For Gemini 2.5 Pro

1. Open https://gemini.google.com
2. Select Gemini 2.5 Pro model
3. Paste one prompt at a time with the tool's actual content filled in
4. Save responses in the tool's prompt-analysis document

### For Perplexity Sonar

1. Use the `perplexity-research` skill
2. Submit prompts with focus on industry best practices
3. Perplexity is particularly good at finding external references

### Recommended Order

1. Submit Prompt A (Assistant Quality) to both LLMs
2. Submit Prompt B (Validator Blind Spots) to both LLMs
3. Submit Prompt C (Engineering Culture) to Gemini only (requires blog context)
4. Synthesize findings in the analysis document

