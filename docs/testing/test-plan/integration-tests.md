# Test Plan: Integration Tests

> Part of [Genesis Test Plan](../TEST_PLAN.md)

---

## IT-001: JavaScript + IndexedDB Storage (P0, Integration)
**Objective:** Test complete storage workflow across modules

**Test Cases:**
1. Create project, save data, retrieve data
   - Use storage.js functions
   - Expected: Data persists across page reloads

2. Export data to JSON
   - Expected: Valid JSON, all data included

3. Import data from JSON
   - Expected: Data restored correctly

4. Handle storage quota exceeded
   - Expected: Clear error, fallback behavior

**Status:** ⬜ Not Started

---

## IT-002: Workflow Phase Transitions (P0, E2E)
**Objective:** Test multi-phase workflow from start to finish

**Test Cases:**
1. Complete Phase 1 → Phase 2 → Phase 3 workflow
   - Input: Form data for Phase 1
   - Expected: Prompts generated, responses saved

2. Skip Phase 1, go directly to Phase 2
   - Expected: Phase 1 data auto-generated (forgiving UX)

3. Go backwards (Phase 3 → Phase 2)
   - Expected: Data preserved, no loss

4. Parallel workflow (multiple projects)
   - Expected: Projects don't interfere with each other

**Status:** ⬜ Not Started

---

## IT-003: Same-LLM Adversarial Detection (P1, Integration)
**Objective:** Test same-LLM detection and mitigation

**Test Cases:**
1. Detect when Phase 1 and Phase 2 use same LLM
   - Input: Both phases use "Claude Sonnet 4.5"
   - Expected: Detection triggers, mitigation applied

2. Apply Gemini personality simulation
   - Expected: Prompt modified with forget clause

3. Skip mitigation when different LLMs used
   - Input: Phase 1 = Claude, Phase 2 = Gemini
   - Expected: No mitigation, original prompt used

4. Handle edge cases (empty LLM names, undefined)
   - Expected: Graceful handling, no crashes

**Status:** ⬜ Not Started

---

## IT-004: Template + Prompt Loading (P1, Integration)
**Objective:** Test loading and combining templates with prompts

**Test Cases:**
1. Load prompt from markdown file
   - File: `prompts/phase1.md`
   - Expected: Prompt text loaded correctly

2. Replace template variables in prompt
   - Variables: `{title}`, `{context}`, etc.
   - Expected: All variables replaced

3. Combine template + form data
   - Expected: Complete prompt ready for AI

4. Handle missing prompt files
   - Expected: Clear error, fallback behavior

**Status:** ⬜ Not Started

