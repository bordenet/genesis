# Genesis Process Improvements - Compressed

**Date**: 2025-11-21 | **Project**: one-pager | **Issue**: Genesis docs insufficient for autonomous AI execution

## Core Problem

AI required extensive Q&A despite having Genesis templates. Root cause: Missing reference to working example (product-requirements-assistant) that already solved all patterns.

## Gaps Identified

1. **No Reference Implementation Link** - Should point to product-requirements-assistant as canonical example
2. **Workflow Architecture** - Missing docs on phase types (mock/manual), data flow, transitions
3. **Template Patterns** - Prompts in files, template variables, form-to-prompt mapping not documented
4. **Form-to-Prompt Pattern** - Phase 1 form → template variables → validation flow not explained

## Solutions Implemented

**Created**: `REFERENCE-IMPLEMENTATIONS.md` pointing to product-requirements-assistant as canonical example

**Key Patterns Documented**:
- 3-phase workflow (mock/manual modes)
- Prompts in `/prompts/` as markdown with `{variables}`
- Form-to-prompt mapping in Phase 1
- Template abstraction in `/templates/`
- Defensive coding patterns

**Reference Files**: `js/workflow.js`, `js/app.js`, `prompts/phase1.md`, `templates/prd-template.md`

**Phase Types**:
- `type: 'mock'` - Dev mode shows mock button, prod requires manual copy/paste
- `type: 'manual'` - Always requires external AI (e.g., Gemini)

**Data Flow**: Form → formData → prompts/phaseN.md → {variables} replaced → AI response → phases[N].response

**Form-to-Prompt**: Phase 1 form fields map to template variables, validated before prompt generation
**Template Variables**: `{formField}` in prompts/phaseN.md, `{phase1_output}` for previous responses

**Defensive Patterns**: Validate required fields, handle missing prompts with try/catch, sanitize input, graceful degradation with `?.`

**Testing**: Mock fetch for async prompt loading tests

## START-HERE.md Update

Added STEP 0: Study product-requirements-assistant BEFORE gathering requirements. Read `js/workflow.js`, `js/app.js`, `prompts/phase1.md` to understand patterns.
## Workflow Decision Tree

**Phases**: 2 (simple), 3 (recommended: Draft/Review/Synthesis), 4+ (complex)

**Mock vs Manual**: Default 3-phase = Mock/Manual/Mock. Phase 2 manual forces different AI model.

**Phase 1 Form**: YES if structured document (PRD, one-pager). Form fields map to template sections and `{variables}`.

**Template Variables**: Phase 1 = form fields, Phase 2 = `{phase1Output}`, Phase 3 = `{phase1Output}` + `{phase2Output}`

**Document Template**: Structure + writing tips + example + common mistakes. Guides form design and AI prompts.
## Requirements Template

**Ask ONLY**: Project name/title/description, GitHub username/repo, document type, deviations from 3-phase workflow

**NEVER ask**: Prompts in files? (YES), Templates abstracted? (YES), Mock mode? (see reference), Phase 1 form? (YES if structured), Validation? (see reference)

**Infer from reference**: 3 phases (mock/manual/mock), prompts in `/prompts/`, templates in `/templates/`, form-to-prompt pattern, `{variableName}` syntax

## AI Protocol for Future Genesis Projects

**Phase 0 (Study)**: Read REFERENCE-IMPLEMENTATIONS.md, study product-requirements-assistant, understand workflow/form-to-prompt/mock-vs-manual

**Phase 1 (Infer)**: 3-phase workflow, phase types, prompts/templates directories, form fields map to template sections, async prompt loading, defensive patterns

**Phase 2 (Ask)**: Project identity, GitHub info, document type, workflow deviations only

**Phase 3 (Execute)**: Copy hello-world, customize, create prompts/templates, update workflow.js/app.js, test, commit, enable Pages, verify

**Success Metrics**: 90% autonomous, ask 3-5 questions (down from 15-20), 5min to code (down from 30min), 95% success rate (up from 60%)


