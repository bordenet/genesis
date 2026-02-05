# Genesis Template Updates

> Part of [UI Workflow Bug Prevention](../GENESIS-UI-WORKFLOW-BUG-PREVENTION.md)

---

## 1. Update UI Event Handler Templates

**File:** `genesis/templates/js/workflow-view.js` (or equivalent)

Add this pattern to all "Save" button handlers:

```javascript
// Template for Save button handlers in multi-step workflows
saveBtn.addEventListener('click', async () => {
  const userInput = textarea.value.trim();
  
  if (!userInput) {
    showToast('Please enter data', 'warning');
    return;
  }
  
  // AUTO-GENERATE MISSING DEPENDENCIES
  // Check if any required data is missing from previous steps
  let requiredData = state.requiredData;
  if (!requiredData) {
    // User skipped a step - generate it now
    requiredData = await generateRequiredData(state);
  }
  
  // Now save with complete data
  await saveState(state.id, requiredData, userInput);
  showToast('Saved successfully!', 'success');
  refreshView();
});
```

---

## 2. Add Workflow Testing Template

**File:** `genesis/templates/tests/workflow-integration.test.js`

```javascript
describe('Workflow edge cases - user skips steps', () => {
  test('should handle user skipping intermediate steps', async () => {
    // Create initial state
    const state = await createState('data');
    
    // Verify required data is initially empty
    expect(state.requiredData).toBe('');
    
    // User skips step that generates requiredData
    // and goes directly to final step
    const finalInput = 'User input';
    
    // System should auto-generate missing data
    let requiredData = state.requiredData;
    if (!requiredData) {
      requiredData = await generateRequiredData(state);
    }
    
    await saveState(state.id, requiredData, finalInput);
    
    // Verify everything was saved correctly
    const updated = await getState(state.id);
    expect(updated.requiredData).toBeTruthy();
    expect(updated.finalInput).toBe(finalInput);
  });
});
```

---

## 3. Add to Genesis CLAUDE.md Template

**File:** `genesis/templates/CLAUDE.md`

Add this section after "Testing Standards":

```markdown
## 🎯 UI Workflow Principles

### Never Assume Linear User Behavior
Users will skip steps, go backwards, and use the app in unexpected ways.

**BAD:**
\`\`\`javascript
// Assumes user clicked Button A before Button B
buttonB.addEventListener('click', () => {
  const data = state.dataFromButtonA;  // ❌ Might be undefined
  saveData(data);
});
\`\`\`

**GOOD:**
\`\`\`javascript
// Auto-generates missing data if user skipped Button A
buttonB.addEventListener('click', () => {
  let data = state.dataFromButtonA;
  if (!data) {
    data = generateDataFromButtonA();  // ✅ Forgiving workflow
  }
  saveData(data);
});
\`\`\`

### Test Non-Linear Workflows
Always add tests for users skipping steps.
```

---

## 4. Update Genesis Spawn Script

**File:** `genesis/spawn.sh`

Add validation check after creating test templates:

```bash
# After copying test templates
echo "📝 Adding workflow edge case tests..."

# Check if project has multi-step workflows
if grep -q "phase\|step\|workflow" "$PROJECT_DIR/js/"*.js 2>/dev/null; then
  cat >> "$PROJECT_DIR/tests/workflow.test.js" << 'EOF'

describe('Workflow edge cases - user skips steps', () => {
  test('should handle non-linear user behavior', async () => {
    // TODO: Add test for users skipping intermediate steps
    // See: docs/GENESIS-UI-WORKFLOW-BUG-PREVENTION.md
  });
});
EOF

  echo "⚠️  REMINDER: Add workflow edge case tests"
fi
```

