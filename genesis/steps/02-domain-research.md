# Step 2: Domain Research 🔬

> **For Claude:** MANDATORY — Do NOT skip this step!
> **Time Budget:** 15-30 minutes
> **Exit Criteria:** Research document saved with key takeaways extracted.

---

## Entry Conditions

- [ ] Completed [Step 1: Gather Requirements](01-requirements.md)
- [ ] All template variables captured
- [ ] User has confirmed document type

---

## Why This Matters

**Without domain research:**
- ❌ Validator uses generic one-pager criteria instead of document-specific criteria
- ❌ LLM prompts lack domain expertise
- ❌ Form fields don't capture essential information
- ❌ Red flag detection is missing or wrong

**With domain research:**
- ✅ Validator scoring matches document type requirements
- ✅ LLM prompts include expert-level guidance
- ✅ Form fields capture what matters for the document
- ✅ Red flags are accurate and research-backed

---

## Research Process

### 1. Identify Research Prompts (collaborate with user)

Define 5-7 progressive prompts covering:
- Structure and best practices for the document type
- Common mistakes and anti-patterns
- Quality criteria and scoring dimensions
- Domain-specific terminology and requirements

**Example (JD Assistant):**
1. Modern JD structure & AI-optimization
2. Inclusive language — gender (masculine-coded words)
3. Inclusive language — neurodiversity/introverts
4. Requirements & leveling (must-have vs nice-to-have)
5. Compensation transparency best practices
6. Red flags & anti-patterns
7. AI/LLM-era role requirements

### 2. Conduct Perplexity Research

For each prompt:
1. Send to Perplexity (or preferred research tool)
2. Record prompt and synthesized answer
3. Extract actionable insights

### 3. Create Research Document

```bash
mkdir -p docs
# Create: docs/{DOCUMENT_TYPE}-RESEARCH-{YEAR}.md
```

---

## Research Document Template

```markdown
# {Document Type} Research — {Year}

> **Purpose**: Foundational research for building the {Project Name} tool.
> **Date**: {Date}
> **Method**: Progressive Perplexity prompts synthesizing current best practices.

---

## 1. {Topic 1}

### Prompt
\`\`\`
{Exact prompt sent to Perplexity}
\`\`\`

### Answer
{Synthesized answer with tables, lists, examples}

---

## Key Takeaways for Implementation

### Form Fields Derived
- Field 1: {reason}

### Validator Scoring Dimensions
- Dimension 1 (X points): {criteria}

### LLM Prompt Guidance
- Must include: {specific instructions}
- Must avoid: {anti-patterns}

### Red Flag Detection Rules
- Pattern 1: {what to flag and why}
```

---

## ⛔ Exit Criteria (ALL MUST PASS)

```bash
# 1. Verify research document exists
RESEARCH_FILE="docs/${DOCUMENT_TYPE}-RESEARCH-$(date +%Y).md"
[ -f "$RESEARCH_FILE" ] && echo "✅ Research doc exists" || echo "❌ BLOCKED: Create research doc"

# 2. Verify key takeaways section exists
grep -q "Key Takeaways" "$RESEARCH_FILE" && echo "✅ Takeaways extracted" || echo "❌ BLOCKED: Add takeaways"
```

### Verification Checklist

- [ ] Research document created in `docs/`
- [ ] 5-7 research prompts answered
- [ ] Form fields derived from research
- [ ] Validator scoring dimensions defined
- [ ] LLM prompt guidance extracted
- [ ] Red flag detection rules identified

---

## 🚫 DO NOT PROCEED if:

- Research document doesn't exist
- Key takeaways section is missing
- Validator scoring dimensions not defined

---

**Reference:** See `jd-assistant/docs/JD-RESEARCH-2025.md` for a complete example.

**Next Step:** [Step 3: Copy Templates →](03-copy-templates.md)

