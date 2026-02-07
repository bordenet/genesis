# LLM Prompt Adversarial Review Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Systematically improve all Genesis tool LLM prompts using adversarial review from Gemini 2.5 Pro and Perplexity Sonar.

**Architecture:** For each of 9 tools, analyze current prompts, generate adversarial review prompts, collect multi-LLM feedback, apply improvements, and document learnings.

**Tech Stack:** Gemini 2.5 Pro (via web), Perplexity Sonar (via MCP), Genesis prompt files (Markdown), validator scoring logic (JavaScript)

---

## Phase 0: Framework Setup

### Task 0.1: Create Prompt Analysis Template

**Files:**
- Create: `genesis-tools/genesis/docs/prompt-analysis-template.md`

**Step 1: Create the template file**

```markdown
# Prompt Analysis: [TOOL_NAME]

## Document Purpose
[1-2 sentences describing what this document type achieves]

## Target Audience
[Who uses this document?]

## Key Success Criteria
[What makes a good document of this type?]

## Engineering_Culture Concepts
- [Concept 1 from relevant blog post]
- [Concept 2 from relevant blog post]

## External References
- [Link 1]
- [Link 2]

## Current Prompt Strengths
- [Strength 1]
- [Strength 2]

## Current Prompt Gaps
- [Gap 1]
- [Gap 2]

## Adversarial Review Results

### Gemini 2.5 Pro Feedback
[Paste feedback here]

### Perplexity Sonar Feedback
[Paste feedback here]

## Improvements Applied
- [ ] Phase 1 prompt: [Change description]
- [ ] Phase 2 prompt: [Change description]
- [ ] Phase 3 prompt: [Change description]
- [ ] Validator prompt: [Change description]

## Learnings for Cross-Tool Synthesis
[Patterns that apply to other tools]
```

**Step 2: Commit**

```bash
git add docs/prompt-analysis-template.md
git commit -m "docs: add prompt analysis template for adversarial review"
```

---

### Task 0.2: Create Adversarial Review Prompt Templates

**Files:**
- Create: `genesis-tools/genesis/docs/adversarial-review-prompts.md`

**Step 1: Create the adversarial prompt templates**

```markdown
# Adversarial Review Prompt Templates

## Prompt A: Assistant Quality Evaluation

You are an expert in LLM prompt engineering and document quality assessment.

CONTEXT:
- Tool: [TOOL_NAME]
- Purpose: [DOCUMENT_PURPOSE]
- Target Audience: [AUDIENCE]

CURRENT PROMPT:
[PASTE PHASE 1/2/3 PROMPT HERE]

EVALUATION CRITERIA:
1. **Anti-Slop Effectiveness**: Does this prompt prevent vague language, buzzwords, and filler?
2. **Specificity Enforcement**: Does it require concrete examples and measurable outcomes?
3. **Scoring Calibration**: Are the quality targets realistic and achievable?
4. **Domain Best Practices**: Does it incorporate industry-standard approaches?
5. **Decision-Driving Focus**: Does it guide toward actionable content vs. documentation theater?

TASK:
Evaluate this prompt against the criteria above. For each criterion:
- Rate 1-10
- Identify specific weaknesses
- Suggest concrete improvements

Be ruthlessly critical. Identify edge cases where this prompt would produce low-quality output.

---

## Prompt B: Validator Blind Spot Analysis

You are an expert in document validation and quality scoring systems.

CONTEXT:
- Tool: [TOOL_NAME]
- Purpose: [DOCUMENT_PURPOSE]
- Scoring Dimensions: [LIST_DIMENSIONS]

CURRENT VALIDATOR LOGIC:
[PASTE VALIDATOR SCORING CODE OR DESCRIPTION]

EVALUATION CRITERIA:
1. **Dimension Coverage**: Do the scoring dimensions cover all critical quality aspects?
2. **Edge Case Handling**: Are there scenarios where the validator gives misleading scores?
3. **Specificity Rewards**: Does it reward concrete details and penalize vagueness?
4. **Threshold Calibration**: Are scoring thresholds aligned with real-world quality?
5. **Assistant Alignment**: Does the validator score what the assistant prompts for?

TASK:
Identify blind spots in this validator. For each dimension:
- What edge cases would fool it?
- What quality issues would it miss?
- What improvements would make it more robust?

Provide specific examples of documents that would score incorrectly.

---

## Prompt C: Engineering Culture Integration

You are an expert in engineering culture and professional writing best practices.

CONTEXT:
- Tool: [TOOL_NAME]
- Purpose: [DOCUMENT_PURPOSE]
- Relevant Concepts: [LIST_ENGINEERING_CULTURE_CONCEPTS]

CURRENT PROMPT:
[PASTE PROMPT HERE]

ENGINEERING CULTURE PRINCIPLES:
[PASTE RELEVANT SECTIONS FROM ENGINEERING_CULTURE BLOGS]

TASK:
Evaluate how well this prompt incorporates engineering culture best practices:
1. Does it enforce clarity over comprehensiveness?
2. Does it separate outcomes (WHAT) from implementation (HOW)?
3. Does it create decision-driving content vs. documentation theater?
4. Does it follow professional writing standards (conciseness, specificity)?
5. Does it align with industry best practices for this document type?

Suggest specific improvements to better incorporate these principles.
```

