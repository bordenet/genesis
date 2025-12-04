# Plan: Make Adversarial Workflow Pattern Crystal Clear in Genesis

## Problem Statement

Recent Genesis-derived tool builds have NOT followed the correct adversarial workflow pattern. Instead of implementing the proper 7-step pattern with external AI services, apps were built with:
- Auto-generation of AI responses (wrong!)
- No prompt copy/paste workflow (wrong!)
- Same AI doing all phases (wrong!)
- No adversarial tension (wrong!)

## Root Cause Analysis

### Why This Happened

1. **Documentation is scattered** across multiple files without a single authoritative source
2. **The 7-step pattern is not explicitly documented** as a numbered checklist
3. **START-HERE.md and 00-AI-MUST-READ-FIRST.md don't emphasize** the adversarial workflow strongly enough
4. **No explicit ANTI-PATTERNS document** showing wrong vs right
5. **WORKFLOW-ARCHITECTURE.md talks about "mock mode"** which can be misinterpreted as "the app should generate AI responses"
6. **No quality gate in CLAUDE.md** specifically checking for adversarial workflow implementation

### What Went Wrong in Recent Build

The developer/AI built an app that:
- ❌ Did NOT gather input relative to document schema (skipped step 1)
- ❌ Did NOT generate a prompt asking Claude to "help me generate a doc... ask questions along the way" (skipped step 2)
- ❌ Did NOT provide a way to collect markdown from Claude (skipped step 3)
- ❌ Did NOT construct adversarial Gemini prompt with critique + questions (skipped step 4)
- ❌ Did NOT collect Gemini's improved document (skipped step 5)
- ❌ Did NOT generate final Claude synthesis prompt considering both drafts (skipped step 6)
- ❌ Did NOT collect final result from Claude (skipped step 7)

## The Correct 7-Step Adversarial Workflow Pattern

### Step 1: Gather Input from User
- Present form based on document schema/outline
- Collect all required information upfront
- Store in `project.formData` object
- Example: For a PRD, gather product name, problem statement, target users, success metrics

### Step 2: Generate Prompt for Claude (Phase 1)
- Load `prompts/phase1.md` template
- Replace variables with form data: `{productName}`, `{problemStatement}`, etc.
- Display prompt with clear instructions: "Copy this prompt to Claude.ai"
- Prompt should say: "Help me generate a [document type] with the following structure... ask me questions along the way if you need clarification..."
- Provide "Copy Prompt" button

### Step 3: Collect Markdown from Claude
- User pastes prompt into Claude.ai (separate tab/window)
- Claude asks clarifying questions, user answers
- Claude generates complete markdown document
- User copies markdown from Claude
- User pastes into app's textarea
- App stores in `project.phases[0].response`

### Step 4: Construct Adversarial Prompt for Gemini (Phase 2)
- Load `prompts/phase2.md` template
- Inject Phase 1 result: `{phase1Output}` → Claude's markdown document
- Prompt should say: "Review this document. Provide STRONG critique, identify gaps, ask questions to disambiguate, and provide an IMPROVED version of the document."
- Display with "Copy Prompt" button
- Include "forget all previous sessions" clause if same-LLM detection triggers

### Step 5: Collect Improved Document from Gemini
- User pastes prompt into Gemini (separate tab/window)
- Gemini provides critique and asks questions
- User answers Gemini's questions
- Gemini provides improved markdown document
- User copies markdown from Gemini
- User pastes into app's textarea
- App stores in `project.phases[1].response`

### Step 6: Generate Final Synthesis Prompt for Claude (Phase 3)
- Load `prompts/phase3.md` template
- Inject both previous results:
  - `{phase1Output}` → Claude's original
  - `{phase2Output}` → Gemini's critique and improvements
- Prompt should say: "Consider the improvements made by the reviewer. Create a final document that benefits from both drafts. Ask any remaining clarifying questions."
- Display with "Copy Prompt" button

### Step 7: Collect Final Result from Claude
- User pastes prompt into Claude.ai
- Claude asks final clarifying questions
- User answers
- Claude generates final synthesized document
- User copies final markdown
- User pastes into app's textarea
- App stores in `project.phases[2].response`
- App marks workflow as complete
- **RESULT: Excellent document benefiting from adversarial review**

## Implementation Plan

### Phase 1: Create Authoritative Documentation

#### 1.1 Create `docs/ADVERSARIAL-WORKFLOW-PATTERN.md` (NEW)
**Priority: P0 - CRITICAL**

This will be THE definitive guide to the adversarial workflow pattern.

