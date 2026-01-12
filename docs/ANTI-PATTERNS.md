# Adversarial Workflow Anti-Patterns

**What NOT to Do: Common Mistakes and How to Avoid Them**

---

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  ⚠️  ANTI-PATTERNS: These are WRONG ways to implement Genesis apps  ⚠️      ║
║                                                                              ║
║  If you see any of these patterns in your code, STOP and fix them.         ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

## Table of Contents

1. [Auto-Generation Anti-Pattern](#anti-pattern-1-auto-generation)
2. [Same-AI-All-Phases Anti-Pattern](#anti-pattern-2-same-ai-all-phases)
3. [No-Questions Anti-Pattern](#anti-pattern-3-no-questions)
4. [Skipping-Steps Anti-Pattern](#anti-pattern-4-skipping-steps)
5. [Missing-Context Anti-Pattern](#anti-pattern-5-missing-context)
6. [Single-Shot Anti-Pattern](#anti-pattern-6-single-shot-generation)
7. [Mock-Mode-Confusion Anti-Pattern](#anti-pattern-7-mock-mode-confusion)
8. [Stillborn App Anti-Pattern](#anti-pattern-8-stillborn-app)

---

## Anti-Pattern #1: Auto-Generation

### ❌ WRONG: App Auto-Generates AI Responses

```javascript
// ❌ BAD CODE - Do NOT do this
async function generatePhase1Draft() {
  const prompt = buildPrompt(formData);

  // Calling AI API directly
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'anthropic-api-key': API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet',
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const aiResult = await response.json();

  // Auto-filling textarea with AI response
  document.getElementById('phase1-response').value = aiResult.content[0].text;

  // THIS IS WRONG! App generated AI content automatically
}
```

**Problems:**
- User never sees the prompt
- User can't interact with AI or ask questions
- No adversarial review (same system making all decisions)
- Defeats entire purpose of Genesis pattern

### ✅ RIGHT: App Generates Prompts for External AI

```javascript
// ✅ GOOD CODE - Do this instead
async function generatePhase1Prompt() {
  // Load prompt template
  const template = await fetch('prompts/phase1.md').then(r => r.text());

  // Replace variables
  let prompt = template;
  for (const [key, value] of Object.entries(formData)) {
    prompt = prompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }

  // Display prompt with copy button
  document.getElementById('prompt-display').textContent = prompt;
  document.getElementById('prompt-display').classList.remove('hidden');

  // Copy button
  document.getElementById('copy-prompt-btn').onclick = async () => {
    await navigator.clipboard.writeText(prompt);
    showToast('✅ Prompt copied! Paste into Claude.ai');
  };

  // User manually copies to external AI service
  // User manually pastes response back into app
}
```

**Benefits:**
- User sees exactly what's being asked
- User can interact with AI, ask follow-ups
- Different AI models provide different perspectives
- True adversarial review possible

---

## Anti-Pattern #2: Same AI All Phases

### ❌ WRONG: Using Same AI for All Phases

```javascript
// ❌ BAD CODE
const workflow = {
  phase1: {
    ai: 'Claude',           // Claude generates draft
    action: 'Generate PRD'
  },
  phase2: {
    ai: 'Claude',           // ❌ Same AI reviews its own work!
    action: 'Review PRD'
  },
  phase3: {
    ai: 'Claude',           // ❌ Same AI "synthesizes" (nothing to synthesize!)
    action: 'Finalize PRD'
  }
};
```

**Problems:**
- No adversarial perspective
- Same AI won't critique itself effectively
- No benefit from different AI strengths
- "Review" and "synthesis" phases are pointless

### ✅ RIGHT: Different AIs for Different Phases

```javascript
// ✅ GOOD CODE
const workflow = {
  phase1: {
    ai: 'Claude',                    // Claude's strength: comprehensive drafts
    aiService: 'claude.ai',
    action: 'Generate initial draft'
  },
  phase2: {
    ai: 'Gemini',                    // ✅ Different AI provides adversarial critique
    aiService: 'gemini.google.com',
    action: 'Critique and improve draft'
  },
  phase3: {
    ai: 'Claude',                    // Claude synthesizes both perspectives
    aiService: 'claude.ai',
    action: 'Synthesize best of both versions'
  }
};

// Instructions for users
const phaseInstructions = {
  phase1: 'Paste this prompt into Claude.ai',
  phase2: 'Paste this prompt into Gemini (different AI = different perspective!)',
  phase3: 'Paste this prompt back into Claude.ai for final synthesis'
};
```

**Benefits:**
- True adversarial review
- Combines Claude's and Gemini's strengths
- Phase 2 genuinely improves document
- Phase 3 has real synthesis work to do

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

---

## Anti-Pattern #5: Missing Context

### ❌ WRONG: Phase 2 Without Phase 1 Output

```markdown
<!-- ❌ BAD PHASE 2 PROMPT -->

Review the following Product Requirements Document.

Provide critique and improvements.
```

**Problems:**
- No document to review!
- Reviewer has no context
- Can't provide meaningful feedback

### ✅ RIGHT: Phase 2 With Full Phase 1 Output

```markdown
<!-- ✅ GOOD PHASE 2 PROMPT -->

FORGET all previous sessions. You are starting fresh as an adversarial reviewer.

Review the following complete Product Requirements Document.

**DOCUMENT TO REVIEW:**

{phase1_output}

**YOUR TASK:**
1. Identify gaps, vague statements, unrealistic claims
2. Ask clarifying questions about ambiguous sections
3. Provide an IMPROVED version with all issues fixed

Be critical - this is adversarial review.

**Your Review:**
```

**Benefits:**
- Reviewer sees complete document
- Can provide specific, actionable feedback
- Has full context for critique

---

## Anti-Pattern #6: Single-Shot Generation

### ❌ WRONG: Generate Entire Document at Once

```javascript
// ❌ BAD CODE
async function generateDocument() {
  const prompt = `Generate a complete 50-page technical specification for ${productName}`;

  // Single API call, no iteration
  const response = await callAI(prompt);

  // Done! (but probably mediocre)
  return response;
}
```

**Problems:**
- No user input during generation
- No clarification of assumptions
- AI makes guesses instead of asking
- Results are generic

### ✅ RIGHT: Iterative Refinement Through Phases

```javascript
// ✅ GOOD CODE
async function runAdversarialWorkflow() {
  // Phase 1: Draft with questions
  const draft = await generateWithQuestions('claude', phase1Prompt);
  // User answered questions: budget = $50k, timeline = Q2, etc.

  // Phase 2: Critique with more questions
  const critique = await generateWithQuestions('gemini', phase2Prompt);
  // User clarified: priority is mobile-first, MVP scope is 5 features

  // Phase 3: Synthesis with final questions
  const final = await generateWithQuestions('claude', phase3Prompt);
  // User confirmed: yes, include API versioning section

  // Result: Highly refined, user-validated document
  return final;
}
```

**Benefits:**
- User involved throughout
- Ambiguities clarified iteratively
- Final document matches user's intent

---

## Anti-Pattern #7: Mock Mode Confusion

### ❌ WRONG: Thinking "Mock Mode" Means Auto-Generate

```javascript
// ❌ BAD CODE - Misunderstanding "mock mode"
async function generatePhase1() {
  // Developer thinks: "Mock mode means app generates AI responses"

  if (MOCK_MODE) {
    // ❌ Auto-generating mock AI response
    const mockResponse = generateMockPRD(formData);
    document.getElementById('response').value = mockResponse;
  } else {
    // Calling real AI API
    const response = await callClaudeAPI(prompt);
    document.getElementById('response').value = response;
  }

  // THIS IS WRONG! Both branches auto-generate content
}
```

**Problems:**
- Misunderstands purpose of mock mode
- Production app still auto-generates (just uses real API)
- User never interacts with AI
- No adversarial workflow

### ✅ RIGHT: Mock Mode is for TESTING, Not Production

```javascript
// ✅ GOOD CODE - Correct understanding
async function generatePhase1Prompt() {
  // Load and display prompt
  const prompt = await loadPromptTemplate('phase1.md');
  displayPromptWithCopyButton(prompt);

  // PRODUCTION: User manually copies to Claude.ai
  // No auto-generation - user always pastes response manually

  if (DEVELOPMENT_MODE) {
    // Mock mode is ONLY for testing the UI flow
    // Shows "Use Mock Response" button for developers
    showMockResponseButton();  // Developer convenience, not production feature
  }
}

function showMockResponseButton() {
  // Only visible in development
  const btn = document.createElement('button');
  btn.textContent = '[DEV] Use Mock Response';
  btn.classList.add('dev-only');
  btn.onclick = () => {
    // Fills textarea with mock data for UI testing
    document.getElementById('response').value = getMockResponse();
    console.warn('Mock response used - development only!');
  };
  document.getElementById('dev-tools').appendChild(btn);
}
```

**Benefits:**
- Clear separation: development vs production
- Mock mode is for testing UI, not replacing workflow
- Production always uses manual copy/paste

---

## Quick Reference: Wrong vs Right

| Aspect | ❌ Wrong | ✅ Right |
|--------|----------|----------|
| **AI Interaction** | App calls AI API | User copies to external AI |
| **Button Text** | "Generate with AI" | "Copy Prompt" |
| **Prompt Display** | Hidden from user | Shown with copy button |
| **User Role** | Passive (watches app work) | Active (interacts with AI) |
| **Phase 2 AI** | Same as Phase 1 | Different AI (adversarial) |
| **Questions** | None requested | Explicitly requested in prompts |
| **Flow** | Can skip phases | Enforced sequential order |
| **Context** | Missing previous outputs | Full previous outputs included |
| **Generation** | Single-shot | Iterative with user input |
| **Mock Mode** | Replaces workflow | Testing convenience only |

---

## Validation Checklist

Before considering your implementation complete, verify:

### Code Review Checklist

- [ ] **No API calls** to AI services in production code
- [ ] **No auto-generation** of AI content anywhere
- [ ] **Prompt templates** exist for all 3 phases
- [ ] **Copy buttons** present for all phases
- [ ] **Different AIs** used: Claude → Gemini → Claude
- [ ] **Sequential flow** enforced (can't skip phases)
- [ ] **Full context** injected in Phase 2 and 3 prompts
- [ ] **Questions requested** in all prompt templates
- [ ] **Validation** prevents incomplete responses
- [ ] **Mock mode** clearly marked as development-only

### UI Review Checklist

- [ ] **No "Generate with AI" buttons** anywhere
- [ ] **All buttons say "Copy Prompt"** or "Generate Prompt"
- [ ] **Prompts visible** to user before copying
- [ ] **Clear instructions** for each phase
- [ ] **External AI services mentioned** (Claude.ai, Gemini)
- [ ] **Step-by-step guide** visible for each phase
- [ ] **Phase indicators** show progress (1/3, 2/3, 3/3)
- [ ] **Previous phases read-only** once completed

### Workflow Review Checklist

- [ ] **7 steps** all implemented (gather, prompt, collect × 3)
- [ ] **Form collection** happens first
- [ ] **Phase 1** uses Claude
- [ ] **Phase 2** uses Gemini
- [ ] **Phase 3** uses Claude again
- [ ] **Each prompt** requests questions from AI
- [ ] **Phase 2** includes full Phase 1 output
- [ ] **Phase 3** includes both Phase 1 and Phase 2 outputs
- [ ] **Completion screen** marks workflow done

---

## How to Fix If You Made These Mistakes

### Quick Fix Guide

1. **Search your code for:**
   - `api.anthropic.com`
   - `api.openai.com`
   - `generatePhase1AI`
   - `generatePhase2AI`
   - `callAI`
   - Auto-generation patterns

2. **If found, replace with:**
   - Prompt loading from `prompts/phase*.md`
   - Template variable replacement
   - Display prompt with copy button
   - Manual user paste into textarea

3. **Update button text:**
   - "Generate with AI" → "Generate Prompt for Claude"
   - "Auto-fill" → "Copy Prompt to Clipboard"

4. **Add validation:**
   - Check phase completion before advancing
   - Validate responses are not empty
   - Confirm markdown format

5. **Update prompts:**
   - Add "ask clarifying questions" instruction
   - Add "forget previous sessions" to Phase 2
   - Inject full previous outputs

---

---

## Anti-Pattern #8: Stillborn App

### ❌ WRONG: Buttons Exist But Have No Event Handlers

```javascript
// ❌ BAD CODE - Button created but never wired up
function renderPhaseContent(project, phase) {
    container.innerHTML = `
        <div class="prompt-section">
            <p class="prompt-preview">${prompt.substring(0, 200)}...</p>
            <button class="view-prompt-btn">View Full Prompt</button>
        </div>
    `;
    // ❌ Missing: No addEventListener for view-prompt-btn!
}
```

**Problems:**

- UI looks complete but buttons do nothing when clicked
- User thinks app is broken or incomplete
- Critical functionality is inaccessible
- Hard to detect without manually testing every button

### ✅ CORRECT: Wire Event Handlers Immediately After Render

```javascript
// ✅ GOOD CODE - Handler wired immediately after render
function renderPhaseContent(project, phase) {
    container.innerHTML = `
        <div class="prompt-section">
            <p class="prompt-preview">${prompt.substring(0, 200)}...</p>
            <button class="view-prompt-btn">View Full Prompt</button>
        </div>
    `;

    // ✅ Wire up event handler immediately
    const viewPromptBtn = container.querySelector('.view-prompt-btn');
    if (viewPromptBtn) {
        viewPromptBtn.addEventListener('click', () => {
            showPromptModal(project.phases[phase].prompt);
        });
    }
}
```

**Benefits:**

- Every button does what user expects
- App feels complete and polished
- Critical functionality accessible
- Easy to verify with grep or tests

### Detection Checklist

Run these commands to detect stillborn buttons:

```bash
# Find all buttons in HTML/JS
grep -rn "button\|Button" --include="*.js" --include="*.html" src/

# For each button ID/class, verify handler exists
grep -rn "view-prompt-btn" --include="*.js" src/
# Should show BOTH the button creation AND addEventListener
```

### Testing Pattern

```javascript
test('View Full Prompt button opens modal', () => {
    renderPhaseContent(mockProject, 1);

    const btn = document.querySelector('.view-prompt-btn');
    expect(btn).toBeTruthy();  // Button exists

    btn.click();  // Simulate click

    // Verify modal opened
    const modal = document.querySelector('.prompt-modal');
    expect(modal).toBeTruthy();  // Modal appeared
});
```

---

## References

- [ADVERSARIAL-WORKFLOW-PATTERN.md](ADVERSARIAL-WORKFLOW-PATTERN.md) - Complete correct pattern
- [WORKFLOW-ARCHITECTURE.md](../genesis/docs/WORKFLOW-ARCHITECTURE.md) - Architecture guide
- Reference implementation: https://github.com/bordenet/product-requirements-assistant

---

**Remember:** If you see any of these anti-patterns, STOP and fix them before proceeding. These patterns defeat the entire purpose of Genesis.
