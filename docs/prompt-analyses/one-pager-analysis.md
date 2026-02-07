# Prompt Analysis: one-pager

**Date:** 2026-02-07
**Reviewer:** Matt Bordenet / Augment Agent
**Status:** In Review

---

## 1. Document Purpose

A One-Pager is a forcing function for clear thinking that summarizes a project proposal to a single page. It clarifies the author's own thinking and gets a group moving together by providing something concrete to react to, debate, and improve.

## 2. Target Audience

- **Primary:** Project leads, product managers, engineers proposing new work
- **Secondary:** Executives, stakeholders who need to make go/no-go decisions

## 3. Key Success Criteria

1. **Fits on one page** (500-700 words) - brevity forces prioritization
2. **Problem-first** - compelling "why" before "what" or "how"
3. **Quantified outcomes** - specific metrics, not vague claims
4. **Clear scope boundaries** - explicit in-scope AND out-of-scope
5. **Decision-ready** - enables go/no-go without additional context

## 4. Engineering_Culture Concepts

| Concept | Source | How to Apply |
|---------|--------|--------------|
| "The constraint of a single page forces you to identify what actually matters" | The_One-Pager.md | Enforce word count, penalize verbosity |
| "Gaps in your logic become obvious" | The_One-Pager.md | Require all sections, flag missing connections |
| "If you can't explain the core idea on a single page, the idea itself may not be focused enough" | The_One-Pager.md | Treat length violations as signal of unclear thinking |
| "Confusing Features with Benefits" (Mistake #4) | The_One-Pager.md | Require "So what?" test for every benefit |
| "Vague Goals" (Mistake #3) | The_One-Pager.md | Require specific, measurable, time-bound goals |

## 5. External References

- [Made to Stick by Chip Heath](https://heathbrothers.com/books/made-to-stick/) - Why ideas stick
- [The Pyramid Principle by Barbara Minto](https://www.barbaraminto.com/) - Structured thinking
- [Good Strategy Bad Strategy by Richard Rumelt](https://www.goodreads.com/book/show/11721966-good-strategy-bad-strategy) - Real strategy vs. wishful thinking

## 6. Current Prompt Analysis

### Phase 1 (Initial Draft)

**Strengths:**
- Comprehensive anti-slop rules with banned terms table
- Clear document structure template
- Interactive refinement guidance
- Emphasis on "Cost of Doing Nothing"

**Gaps:**
- No examples of good vs. bad one-pagers
- "Cost of Doing Nothing" marked OPTIONAL in template but REQUIRED in guidelines (contradiction)
- No explicit word count enforcement mechanism
- Missing "So what?" test for benefits (from Engineering_Culture)
- No guidance on distinguishing features from benefits

### Phase 2 (Adversarial Review)

**Strengths:**
- AI Slop Detection Checklist
- Scoring criteria (Clarity, Conciseness, Impact, Feasibility, Completeness, AI Slop)
- Clear process steps

**Gaps:**
- Scoring criteria don't match validator rubric (different dimensions)
- No calibration guidance (what score is "good enough"?)
- Missing "Cost of Doing Nothing" in review criteria

### Phase 3 (Synthesis)

**Strengths:**
- Zero Tolerance Patterns table
- Required Patterns section
- Clear synthesis guidelines

**Gaps:**
- "Cost of Doing Nothing" marked OPTIONAL again (should be REQUIRED)
- No guidance on resolving conflicting scores between Phase 1 and Phase 2

### Validator Scoring

**Strengths:**
- Harsh calibration guidance ("Most one-pagers score 40-60")
- Clear rubric with point allocations
- Explicit deductions for vague qualifiers

**Gaps:**
- "Cost of Inaction" only worth 10 points (should be higher given its importance)
- No penalty for exceeding one page
- No AI slop dimension in scoring (despite being emphasized in prompts)

---

## 7. Adversarial Review Results

### Gemini 2.5 Pro Feedback

**Date:** 2026-02-07

#### Prompt A: Assistant Quality Evaluation

| Criterion | Score | Key Issue |
|-----------|-------|-----------|
| Anti-Slop | 9/10 | Needs rule against "AI enthusiasm" (superlative adjectives) |
| Specificity | 7/10 | Risk of "hallucinated quantification" if user doesn't provide data |
| Calibration | 6/10 | **500-700 words is too long** - true one-pager is 300-500 words |
| Best Practices | 7/10 | Missing Risks/Assumptions and Resource Requirements |
| Decision-Driving | 8/10 | Strong CODN, but lacks clear "The Ask" (investment required) |

**Priority Improvements:**
1. **Re-order logic to "Analyze-First" gate** - Analyze → Identify gaps → Question → Draft (only when gaps closed)
2. **Tighten word count to 400 words** - Add active voice rule
3. **Add "Decision Trio"**: The Investment, Key Assumptions, Top Risk & Mitigation

**Edge Cases That Would Produce Bad Output:**
1. "Creative Writing" Hallucination - AI fills in vague solutions with invented details
2. "Circular Problem" Loop - "We don't have X" → "Build X" (no root cause analysis)
3. "Metric Without Baseline" - "Increase by 20%" without knowing current state

**Key Insights:**
1. Word count calibration is wrong - 500-700 is a 3-pager, not a 1-pager
2. Missing "The Ask" (investment required) prevents actual decision-making
3. Need explicit instruction: "Never assume technical implementation details"
4. All metrics must include [Baseline] → [Target] format

#### Prompt B: Validator Blind Spot Analysis

**Core Issue:** Validator is a "Compliance Checker" masquerading as a "Quality Scorer" - rewards structure over logic.

| Issue | Severity | Example |
|-------|----------|---------|
| Logical Circularity | **High** | Problem: "We lack X." Solution: "Build X." |
| ROI / Feasibility Blindness | **High** | $1M solution for $10k problem, no "The Ask" |
| Risk / Assumption Omission | Med | 100% confidence, zero mention of dependencies |
| "Brief Genius" Penalty | Low | Perfect 200-word proposal penalized for lacking phased timeline |

**Documents That Would Score Incorrectly:**

1. **HIGH score, LOW quality ("Metrics Hallucinator"):** Buzzword soup with hallucinated metrics - "Increase synergy by 42.5% by Q4" - scores 85+ because it checks every formatting box

2. **LOW score, HIGH quality ("Silver Bullet"):** Senior engineer's one-line fix saving $2M loses 20+ points for missing Out-of-Scope, phased timeline, being "too brief"

**Recommended Fixes:**
1. **"Logical Bridge" Penalty** - If solution is inverse of problem, cap score at 50
2. **Replace Completeness with "Investment Logic"** - The Ask (10pts) + ROI Evidence (10pts)
3. **Add "Risks & Assumptions" dimension (15pts)** - No risk assessment = pitch deck, not proposal
4. **Signal-to-Noise Ratio** - Deduct if Out-of-Scope longer than Problem+Solution combined

**Key Insights:**
1. Quantification Bias - rewards presence of numbers regardless of validity
2. Missing root cause analysis check
3. Out-of-Scope (9pts) > In-Scope (8pts) invites "Scope Padding"
4. "High-Level" only 5pts - allows implementation slop to score 95%

#### Prompt C: Engineering Culture Integration

**Core Issue:** Prompt is a "drafting tool" but fails as a "thinking tool" - allows users to "hide behind length."

| Criterion | Score | Quote of Misaligned Text |
|-----------|-------|--------------------------|
| Clarity | 6/10 | "Maximum 1 page (500-700 words)" |
| What vs How | 5/10 | "## Timeline ... ## Key Stakeholders" |
| Decision-Driving | 4/10 | [Missing "Alternatives Considered" or "Risks"] |
| Writing Standards | 9/10 | "Banned Vague Language [Table]" |
| Industry Practices | 6/10 | "Work with the user iteratively until you have a complete... document." |

**Key Misalignments:**

1. **"Length" Paradox** - 700 words allows hiding behind volume. Standard professional one-pagers are 300-450 words.

2. **Failure as "Thinking Tool"** - Missing "Alternatives Considered" section. Without comparing to "Doing nothing" or "Solution B," document is sales pitch, not proposal.

3. **Feature-Centricity ("So What?" Gap)** - Prompt doesn't instruct AI to interrogate user input. If user provides feature list, AI polishes it rather than extracting business outcome.

**Suggested Rewording:**

1. **Tighten constraint:** "Maximum 450 words. Every sentence must earn its place. Density is a proxy for clarity."

2. **Add Alternatives & Risks:**
   ```
   ### Proposed Solution & Alternatives
   {High-level solution}
   **Why this over alternatives?** {Why 'Solution B' or 'Status quo' was rejected}

   ### Risks & Assumptions
   {What must be true? What could kill this project?}
   ```

3. **Enforce "So What?" Test:** "Do not list 'We will build a dashboard'; list 'We will provide real-time visibility to reduce support escalation time by 15%'. Outcomes > Outputs."

4. **Add Go/No-Go Logic Check:** "If 'Cost of Doing Nothing' is negligible compared to 'Timeline/Effort', you MUST point this out. Your goal is to help the user decide if this project should even exist."

**Key Insights:**
1. One-pager should be crucible where decision is forged, not summary of decision already made
2. Missing "Alternatives Considered" = sales pitch, not engineering proposal
3. 700 words is too long - allows justifying bad ideas through volume
4. Need explicit instruction to challenge whether project should exist

### Perplexity Sonar Feedback

**Date:** PENDING (Optional - proceeding with synthesis)

```
[Skip for now - Gemini feedback is comprehensive]
```

---

## 8. Improvements Applied

### Phase 1 Changes
- [x] Added "thinking tool" framing (not just summary tool)
- [x] Added new input fields: The Investment, Risks & Assumptions
- [x] Implemented Analyze-First approach with Critical Gap Detection checklist
- [x] Restructured document template with new sections:
  - Proposed Solution & Alternatives (why this over alternatives?)
  - The Investment (effort + cost)
  - Risks & Assumptions (key assumption + top risk with mitigation)
- [x] Reduced word count from 500-700 to 450 words max
- [x] Added "So What?" test for benefits (outcomes, not features)
- [x] Added baseline → target format requirement for all metrics
- [x] Added Go/No-Go Logic Check instruction
- [x] Added active voice requirement
- [x] Added ROI sanity check instruction
- [x] Added superlative adjectives to banned list

### Phase 2 Changes
- [x] Aligned review criteria with new validator dimensions (5 dimensions)
- [x] Added Logical Bridge check (solution must address root cause)
- [x] Added Investment Logic dimension (The Ask + ROI Evidence)
- [x] Added Risk Awareness dimension
- [x] Added calibration guidance (70+ = decision-ready, <50 = not ready)
- [x] Updated output template with all new sections
- [x] Made Cost of Doing Nothing REQUIRED (not optional)

### Phase 3 Changes
- [x] Reduced word count target to 450 words
- [x] Added "Validate Logic" and "ROI Sanity Check" guidelines
- [x] Made Cost of Doing Nothing REQUIRED (never omit)
- [x] Updated output template with all new sections

### Validator Changes
- [x] Replaced old rubric with new 5-dimension scoring:
  - Problem Clarity (30 pts) - now requires ROOT CAUSE, not just symptoms
  - Solution Quality (25 pts) - added Logical Bridge check, Alternatives Considered
  - Investment Logic (20 pts) - NEW: The Ask + ROI Evidence
  - Risks & Assumptions (15 pts) - NEW: Key assumptions + top risks
  - Scope & Metrics (10 pts) - reduced, brief scope requirement
- [x] Added LOGICAL BRIDGE CHECK that caps score at 50 if solution is inverse of problem
- [x] Fixed Out-of-Scope weighting (was 9pts > In-Scope 8pts, now both in 5pt combined)
- [x] Updated word count guidance to 450 words max
- [x] Added superlative adjectives to banned list
- [x] Updated critique and rewrite prompts to match new rubric

---

## 9. Verification

- [x] All tests pass: `npm test` (492 tests)
- [ ] Manual test: Generate sample document and score it
- [ ] Score improved from [X] to [Y] on representative input

---

## 10. Learnings for Cross-Tool Synthesis

Patterns that may apply to other tools:

1. **Analyze-First Gate**: Don't draft until gaps are identified and addressed. Apply to all tools.
2. **Logical Bridge Check**: Solution must address root cause, not just be inverse of problem. Apply to proposal-type tools.
3. **Investment + ROI**: Every proposal needs "The Ask" and ROI sanity check. Apply to strategic-proposal, business-justification.
4. **Word Count Calibration**: 450 words is better than 500-700 for decision documents. Review all tools.
5. **Risks & Assumptions Required**: Add to all proposal-type tools.
6. **Baseline → Target Format**: All metrics must include current state, target, and timeline. Apply to all tools.
7. **"So What?" Test**: For every feature, ask "So what?" to uncover benefit. Apply to all tools.
8. **Validator Alignment**: Review criteria in Phase 2 should match validator scoring dimensions.