**Contents:**
- Title: "The 7-Step Adversarial Workflow Pattern"
- Subtitle: "The Core Pattern That Makes Genesis Projects Excellent"
- Opening statement: "This is the MOST IMPORTANT pattern in Genesis. Every document-generation app MUST follow this pattern."
- Complete 7-step breakdown (as detailed above)
- Data flow diagrams
- Code examples for each step
- Common mistakes and how to avoid them
- Quality checklist
- Links to reference implementations

**Length:** ~400-500 lines
**Format:** Highly structured with clear sections, code examples, diagrams

#### 1.2 Create `docs/ANTI-PATTERNS.md` (NEW)
**Priority: P0 - CRITICAL**

Explicit documentation of WRONG patterns vs RIGHT patterns.

**Contents:**
- **WRONG: Auto-generation of AI responses**
  ```javascript
  // ❌ WRONG - Do NOT do this
  async function generatePhase1() {
    const aiResponse = await callAI(prompt);
    textarea.value = aiResponse;  // App generates AI content
  }
  ```

- **RIGHT: Prompt generation for external AI**
  ```javascript
  // ✅ RIGHT - Do this instead
  async function generatePhase1Prompt() {
    const prompt = await loadPrompt(1);
    displayPromptWithCopyButton(prompt);  // User copies to Claude.ai
  }
  ```

- **WRONG: Same AI for all phases**
- **RIGHT: Different AIs (Claude → Gemini → Claude)**
- **WRONG: No questions asked by AI**
- **RIGHT: Prompts explicitly request questions**
- **WRONG: Single-shot generation**
- **RIGHT: Iterative with user feedback**

**Length:** ~300-400 lines
**Format:** Side-by-side comparisons with clear ❌/✅ markers

### Phase 2: Update Existing Documentation

#### 2.1 Update `docs/WORKFLOW-ARCHITECTURE.md`
**Priority: P0 - CRITICAL**

**Changes:**
1. Add prominent section at top: "⚠️ CRITICAL: Read ADVERSARIAL-WORKFLOW-PATTERN.md first"
2. Clarify "mock mode" means "development/testing ONLY - NOT auto-generation"
3. Add explicit warning: "Apps generate PROMPTS, not AI responses"
4. Update all examples to show prompt generation, not AI calls
5. Add data flow diagram showing the 7 steps
6. Add quality checklist

**Estimated changes:** 50-100 lines added/modified

#### 2.2 Update `00-AI-MUST-READ-FIRST.md`
**Priority: P0 - CRITICAL**

**Changes:**
1. Add to "BEFORE YOU START" section:
   ```markdown
   - [ ] Read `docs/ADVERSARIAL-WORKFLOW-PATTERN.md` ⭐ **MANDATORY**
   - [ ] Read `docs/ANTI-PATTERNS.md` ⭐ **MANDATORY**
   - [ ] Understand the 7-step workflow pattern (NOT 3-phase!)
   - [ ] Understand apps generate PROMPTS, not AI responses
   ```

2. Add new section "🚨 ADVERSARIAL WORKFLOW REQUIREMENTS":
   ```markdown
   ## 🚨 ADVERSARIAL WORKFLOW REQUIREMENTS

   **MANDATORY - Your app MUST implement all 7 steps:**

   1. [ ] Gather input from user via form
   2. [ ] Generate prompt for Claude with "ask questions" instruction
   3. [ ] Collect markdown from Claude
   4. [ ] Generate adversarial prompt for Gemini with critique request
   5. [ ] Collect improved document from Gemini
   6. [ ] Generate synthesis prompt for Claude with both drafts
   7. [ ] Collect final document from Claude

   **VERIFICATION:**
   - [ ] App has "Copy Prompt" buttons (NOT "Generate with AI" buttons)
   - [ ] Prompts explicitly request AI to ask questions
   - [ ] Different AIs used for Phase 1 and Phase 2 (Claude vs Gemini)
   - [ ] User manually copies/pastes between app and AI services
   ```

**Estimated changes:** 30-50 lines added

#### 2.3 Update `START-HERE.md`
**Priority: P1 - HIGH**

**Changes:**
1. Add section 1.5 "Understanding the Adversarial Workflow Pattern"
2. Add prominent callout box:
   ```markdown
   ╔══════════════════════════════════════════════════════════════════╗
   ║  ⚠️  CRITICAL: Genesis apps implement a 7-step workflow pattern ║
   ║                                                                  ║
   ║  Read docs/ADVERSARIAL-WORKFLOW-PATTERN.md BEFORE coding!       ║
   ║                                                                  ║
   ║  Common mistake: Auto-generating AI responses (WRONG!)          ║
   ║  Correct pattern: Generating prompts for external AI (RIGHT!)   ║
   ╚══════════════════════════════════════════════════════════════════╝
   ```

