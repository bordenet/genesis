# Anti-Patterns: Mock Mode Confusion & Stillborn App

> Part of [Anti-Patterns Guide](../ANTI-PATTERNS.md)

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

