# Adversarial Testing Guide

This guide covers two complementary patterns for maintaining adversarial tension in AI-assisted workflows:

1. **[Same-LLM Adversarial](#same-llm-adversarial-testing)** - When stuck with a single LLM, simulate adversarial tension via personality injection
2. **[Cross-LLM Adversarial](#cross-llm-adversarial-testing)** - Pit multiple LLMs against each other for independent verification

Both patterns emerged from the Genesis ecosystem's 3-phase workflow, where Phase 2 (adversarial review) must genuinely challenge Phase 1 output.

---

## Cross-LLM Adversarial Testing

The most effective adversarial pattern: use different LLMs to review each other's work.

### How It Works

Claude generates review prompts for Gemini and Perplexity.ai. Each LLM reviews the document-specific JavaScript ratings and prompts, catching issues the originating model would miss.

```
┌─────────────────────────────────────────────────────────────┐
│                    Cross-LLM Review Flow                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Claude (Phase 1)                                          │
│      │                                                      │
│      ├──► Generates review prompt for Gemini                │
│      │       └──► Gemini reviews assistant/validator JS     │
│      │                                                      │
│      └──► Generates review prompt for Perplexity.ai         │
│              └──► Perplexity reviews with web research      │
│                                                             │
│   All three LLMs compared for consistency                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Why Cross-LLM Works Better

| Aspect | Same-LLM | Cross-LLM |
| ------ | -------- | --------- |
| Independence | Simulated via persona | Genuine (different training) |
| Blind spots | Shared | Complementary |
| Hallucination detection | Limited | Strong (models catch each other) |
| Setup complexity | Low | Medium |

### Derived Skills (superpowers-plus)

This pattern evolved into Claude skills:

| Skill | Purpose | Status |
| ----- | ------- | ------ |
| [think-twice](https://github.com/bordenet/superpowers-plus/blob/main/skills/think-twice/skill.md) | Break through blockers by consulting a fresh sub-agent | Production |
| [perplexity-research](https://github.com/bordenet/superpowers-plus/blob/main/skills/perplexity-research/skill.md) | Get second opinion via Perplexity.ai API (cross-LLM verification) | Production |
| [experimental-self-prompting](https://github.com/bordenet/superpowers-plus/blob/main/skills/experimental/experimental-self-prompting/SKILL.md) | Write comprehensive prompts, answer yourself (validated in 20-round experiment) | Experimental |

**Key finding from experiments**: Reframing prompts helps Claude (+10% verified hits), but *hurts* external models (+400% hallucination rate). Use cross-LLM for independent verification, not reframed prompts. The `perplexity-research` skill implements this cross-LLM pattern via Perplexity.ai's API.

---

## Same-LLM Adversarial Testing

When you're stuck with a single LLM (corporate environments, LibreChat, Azure OpenAI), simulate adversarial tension via Gemini personality injection.

> **Note**: The original JavaScript implementation was retired. The concepts below describe the pattern; for working implementations, see the [superpowers-plus skills](#derived-skills-superpowers-plus) section above.

## Problem Statement

**The Challenge**: Corporate environments deploy single LLM endpoints (LibreChat, ChatGPT Enterprise, Azure OpenAI). When the 3-phase workflow uses the same LLM for Phase 1 (initial draft) and Phase 2 (adversarial review), adversarial tension is lost.

**The Impact**: Phase 2 becomes "review and improve" instead of "challenge and reconstruct", reducing output quality.

**The Solution**: Detect same-LLM scenarios and augment Phase 2 prompts with Gemini personality simulation.

## Architecture

### Core Components

| Class | Purpose |
| ----- | ------- |
| `SameLLMAdversarialSystem` | Main orchestration - executes 3-phase workflow with automatic detection |
| `ConfigurationManager` | Detects same-LLM via provider/model, URL, or endpoint matching |
| `AdversarialPromptAugmenter` | Modifies prompts - detects forget clauses, applies Gemini simulation |
| `AdversarialQualityValidator` | Measures effectiveness via semantic difference and adversarial language |

### Helper Functions (Legacy API)

| Function | Purpose |
| -------- | ------- |
| `detectSameLLM(model1, model2)` | Simple model name comparison |
| `getAdversarialStrategy(model)` | Returns strategy string for model type |
| `applyAdversarialPrompt(prompt, model)` | Augments prompt with adversarial mode tag |

## Detection Methods

### 1. Provider/Model Match (Highest Priority)
```javascript
phase1.provider === 'anthropic' && phase1.model === 'claude-3-sonnet'
phase2.provider === 'anthropic' && phase2.model === 'claude-3-sonnet'
// Result: Same LLM detected via provider_model_match
```

### 2. URL Match (LibreChat Scenario)
```javascript
phase1.url === 'https://librechat.company.com/api/chat'
phase2.url === 'https://librechat.company.com/api/chat'
// Result: Same LLM detected via url_match (deploymentType: librechat)
```

### 3. Endpoint Match (Localhost/Corporate)
```javascript
phase1.endpoint === 'http://localhost:3000/api'
phase2.endpoint === 'http://localhost:3000/api'
// Result: Same LLM detected via endpoint_match (deploymentType: local_deployment)
```

### Deployment Types

| Type | Trigger | Example |
| ---- | ------- | ------- |
| `librechat` | URL/endpoint contains "librechat" | `https://librechat.company.com/api` |
| `local_deployment` | URL/endpoint contains "localhost" | `http://localhost:3000/api` |
| `corporate_single_endpoint` | Same URL for both phases | Corporate AI gateway |
| `same_provider` | Same provider, different models | anthropic/claude-3-sonnet vs anthropic/claude-3-opus |
| `multi_provider` | Different providers | anthropic vs google (no augmentation needed) |

### Corporate Deployment Detection

The system recognizes these corporate patterns:

- `librechat` - LibreChat deployments
- `chatgpt-enterprise` - ChatGPT Enterprise
- `azure-openai` - Azure OpenAI Service
- `aws-bedrock` - AWS Bedrock
- `google-vertex` - Google Vertex AI
- `internal-llm` - Internal LLM endpoints
- `corporate-ai` - Generic corporate AI endpoints

## Gemini Personality Simulation

### Behavioral Profile

- Highly analytical and precision-focused
- Constructively adversarial and skeptical by design
- Evidence-demanding and assumption-challenging
- Systematic in identifying logical gaps and inconsistencies
- Professional but relentlessly thorough in critique

### Key Characteristics

1. **Skeptical Precision**: Approach every claim with professional skepticism
2. **Evidence Demands**: Question assertions lacking substantiating evidence
3. **Assumption Challenges**: Identify and probe hidden assumptions
4. **Logic Gaps**: Systematically identify incomplete arguments
5. **Clarity Demands**: Highlight vagueness and ambiguity

## Prompt Augmentation Strategy

### Forget Clause Detection
The system detects these patterns:
- `/forget\s+all\s+previous/i`
- `/ignore\s+previous/i`
- `/start\s+fresh/i`
- `/new\s+session/i`
- `/clear\s+context/i`

### Augmentation Logic
```javascript
if (containsForgetClause(originalPrompt)) {
    // REPLACE entire prompt (don't prepend)
    return createReplacementGeminiPrompt();
} else {
    // PREPEND Gemini personality
    return geminiPersonality + "\n\n" + originalPrompt;
}
```

### Why This Matters
**Critical Discovery**: Phase 2 prompts often contain "Forget all previous sessions" clauses. If we prepend Gemini simulation, the forget clause nullifies it. Solution: Replace the entire prompt when forget clause detected.

## Quality Validation

### Effectiveness Criteria

An adversarial review is considered effective when:

| Metric | Threshold | Description |
| ------ | --------- | ----------- |
| Semantic Difference | ≥ 0.3 | Phase 2 output differs significantly from Phase 1 |
| Adversarial Language | ≥ 3 | Contains at least 3 adversarial phrases |
| Challenge Count | ≥ 2 | Includes at least 2 direct challenges |

### Adversarial Language Patterns

```text
however, but, challenge, question, assumption
evidence, unclear, vague, inconsistent, gap
overlooks, fails to consider, lacks, insufficient
problematic, concerning, requires clarification
```

### Challenge Patterns

```text
"Why does/is/are/would..."
"What evidence..."
"How can we be sure..."
"This assumes..."
"Lacks detail/evidence/clarity..."
```

## Usage in Genesis Projects

### Automatic Integration

The same-LLM adversarial pattern has evolved into the [superpowers-plus](https://github.com/bordenet/superpowers-plus) skills:

| Skill | Purpose |
| ----- | ------- |
| [think-twice](https://github.com/bordenet/superpowers-plus/blob/main/skills/think-twice/skill.md) | Break through blockers via sub-agent consultation |
| [perplexity-research](https://github.com/bordenet/superpowers-plus/blob/main/skills/perplexity-research/skill.md) | Cross-LLM verification via Perplexity.ai API |
| [experimental-self-prompting](https://github.com/bordenet/superpowers-plus/blob/main/skills/experimental/experimental-self-prompting/SKILL.md) | Write prompts, answer yourself (experimental) |

The original JavaScript implementation was retired in favor of these more flexible skill-based approaches.

### Environment Variables
```bash
# Phase 1 Configuration
PHASE1_PROVIDER=anthropic
PHASE1_MODEL=claude-3-sonnet
PHASE1_URL=https://api.anthropic.com
PHASE1_ENDPOINT=https://api.anthropic.com/v1/messages

# Phase 2 Configuration
PHASE2_PROVIDER=anthropic
PHASE2_MODEL=claude-3-sonnet
PHASE2_URL=https://api.anthropic.com
PHASE2_ENDPOINT=https://api.anthropic.com/v1/messages
```

### Corporate Deployment Example (LibreChat)
```bash
# Both phases use the same LibreChat endpoint
PHASE1_URL=https://librechat.company.com/api/chat
PHASE2_URL=https://librechat.company.com/api/chat

# System automatically detects same-LLM scenario
# Applies Gemini personality simulation to Phase 2
```

## Testing

### Test Coverage

The test suite includes **41 tests** across **8 categories**:

| Category | Tests | What It Covers |
| -------- | ----- | -------------- |
| Configuration Detection | 5 | Provider/model match, URL match, endpoint match, different LLMs, priority |
| Forget Clause Detection | 3 | Pattern detection, multiple patterns, false positive prevention |
| Prompt Augmentation Strategy | 2 | Replacement vs prepending strategies |
| Integration Tests | 3 | LibreChat end-to-end, multi-provider, actual Phase 2 prompts |
| Quality Validation | 6 | Semantic difference, adversarial language, challenges |
| SameLLMAdversarialSystem | 9 | Full system integration, phase execution |
| Legacy Helper Functions | 8 | Backward compatibility functions |
| Corporate Deployment Detection | 5 | LibreChat, Azure, AWS Bedrock patterns |

### Running Tests

```bash
# From any genesis project
npm test -- same-llm-adversarial.test.js
```

## Best Practices

1. **Configure environment variables** for Phase 1 and Phase 2
2. **Test with actual corporate endpoints** before deployment
3. **Monitor quality metrics** to ensure adversarial effectiveness
4. **Review Phase 2 outputs** to verify Gemini simulation is working
5. **Update prompts carefully** to avoid breaking forget clause detection

## Related

| Resource | Description |
| -------- | ----------- |
| [START-HERE.md][start] | Genesis setup instructions |
| [CHECKLIST.md][checklist] | Consolidated execution checklist |
| [BACKGROUND.md][bg] | Genesis ecosystem history and metrics |
| [CODE-CONSISTENCY-MANDATE.md][ccm] | File categorization and consistency rules |
| [one-pager][op] | Reference implementation (41/41 tests passing) |
| **Derived Skills** | |
| [think-twice][tt] | Break through blockers via sub-agent consultation |
| [perplexity-research][pr] | Cross-LLM verification via Perplexity.ai API |
| [experimental-self-prompting][esp] | Write prompts, answer yourself (experimental) |
| [Skill comparison][cmp] | When to use each adversarial skill |

[start]: https://github.com/bordenet/genesis/blob/main/genesis/START-HERE.md
[checklist]: https://github.com/bordenet/genesis/blob/main/genesis/CHECKLIST.md
[bg]: https://github.com/bordenet/genesis/blob/main/BACKGROUND.md
[ccm]: https://github.com/bordenet/genesis/blob/main/genesis/CODE-CONSISTENCY-MANDATE.md
[op]: https://github.com/bordenet/one-pager
[tt]: https://github.com/bordenet/superpowers-plus/blob/main/skills/think-twice/skill.md
[pr]: https://github.com/bordenet/superpowers-plus/blob/main/skills/perplexity-research/skill.md
[esp]: https://github.com/bordenet/superpowers-plus/blob/main/skills/experimental/experimental-self-prompting/SKILL.md
[cmp]: https://github.com/bordenet/superpowers-plus/blob/main/docs/SKILL_COMPARISON_self-prompting_vs_think-twice.md