3. Add to "Checklist for AI Agents" section

**Estimated changes:** 40-60 lines added

#### 2.4 Update `CLAUDE.md`
**Priority: P1 - HIGH**

**Changes:**
1. Add new quality gate in "Non-Negotiable Quality Gates":
   ```markdown
   5. **Adversarial Workflow Pattern** - All document-generation apps MUST:
      - Generate prompts for external AI services (NOT auto-generate AI responses)
      - Implement all 7 steps of the workflow pattern
      - Have "Copy Prompt" buttons (NOT "Generate with AI" buttons)
      - Use different AIs for different phases (Claude → Gemini → Claude)
   ```

2. Add to "Before Every Commit":
   ```bash
   # Verify adversarial workflow pattern
   ./genesis-validator/scripts/validate-adversarial-workflow.sh
   ```

**Estimated changes:** 20-30 lines added

### Phase 3: Enhance Templates

#### 3.1 Update Prompt Templates
**Priority: P1 - HIGH**

**`templates/prompts/phase1-template.md`:**
- Add explicit instruction: "Ask me clarifying questions as you go"
- Add: "Generate a complete markdown document"
- Clarify expected output format

**`templates/prompts/phase2-template.md`:**
- Add explicit instruction: "Provide STRONG critique"
- Add: "Ask questions to disambiguate unclear aspects"
- Add: "Provide an IMPROVED version of the document"
- Ensure "forget all previous sessions" clause is present

**`templates/prompts/phase3-template.md`:**
- Add explicit instruction: "Consider BOTH drafts"
- Add: "Ask any remaining clarifying questions"
- Add: "Create final synthesized document"

**Estimated changes:** 30-50 lines modified across 3 files

### Phase 4: Add Visual Aids

#### 4.1 Create Workflow Diagram
**Priority: P2 - MEDIUM**

Create ASCII art or mermaid diagram for the 7-step workflow:

```
┌─────────────────────────────────────────────────────────────┐
│                    THE 7-STEP PATTERN                       │
└─────────────────────────────────────────────────────────────┘

Step 1: User fills form
   ↓
Step 2: App generates Claude prompt → User copies → Claude.ai
   ↓
Step 3: User pastes Claude's markdown → App stores
   ↓
Step 4: App generates Gemini prompt → User copies → Gemini
   ↓
Step 5: User pastes Gemini's improved doc → App stores
   ↓
Step 6: App generates final Claude prompt → User copies → Claude.ai
   ↓
Step 7: User pastes final doc → App stores → DONE!
```

Add to `docs/ADVERSARIAL-WORKFLOW-PATTERN.md`

## Success Criteria

### Documentation Quality
- [ ] Single authoritative document exists (ADVERSARIAL-WORKFLOW-PATTERN.md)
- [ ] 7-step pattern is explicitly numbered and detailed
- [ ] Anti-patterns are documented with clear ❌/✅ examples
- [ ] All entry points (START-HERE, 00-AI-MUST-READ-FIRST) reference the pattern
- [ ] CLAUDE.md includes quality gate for adversarial workflow

### Clarity Improvements
- [ ] Pattern is impossible to miss (prominent in 3+ places)
- [ ] Pattern is impossible to misunderstand (explicit 7 steps)
- [ ] Anti-patterns are clearly documented (wrong vs right side-by-side)
- [ ] Visual aids help understanding (diagrams, flowcharts)

### Implementation Support
- [ ] Prompt templates explicitly request questions from AI
- [ ] Code examples show correct prompt generation pattern
- [ ] Reference implementations are prominently linked
- [ ] Validator checks for anti-patterns

### Validation
- [ ] All tests pass
- [ ] Genesis validator passes
- [ ] Documentation is internally consistent
- [ ] No broken links

## Timeline

**Total Estimated Effort:** 4-6 hours

**Phase 1:** 2 hours (Create new docs)
**Phase 2:** 1.5 hours (Update existing docs)
**Phase 3:** 0.5 hours (Enhance templates)
**Phase 4:** 1 hour (Visual aids and validation)

## Rollout Plan

1. Create all new documentation
2. Update existing documentation
3. Enhance templates
4. Run all tests and validator
5. Commit with clear message explaining improvements
6. Update TEST_PLAN.md to include adversarial workflow tests

## Follow-up Actions

After completing this plan:
1. Review recent failed project to verify it would now succeed
2. Consider adding automated checks in genesis-validator
3. Update reference implementations if needed
4. Create video walkthrough or tutorial (optional)

---

**Bottom Line:** Make it IMPOSSIBLE to miss the 7-step adversarial workflow pattern. Make it OBVIOUS what's wrong and what's right. Provide clear examples and validation.
