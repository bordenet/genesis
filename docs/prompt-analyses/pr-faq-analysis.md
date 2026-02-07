# PR-FAQ Assistant - Prompt Analysis

**Date:** 2026-02-07
**Reviewed by:** Gemini 2.5 Pro (adversarial review)
**Commit:** c66b7f2

## Summary

Major prompt improvements addressing "Vanity Validation" issue and aligning with Amazon's "Working Backwards" methodology.

## Key Findings from Adversarial Review

### 1. "Vanity Validation" (CRITICAL)
- **Issue:** Validator rubric allocated 100% of points to Press Release, 0% to FAQs
- **Impact:** A perfect PR with no FAQs could score 100/100
- **Fix:** Rebalanced rubric - FAQ Quality now 35% of total score

### 2. Quote Inflation
- **Issue:** Prompt required 3-4 quotes (blog post territory)
- **Impact:** Diluted message, created "document theater"
- **Fix:** Reduced to exactly 2 quotes: 1 Executive Vision + 1 Customer Relief

### 3. "Happy Path" Internal FAQ
- **Issue:** No requirement for hard questions in Internal FAQ
- **Impact:** Softball questions allowed; real risks/costs never addressed
- **Fix:** Added MANDATORY hard questions: Risk, Reversibility, Opportunity Cost

### 4. "Success Bias"
- **Issue:** Goal was "score 75+" which encouraged hallucinating a perfect world
- **Impact:** AI optimized for "looking right" rather than "being right"
- **Fix:** Changed goal to "clarify product strategy" - logic test, not writing task

### 5. Missing Mechanism
- **Issue:** Headlines rewarded metrics without explaining HOW
- **Impact:** "Magic box" thinking - claims without substantiation
- **Fix:** Headlines must now include mechanism (HOW, not just WHAT)

## Changes Applied

### Phase 1 Prompt
- Added "Working Backwards" mindset section
- Reduced quotes from 3-4 to exactly 2
- Added new input fields: THE_ALTERNATIVE, PRICE_AND_AVAILABILITY, EXECUTIVE_VISION, INTERNAL_RISKS
- Added mandatory Internal FAQ questions
- Added copy-paste ready output block

### Phase 2 Prompt
- Aligned scoring with new validator dimensions
- Added FAQ Quality section (25 points)
- Added FAQ PENALTY: cap at 50 if Internal FAQ is softball

### Phase 3 Prompt
- Added copy-paste ready output block
- Updated rubric to match new dimensions
- Added FAQ Quality section

### Validator Prompts (CRITICAL)
- New rubric: Structure (20), Content (20), Tone (15), Evidence (10), FAQ Quality (35)
- Added Mechanism Clarity check
- Added Competitive Differentiation check
- Added Internal FAQ Rigor requirement (15 pts for mandatory questions)
- Added FAQ PENALTY: cap at 50 if FAQs missing or softball

## New Scoring Dimensions

| Dimension | Old Weight | New Weight | Notes |
|-----------|-----------|------------|-------|
| Structure & Hook | 30 pts | 20 pts | Added Price & Availability |
| Content Quality | 35 pts | 20 pts | Added Mechanism Clarity, Competitive Differentiation |
| Professional Quality | 20 pts | 15 pts | Unchanged focus |
| Customer Evidence | 15 pts | 10 pts | 2 quotes instead of 3-4 |
| **FAQ Quality** | **0 pts** | **35 pts** | **NEW - The "Working Backwards" test** |

## Test Results

All 472 tests pass after updating test expectations:
- Changed "3-4 quotes" → "TWO quotes"
- Changed "FINAL PR-FAQ document only" → "Copy-Paste Ready Output"

## Cross-Tool Patterns Applied

1. ✅ Copy-Paste Ready Output (MANDATORY)
2. ✅ Quote Sourcing (2 quotes per Amazon standard)
3. ✅ Mechanism Clarity (HOW, not just WHAT)
4. ✅ Hard Question Requirements (Risk, Reversibility, Opportunity Cost)

