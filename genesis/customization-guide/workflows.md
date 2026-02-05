# Genesis Customization: Workflows

> Part of [Customization Guide](../03-CUSTOMIZATION-GUIDE.md)

---

## Change Number of Phases

**Example**: Convert 3-phase PRD workflow to 2-phase One-Pager workflow

**Step 1**: Edit `config.json`:
```json
{
  "workflow": {
    "type": "multi-phase",
    "phases": [
      {
        "number": 1,
        "name": "Initial Draft",
        "ai_model": "Claude Sonnet 4.5",
        "prompt_file": "prompts/phase1.txt"
      },
      {
        "number": 2,
        "name": "Review & Score",
        "ai_model": "Claude Sonnet 4.5",
        "prompt_file": "prompts/phase2.txt"
      }
    ]
  }
}
```

**Step 2**: Update `templates/web-app/js/workflow-template.js`:
- Change `PHASE_COUNT` from 3 to 2
- Remove phase 3 logic
- Update UI to show 2 phases

**Step 3**: Create prompt templates:
- `prompts/phase1.txt` - Initial draft prompt
- `prompts/phase2.txt` - Review & score prompt

**Step 4**: Update documentation:
- `README-template.md` - Update workflow description
- `ARCHITECTURE-template.md` - Update architecture diagram

