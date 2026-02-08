# Product Requirements Assistant - Prompt Analysis

**Date:** 2026-02-07
**Reviewed by:** Gemini 3 (adversarial review)
**Commit:** 692d486

## Summary

Comprehensive prompt improvements addressing PRD "Document Theater" - impressive-looking documents that don't actually help engineers build the right thing. Added new Strategic Viability dimension (20 pts) to validator.

## Key Findings from Adversarial Review

### Prompt A: PRD Rigor Analysis

#### 1. "What" vs "How" Boundary: WEAK ENFORCEMENT
- **Issue:** PRDs drift into implementation suggestions ("Use DynamoDB")
- **Impact:** Premature technical decisions, reduced solution space
- **Fix:** Added Technical Constraints Exception - only pre-existing constraints allowed

#### 2. Acceptance Criteria: HIGH RISK OF "HAPPY PATH" BIAS
- **Issue:** ACs like "User can successfully log in" are useless
- **Impact:** Edge cases and error states never tested
- **Fix:** Require failure mode section - at least 1 happy path AC + 2 edge case/error ACs

#### 3. Problem-Feature Gap: MODERATE THEATER
- **Issue:** Problem and feature can be completely uncorrelated
- **Impact:** "Users are lonely" → "Add dark mode" passes validation
- **Fix:** Force "Why-How" mapping: "This feature addresses [Pain Point X] by [Specific Mechanism]"

#### 4. Metric Theater: CRITICAL FAILURE
- **Issue:** Vanity metrics like "User Engagement" without specificity
- **Impact:** No way to know if feature succeeded or failed
- **Fix:** Require Counter-Metrics + Leading Indicators + Source of Truth

#### 5. Requirements Traceability: ABSENT
- **Issue:** No way to know which requirements become obsolete if a problem is removed
- **Impact:** Orphaned requirements, scope creep
- **Fix:** Generate Traceability Summary table: Problem ID → Requirement ID → Metric ID

### Prompt B: Validator Alignment

#### 6. Alignment is SUPERFICIAL
- **Issue:** Weights match but detection methods differ
- **Impact:** JS scores format, LLM scores intent → causes score variance
- **Fix:** Added new Strategic Viability dimension with aligned detection patterns

#### 7. Blind Spots Identified
- **Frankenstein PRD:** Sections from different products stitched together
- **Precision without Accuracy:** Specific numbers that are wrong
- **Averaged Persona:** "Users want..." instead of specific persona needs
- **Performance Theater:** "Fast" without P99 latency targets

### Prompt C: Engineering Culture Integration

#### 8. "Show Your Work": MISSING
- **Issue:** Prompt asks for "What" but not "Why"
- **Impact:** No visibility into rejected alternatives
- **Fix:** Added "Alternatives Considered" section with rejection reasons

#### 9. "Measure What Matters": LAGGING INDICATORS ONLY
- **Issue:** Focus on lagging indicators (Revenue) instead of leading indicators
- **Impact:** By the time you measure, it's too late to pivot
- **Fix:** Mandate Leading Indicators with Instrumentation Requirements

#### 10. "Fail Fast": SUCCESS BIASED
- **Issue:** Prompt builds case for why product will work, not what would prove it wrong
- **Impact:** Confirmation bias, no pivot criteria
- **Fix:** Added "Hypothesis Kill Switch" - what data would prove this is a failure?

#### 11. "One-Way vs Two-Way Doors": ABSENT
- **Issue:** No distinction between reversible and irreversible decisions
- **Impact:** Over-analysis of reversible decisions, under-analysis of irreversible ones
- **Fix:** Tag requirements as One-Way Door 🚪 (high cost of change) or Two-Way Door 🔄 (easy to pivot)

#### 12. "Working Backwards": FEATURE-FIRST
- **Issue:** Starts from features, not customer outcomes
- **Impact:** Solutions looking for problems
- **Fix:** Added Customer FAQ section BEFORE Proposed Solution

#### 13. "Disagree and Commit": FALSE CONSENSUS
- **Issue:** Presents unified view, hides debates
- **Impact:** Dissenting opinions lost, risks not surfaced
- **Fix:** Added "Known Unknowns & Dissenting Opinions" section

## Changes Applied

### Phase 1 Prompt
- Added Working Backwards Mindset section at top
- Added Technical Constraints Exception
- Enhanced Success Metrics with Leading/Lagging, Source of Truth, Counter-Metrics
- Added Hypothesis Kill Switch section 4.4
- Added Customer FAQ section 5 (Working Backwards)
- Added Alternatives Considered section 6.2
- Updated Requirements with One-Way/Two-Way Door tagging
- Added success AND failure acceptance criteria
- Added Traceability Summary section 12
- Added Known Unknowns & Dissenting Opinions section 14
- Added Copy-Paste Ready Output format

### Phase 2 Prompt
- Updated to reference Gemini 3
- Added Strategic Viability dimension (1-10)
- Added Engineering Culture Alignment dimension (1-10)

### Phase 3 Prompt
- Updated to reference Gemini 3
- Updated Quality Gate with new 5-dimension rubric
- Added Copy-Paste Ready Output format
- Listed all 14 required sections

### Validator (prompts.js + validator.js)

**New 5-dimension scoring rubric (100 pts total):**

| Dimension | Before | After | Change |
|-----------|--------|-------|--------|
| Document Structure | 25 pts | 20 pts | -5 |
| Requirements Clarity | 30 pts | 25 pts | -5 |
| User Focus | 25 pts | 20 pts | -5 |
| Technical Quality | 20 pts | 15 pts | -5 |
| **Strategic Viability** | 0 pts | **20 pts** | **NEW** |

**Strategic Viability (20 pts) breakdown:**
- Metric Validity (6 pts): Leading indicators, counter-metrics, source of truth
- Scope Realism (5 pts): Kill switch, door type, alternatives considered
- Risk & Mitigation Quality (5 pts): Specific risks, dissenting opinions
- Traceability (4 pts): Problem → Requirement → Metric mapping

**Added STRATEGIC_VIABILITY_PATTERNS for detection:**
- Leading/lagging indicators
- Counter-metrics and guardrails
- Source of truth references
- Kill switch/pivot criteria
- One-way/Two-way door tagging
- Alternatives considered
- Dissenting opinions
- Customer FAQ and Aha quotes
- Traceability matrix

## Test Results

All 639 tests pass ✅

