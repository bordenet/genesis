# Reference Implementations

Before starting ANY Genesis project, study these working examples:

## 1. Product Requirements Assistant (3-Phase PRD Generator)
**Repository**: https://github.com/bordenet/product-requirements-assistant
**Live Demo**: https://bordenet.github.io/product-requirements-assistant/

### What to Study:
1. **Workflow Architecture** (`js/workflow.js`):
   - 3-phase workflow with mixed mock/manual modes
   - Phase 1: Mock mode (AI in-app)
   - Phase 2: Manual mode (user copies to Gemini)
   - Phase 3: Mock mode (AI in-app)

2. **Prompt Management** (`prompts/` directory):
   - Prompts stored as markdown files
   - Loaded asynchronously via fetch API
   - Template variable replacement: `{variableName}`

3. **Form-to-Prompt Pattern** (`js/app.js` - renderPhase1Form):
   - Phase 1 presents a form
   - Form fields map to document template sections
   - Validation before prompt generation
   - Form data stored in project.formData

4. **Template Abstraction** (`templates/` directory):
   - Document template stored separately from code
   - Easy to modify without touching JavaScript
   - Template structure guides form field design

5. **Defensive Coding**:
   - Input validation and sanitization
   - Error handling for missing data
   - User-friendly error messages
   - Graceful degradation

### Key Files to Review:
- `js/workflow.js` - Phase definitions, prompt generation, data flow
- `js/app.js` - UI rendering, form handling, phase transitions
- `prompts/phase1.md` - Example prompt with template variables
- `templates/prd-template.md` - Document structure
- `tests/workflow.test.js` - How to test async prompt loading

## 2. One-Pager Assistant (3-Phase One-Pager Generator)
**Repository**: https://github.com/bordenet/one-pager
**Live Demo**: https://bordenet.github.io/one-pager/

### What to Study:
- Same 3-phase workflow pattern as PRD Assistant
- Different document template (one-pager vs PRD)
- 9 form fields mapping to one-pager sections
- Example of adapting the pattern to different document types

## 3. Hello World (2-Phase Simple Example)
**Location**: `genesis/examples/hello-world/`

### What to Study:
- Simpler 2-phase workflow
- Basic project structure
- Minimal viable implementation
- Good starting point for understanding the basics

