# The 7 Steps in Detail

> Part of [The 7-Step Adversarial Workflow Pattern](../ADVERSARIAL-WORKFLOW-PATTERN.md)

---

## Step 1: Gather Input from User

**Purpose:** Collect all necessary information before generating any prompts.

| Action | Details |
|--------|---------|
| Display form | Based on document schema/outline |
| Validate input | Required fields, format checks |
| Store data | `project.formData` object |

**Common Mistakes:** Skipping validation, not persisting data, proceeding with incomplete info.

---

## Step 2: Generate Prompt for Claude (Phase 1)

**Purpose:** Create a prompt that Claude will use to generate the initial draft.

| Action | Details |
|--------|---------|
| Load template | `prompts/phase1.md` |
| Replace variables | `{project_name}` → form data |
| Display prompt | With "Copy to Clipboard" button |
| User copies | To Claude.ai (external) |

**Critical:** Prompt MUST instruct Claude to "ask clarifying questions."

**Common Mistakes:** Auto-generating response, not requesting questions, missing variable replacements.

---

## Step 3: Collect Markdown from Claude

**Purpose:** Capture Claude's generated document with user's refinements.

| Action | Details |
|--------|---------|
| User pastes to Claude | External AI service |
| Claude asks questions | User answers in conversation |
| User copies response | Complete markdown document |
| App validates | Not empty, is markdown, reasonable length |
| App stores | `project.phases[0].response` |

**Common Mistakes:** Not validating format, accepting partial responses.

---

## Step 4: Construct Adversarial Prompt for Gemini (Phase 2)

**Purpose:** Generate a prompt that instructs Gemini to critique and improve Claude's draft.

| Action | Details |
|--------|---------|
| Load template | `prompts/phase2.md` |
| Inject Phase 1 | `{phase1_output}` → Claude's response |
| Add "forget" clause | For same-LLM detection |
| Display prompt | With "Copy to Clipboard" button |

**Critical:** Include "FORGET all previous sessions" clause. Request STRONG critique AND improved version.

**Common Mistakes:** Not including full Phase 1 document, missing forget clause.

---

## Step 5: Collect Improved Document from Gemini

**Purpose:** Capture Gemini's critique and improved version.

| Action | Details |
|--------|---------|
| User pastes to Gemini | External AI service |
| Gemini critiques | Asks questions, provides improvements |
| User copies response | Complete critique + improved doc |
| App validates | Contains critique markers |
| App stores | `project.phases[1].response` |

**Common Mistakes:** Accepting response without critique, truncated responses.

---

## Step 6: Generate Final Synthesis Prompt for Claude (Phase 3)

**Purpose:** Create a prompt for Claude to synthesize both drafts into final document.

| Action | Details |
|--------|---------|
| Load template | `prompts/phase3.md` |
| Inject Phase 1 | `{phase1_output}` → Claude's original |
| Inject Phase 2 | `{phase2_output}` → Gemini's critique |
| Display prompt | With "Copy to Clipboard" button |

**Critical:** Both Phase 1 AND Phase 2 must be included. Emphasize synthesis, not just picking one.

**Common Mistakes:** Only including one previous output, not emphasizing synthesis.

---

## Step 7: Collect Final Result from Claude

**Purpose:** Capture the final synthesized document.

| Action | Details |
|--------|---------|
| User pastes to Claude | External AI service |
| Claude synthesizes | Best of both versions |
| User copies response | Final markdown document |
| App stores | `project.phases[2].response` AND `project.finalDocument` |
| App shows completion | Download/export options |

**Result:** Excellent document through adversarial review! 🎉

**Common Mistakes:** Not marking workflow complete, no download option.

