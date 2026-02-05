# Genesis README: 3-Phase Workflow Pattern

> Part of [Genesis README](../README.md)

---

## 🔧 Understanding the 3-Phase Workflow Pattern

Genesis projects use a **3-phase workflow pattern** by default.

### The Pattern

**Phase 1: Initial Draft (Mock Mode)**
- **Purpose**: Fast iteration with structured inputs
- **How it works**: User fills form → AI generates draft (client-side)
- **AI Model**: Typically Claude Sonnet 4.5
- **Key Feature**: Form fields map to template sections
- **Output**: Initial draft document

**Phase 2: Review & Critique (Manual Mode)**
- **Purpose**: Get different AI perspective for quality improvement
- **How it works**: User copies Phase 1 output → pastes to external AI → gets critique → copies back
- **AI Model**: Typically Gemini 2.5 Pro (different from Phase 1)
- **Key Feature**: Different AI provides fresh perspective
- **Output**: Critique and improvement suggestions

**Phase 3: Final Synthesis (Mock Mode)**
- **Purpose**: Combine best of both versions
- **How it works**: AI synthesizes Phase 1 + Phase 2 → final document (client-side)
- **AI Model**: Typically Claude Sonnet 4.5 (same as Phase 1)
- **Key Feature**: Best of both worlds
- **Output**: Final polished document

---

## Why 3 Phases?

1. **Phase 1**: Fast iteration with structured inputs (form-driven)
2. **Phase 2**: Different AI perspective prevents groupthink
3. **Phase 3**: Synthesis combines strengths of both

---

## Configuration

**Default Configuration** (recommended for most projects):
```javascript
// In workflow.js
const PHASES = {
  1: { name: 'Initial Draft', mode: 'mock', ai: 'Claude Sonnet 4.5' },
  2: { name: 'Review & Critique', mode: 'manual', ai: 'Gemini 2.5 Pro' },
  3: { name: 'Final Synthesis', mode: 'mock', ai: 'Claude Sonnet 4.5' }
};
```

**Customization Options**:
- **2-phase workflow**: Skip Phase 2 (no external review)
- **5-phase workflow**: Add more review/refinement cycles
- **Different AI models**: Use different models per phase
- **All manual**: Set all phases to manual mode (no mock)
- **All mock**: Set all phases to mock mode (no external AI)

**When to customize**:
- ✅ Different document types may need different phase counts
- ✅ Some workflows benefit from more review cycles
- ✅ Some users prefer all-manual or all-mock modes
- ❌ Don't customize without good reason (3-phase is proven)

---

## File Structure for Phases

```
prompts/
  phase1.md          # Prompt for Phase 1 (form → draft)
  phase2.md          # Prompt for Phase 2 (draft → critique)
  phase3.md          # Prompt for Phase 3 (draft + critique → final)

templates/
  {document-type}-template.md  # Document structure template

js/
  workflow.js        # Phase configuration and logic
  app.js            # Form rendering and phase transitions
```

**See reference implementations for concrete examples!**