**Step 2: Commit**

```bash
git add docs/adversarial-review-prompts.md
git commit -m "docs: add adversarial review prompt templates"
```

---

## Phase 1: Tool-by-Tool Analysis

### Task 1.1: Analyze one-pager Prompts

**Files:**
- Read: `genesis-tools/one-pager/shared/prompts/phase1.md`
- Read: `genesis-tools/one-pager/shared/prompts/phase2.md`
- Read: `genesis-tools/one-pager/shared/prompts/phase3.md`
- Read: `genesis-tools/one-pager/validator/js/prompts.js`
- Read: `Engineering_Culture/SDLC/The_One-Pager.md`
- Create: `genesis-tools/genesis/docs/prompt-analyses/one-pager-analysis.md`

**Step 1: Fill out prompt analysis template**

Document purpose: Frame problems to drive decisions with targeted outcomes
Target audience: Internal stakeholders (team, leadership)
Key concepts from Engineering_Culture:
- "The constraint of a single page forces you to identify what actually matters"
- "Gaps in your logic become obvious"
- "If you can't explain the core idea on a single page, the idea itself may not be focused enough"

**Step 2: Generate adversarial review prompts**

Use Prompt A, B, C templates with one-pager context.

**Step 3: Submit to Gemini 2.5 Pro**

Open https://gemini.google.com and submit all 3 prompts.
Collect feedback in analysis document.

**Step 4: Submit to Perplexity Sonar**

Use perplexity-research skill to submit prompts.
Collect feedback in analysis document.

**Step 5: Synthesize improvements**

Identify common themes from both LLMs.
Prioritize improvements by impact.

**Step 6: Apply improvements to prompts**

Modify: `genesis-tools/one-pager/shared/prompts/phase1.md`
Modify: `genesis-tools/one-pager/shared/prompts/phase2.md`
Modify: `genesis-tools/one-pager/shared/prompts/phase3.md`
Modify: `genesis-tools/one-pager/validator/js/prompts.js` (if applicable)

**Step 7: Run tests**

```bash
cd genesis-tools/one-pager && npm test
```

Expected: All tests pass.

**Step 8: Commit**

```bash
git add shared/prompts/ validator/js/prompts.js
git commit -m "feat(prompts): improve one-pager prompts based on adversarial review

- [List specific improvements]
- Reviewed by Gemini 2.5 Pro and Perplexity Sonar"
```

---

### Task 1.2: Analyze pr-faq-assistant Prompts

**Files:**
- Read: `genesis-tools/pr-faq-assistant/shared/prompts/phase1.md`
- Read: `genesis-tools/pr-faq-assistant/shared/prompts/phase2.md`
- Read: `genesis-tools/pr-faq-assistant/shared/prompts/phase3.md`
- Read: `genesis-tools/pr-faq-assistant/validator/js/prompts.js`
- Read: `Engineering_Culture/SDLC/The_PR-FAQ.md`
- Create: `genesis-tools/genesis/docs/prompt-analyses/pr-faq-analysis.md`

**Step 1-8: Follow same process as Task 1.1**

Key concepts from Engineering_Culture:
- 5 Ws journalism (WHO, WHAT, WHEN, WHERE, WHY)
- Customer quotes with quantitative metrics
- Working backwards from customer value

---

### Task 1.3-1.9: Remaining Tools

Repeat Task 1.1 process for:
- Task 1.3: product-requirements-assistant
- Task 1.4: architecture-decision-record
- Task 1.5: strategic-proposal
- Task 1.6: power-statement-assistant
- Task 1.7: acceptance-criteria-assistant
- Task 1.8: business-justification-assistant
- Task 1.9: jd-assistant

---

## Cross-Tool Patterns (Apply to ALL Tools)

These patterns were identified during adversarial review and MUST be applied to every tool.

### Pattern 1: Copy-Paste Ready Output (MANDATORY)

**Problem:** LLMs add preambles ("Here's..."), sign-offs ("Let me know if..."), and code fences that break the copy-paste workflow.

**Standard Output Block (add to ALL Phase 1 and Phase 3 prompts):**

