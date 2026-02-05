# Anti-Patterns: Auto-Generation & Same AI All Phases

> Part of [Anti-Patterns Guide](../ANTI-PATTERNS.md)

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

