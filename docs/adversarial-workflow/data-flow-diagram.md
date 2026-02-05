# Data Flow Diagram

> Part of [The 7-Step Adversarial Workflow Pattern](../ADVERSARIAL-WORKFLOW-PATTERN.md)

---

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         THE 7-STEP WORKFLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 1: GATHER INPUT
┌──────────────┐
│ User fills   │
│ form with    │──────▶ Stored in project.formData
│ requirements │
└──────────────┘

                    ↓

STEP 2: GENERATE CLAUDE PROMPT (Phase 1)
┌──────────────────────────────┐
│ Load prompts/phase1.md       │
│ Replace {variables}          │──────▶ Stored in project.phases[0].prompt
│ Display with copy button     │
└──────────────────────────────┘
                    │
                    │ User copies
                    ↓
            ┌──────────────┐
            │  Claude.ai   │
            │  (external)  │
            └──────────────┘
                    │ Claude asks questions
                    │ User answers
                    │ Claude generates document
                    ↓

STEP 3: COLLECT CLAUDE'S DOCUMENT
┌──────────────────────────────┐
│ User pastes markdown         │
│ App validates response       │──────▶ Stored in project.phases[0].response
│ Mark Phase 1 complete        │
└──────────────────────────────┘

                    ↓

STEP 4: GENERATE GEMINI PROMPT (Phase 2)
┌──────────────────────────────┐
│ Load prompts/phase2.md       │
│ Inject {phase1_output}       │──────▶ Stored in project.phases[1].prompt
│ Apply same-LLM detection     │
│ Display with copy button     │
└──────────────────────────────┘
                    │
                    │ User copies
                    ↓
            ┌──────────────┐
            │   Gemini     │
            │  (external)  │
            └──────────────┘
                    │ Gemini critiques
                    │ Gemini asks questions
                    │ User answers
                    │ Gemini provides improved doc
                    ↓

STEP 5: COLLECT GEMINI'S IMPROVED DOCUMENT
┌──────────────────────────────┐
│ User pastes markdown         │
│ App validates critique       │──────▶ Stored in project.phases[1].response
│ Mark Phase 2 complete        │
└──────────────────────────────┘

                    ↓

STEP 6: GENERATE FINAL SYNTHESIS PROMPT (Phase 3)
┌──────────────────────────────┐
│ Load prompts/phase3.md       │
│ Inject {phase1_output}       │
│ Inject {phase2_output}       │──────▶ Stored in project.phases[2].prompt
│ Display with copy button     │
└──────────────────────────────┘
                    │
                    │ User copies
                    ↓
            ┌──────────────┐
            │  Claude.ai   │
            │  (external)  │
            └──────────────┘
                    │ Claude synthesizes both
                    │ Claude asks final questions
                    │ User answers
                    │ Claude generates final doc
                    ↓

STEP 7: COLLECT FINAL DOCUMENT
┌──────────────────────────────┐
│ User pastes final markdown   │
│ App validates response       │──────▶ Stored in project.phases[2].response
│ Mark workflow complete       │        AND project.finalDocument
│ Show completion screen       │
└──────────────────────────────┘

                    ↓

            ✨ EXCELLENT DOCUMENT! ✨
```