```markdown
## Output Format

**CRITICAL: Copy-Paste Ready Output Only**

Your response MUST be:
1. **Clean markdown only** — No code fences wrapping the document
2. **No preamble** — Do NOT start with "Here's...", "Sure...", "I've created..."
3. **No commentary** — Do NOT explain what you did or why
4. **No sign-off** — Do NOT end with "Let me know if...", "Would you like me to...", "Feel free to..."
5. **Start immediately** — Begin with the document title/headline

The user will copy your ENTIRE response and paste it directly into the tool. Any extra text breaks this workflow.
```

### Pattern 2: Analyze-First Gate

**Problem:** LLMs draft immediately without validating inputs, producing documents with logical gaps.

**Solution:** Add a "Critical Gap Detection" checklist that must be completed before drafting.

### Pattern 3: Logical Bridge Check

**Problem:** Solutions that are the inverse of the problem ("We don't have X" → "Build X") without addressing root cause.

**Solution:** Validator caps score at 50 if solution is just the inverse of the problem.

### Pattern 4: Investment + ROI Required

**Problem:** Proposals without "The Ask" (what resources are needed) can't drive decisions.

**Solution:** Add Investment section and ROI sanity check to all proposal-type tools.

### Pattern 5: Baseline → Target Format

**Problem:** Metrics like "improve by 20%" are meaningless without baseline.

**Solution:** All metrics must include [Current] → [Target] by [Date].

### Pattern 6: Validator Alignment

**Problem:** Phase 2 review criteria don't match validator scoring dimensions.

**Solution:** Ensure Phase 2 criteria exactly match validator rubric.

---

## Phase 2: Cross-Tool Synthesis

### Task 2.1: Document Common Patterns

**Files:**
- Create: `genesis-tools/genesis/docs/prompt-improvement-patterns.md`

**Step 1: Review all 9 analysis documents**

Identify patterns that appeared in multiple tools.

**Step 2: Create reusable checklist**

```markdown
# Prompt Improvement Checklist

## Anti-Slop Patterns
- [ ] Banned vague language list is comprehensive
- [ ] Examples of good vs. bad output included
- [ ] Scoring calibration targets mentioned

## Specificity Enforcement
- [ ] Quantification required for all claims
- [ ] Concrete examples required
- [ ] Measurable outcomes defined

## Decision-Driving Focus
- [ ] Cost of Doing Nothing is required (not optional)
- [ ] Clear scope boundaries (in AND out)
- [ ] Success metrics are SMART

## Engineering Culture Alignment
- [ ] Clarity over comprehensiveness
- [ ] What vs. How separation
- [ ] Professional writing standards
```

**Step 3: Commit**

```bash
git add docs/prompt-improvement-patterns.md
git commit -m "docs: add cross-tool prompt improvement patterns"
```

---

### Task 2.2: Update hello-world Template

**Files:**
- Modify: `genesis-tools/genesis/genesis/examples/hello-world/shared/prompts/phase1.md`
- Modify: `genesis-tools/genesis/genesis/examples/hello-world/shared/prompts/phase2.md`
- Modify: `genesis-tools/genesis/genesis/examples/hello-world/shared/prompts/phase3.md`

**Step 1: Apply learnings to template prompts**

Incorporate patterns from cross-tool synthesis.

**Step 2: Run tests**

```bash
cd genesis-tools/genesis/genesis/examples/hello-world && npm test
```

**Step 3: Commit**

```bash
git add genesis/examples/hello-world/shared/prompts/
git commit -m "feat(template): update hello-world prompts with adversarial review learnings"
```

---

### Task 2.3: Update CONTINUOUS_IMPROVEMENT.md

**Files:**
- Modify: `genesis-tools/genesis/CONTINUOUS_IMPROVEMENT.md`

**Step 1: Add adversarial review section**

Document the process, key learnings, and recommendations for future tools.

**Step 2: Commit**

```bash
git add CONTINUOUS_IMPROVEMENT.md
git commit -m "docs: add adversarial review learnings to CONTINUOUS_IMPROVEMENT.md"
```

---

## Execution Notes

**Time Estimate:**
- Phase 0: 1 hour
- Phase 1: 2 hours per tool × 9 tools = 18 hours
- Phase 2: 2 hours
- **Total: ~21 hours** (spread across multiple sessions)

**Recommended Approach:**
1. Complete Phase 0 in this session
2. Pilot with one-pager and pr-faq-assistant (Tier 1)
3. Evaluate ROI before continuing with remaining 7 tools

**Tool Priority Order:**
1. one-pager (most widely used)
2. pr-faq-assistant (complex scoring)
3. product-requirements-assistant (oldest, most mature)
4. architecture-decision-record
5. strategic-proposal
6. acceptance-criteria-assistant
7. power-statement-assistant
8. business-justification-assistant
9. jd-assistant

