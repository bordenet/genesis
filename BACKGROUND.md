# Genesis: Background

## The Experiment

Genesis started in November 2025 as an experiment: how deterministic could I make AI-assisted development?

The first project, [`product-requirements-assistant`](https://github.com/bordenet/product-requirements-assistant), began in July 2025 as a straightforward PRD authoring tool. By November, I had [`one-pager`](https://github.com/bordenet/one-pager) running on the same patterns. When I started the third clone ([`architecture-decision-record`](https://github.com/bordenet/architecture-decision-record)), it was hard not to notice the mutations—even when the AI had multiple identical samples to copy. Largely the same structure, but different dependency libraries and tools. Different file paths. Different file names. Absolutely different bugs. Very little benefit to starting with a template because the AI just couldn't help but veer off course.

So I formalized the patterns into Genesis.

## What I Built

Over 1,600+ commits across 10 repositories, I layered on increasingly elaborate guardrails:

**[Spec-driven development](https://bordenet.github.io/product-requirements-assistant/).** Every project starts from the same [template](https://github.com/bordenet/genesis/tree/main/genesis/examples/hello-world) with strict file structure, naming conventions, and architecture patterns.

**Self-generated frameworks.** Genesis includes [templates](https://github.com/bordenet/genesis/tree/main/genesis/examples/hello-world) for [CI/CD](https://github.com/bordenet/genesis/blob/main/genesis/examples/hello-world/.github/workflows/ci.yml), [testing](https://github.com/bordenet/genesis/tree/main/genesis/examples/hello-world/assistant/tests), [deployment scripts](https://github.com/bordenet/genesis/tree/main/genesis/scripts), and documentation. The AI generates projects that conform to these templates.

**[TDD](https://github.com/obra/superpowers) with [custom validators](https://github.com/bordenet/genesis/tree/main/project-diff).** Each project has a paired [Validator](https://bordenet.github.io/one-pager/validator/) that scores documents against quality dimensions. The consistency tooling went through three evolutions: first an entropy-based scanner that computed similarity scores, then a modular system with "inside-out" and "outside-in" analyzers. Both gave false confidence—high similarity scores while files quietly diverged. When I asked the AI how it missed obvious gaps, it explained I'd built tools that looked at patterns rather than bytes. The current [`project-diff`](https://github.com/bordenet/genesis/blob/main/project-diff/diff-projects.js) tool does byte-for-byte comparison across all repositories, and immediately found 51 divergent files the previous tools had missed.

**Self-reinforcing AI instructions.** A [`CONTINUOUS_IMPROVEMENT.md`](https://github.com/bordenet/genesis/blob/main/CONTINUOUS_IMPROVEMENT.md) file tracks gaps discovered during development. These feed back into the [AI instructions](https://github.com/bordenet/genesis/tree/main/genesis/ai-instructions), creating a loop where each bug fix improves future generations.

**[Same-LLM adversarial testing](https://github.com/bordenet/genesis/blob/main/genesis/SAME-LLM-ADVERSARIAL-GUIDE.md).** The same AI that generates content also critiques it, catching issues before they reach production. See the [implementation](https://github.com/bordenet/genesis/blob/main/genesis/examples/hello-world/assistant/js/same-llm-adversarial.js).

## Commits to Stability

The commit counts tell the story of diminishing returns on the conformity investment:

| Project | First 30 Days | Total | Stability Ratio |
|---------|---------------|-------|-----------------|
| [product-requirements-assistant](https://github.com/bordenet/product-requirements-assistant) | 7 | 340 | 2% |
| [genesis](https://github.com/bordenet/genesis) | 134 | 301 | 45% |
| [one-pager](https://github.com/bordenet/one-pager) | 81 | 250 | 32% |
| [architecture-decision-record](https://github.com/bordenet/architecture-decision-record) | 93 | 232 | 40% |
| [power-statement-assistant](https://github.com/bordenet/power-statement-assistant) | 34 | 158 | 22% |
| [strategic-proposal](https://github.com/bordenet/strategic-proposal) | 16 | 118 | 14% |
| [pr-faq-assistant](https://github.com/bordenet/pr-faq-assistant) | 144 | 162 | 89% |
| [jd-assistant](https://github.com/bordenet/jd-assistant) | 57 | 57 | 100% |
| [acceptance-criteria-assistant](https://github.com/bordenet/acceptance-criteria-assistant) | 22 | 22 | 100% |
| [business-justification-assistant](https://github.com/bordenet/business-justification-assistant) | 8 | 8 | 100% |

**Stability Ratio** = commits in first 30 days / total commits. Higher means the project stabilized faster.

```
Commits to Stability (First 30 Days)

  150 |                                    ■ pr-faq
      |
  125 |  ■ genesis
      |
  100 |           ■ adr
      |  ■ one-pager
   75 |
      |                                              ■ jd
   50 |
      |              ■ power
   25 |                                                   ■ ac
      |                    ■ strategic
    0 |■ prd                                                   ■ bj
      +------------------------------------------------------------→
       Jul    Nov    Nov    Dec    Dec    Dec    Jan    Feb    Feb
       2025   2025   2025   2025   2025   2025   2026   2026   2026

  ■ = commits in first 30 days
  prd = product-requirements-assistant (pre-Genesis baseline)
  bj = business-justification-assistant (8 commits total)
```

The trend is clear: later projects required fewer commits to reach stability. But the outliers (pr-faq at 144 commits) show that the system wasn't foolproof.

## Hot Spots: Struggle vs. Productivity

Git history reveals distinct periods of struggle (regressions, hotfixes) versus productivity (features, quick wins).

### Phase 1: Pre-Genesis Exploration (Jul-Nov 2025)

**Nov 19, 2025** was the turning point: 55 commits in one day on [`product-requirements-assistant`](https://github.com/bordenet/product-requirements-assistant). Went from a simple web app to [mock AI](https://github.com/bordenet/genesis/blob/main/genesis/examples/hello-world/assistant/js/ai-mock.js), thick clients, and release automation. This was the "it works well enough to build on" moment.

### Phase 2: Genesis Birth (Nov 20-22, 2025)

134 commits in 4 days extracting patterns into a framework. Key milestone: `feat: Achieve 98% parity with one-pager and product-requirements-assistant`. This was **productive struggle** - building the conformity machinery.

### Phase 3: First Spawns - The Struggle Period (Dec 2025)

**Dec 1, 2025: [`architecture-decision-record`](https://github.com/bordenet/architecture-decision-record)** - 51 commits in ONE DAY, 19 of them fixes:
- `fix: add esbuild bundler to make app runnable in browsers`
- `fix: redesign Phase 1 UI to match one-pager workflow pattern`
- `fix: Complete Phase 2/3 UI and workflow overhaul`
- `fix: remove broken E2E test that was blocking deployment`

The [Genesis template](https://github.com/bordenet/genesis/tree/main/genesis/examples/hello-world) wasn't ready. I was debugging the framework while building the app.

### Phase 4: Validator Innovation (Jan-Feb 2026)

**Jan 9-11, 2026**: 214 commits across projects - standardization, [JSDoc](https://github.com/bordenet/genesis/blob/main/genesis/examples/hello-world/assistant/js/core/workflow-engine.js), [adversarial testing](https://github.com/bordenet/genesis/blob/main/genesis/SAME-LLM-ADVERSARIAL-GUIDE.md). This was **innovation built on stability**. The tools worked well enough to add features instead of fixing bugs.

**Feb 2, 2026**: Paired architecture emerges. `refactor: Restructure to paired assistant/validator model`. [Validators](https://bordenet.github.io/one-pager/validator/) became first-class citizens because the assistants had stabilized.

### Phase 5: The Great Unification (Feb 3-5, 2026)

543 commits in 3 days - but **productive, not struggling**:
- Feb 3: [Unified diff tool](https://github.com/bordenet/genesis/blob/main/project-diff/diff-projects.js) finds 51 divergent files old tools missed
- Feb 4: Backporting, [`jd-assistant`](https://github.com/bordenet/jd-assistant) spawns in one day
- Feb 5: [Slop detection](https://github.com/bordenet/genesis/blob/main/genesis/examples/hello-world/assistant/js/slop-detection.js), `Genesis reaches 100/100 confidence 🎉`

### Phase 6: Quick Wins (Feb 5-6, 2026)

- [`acceptance-criteria-assistant`](https://github.com/bordenet/acceptance-criteria-assistant): 22 commits total
- [`business-justification-assistant`](https://github.com/bordenet/business-justification-assistant): 8 commits total

These spawned in hours, not days. The framework finally worked.

### The Pattern

**Stability → Confidence → Innovation → New Features → New Bugs → Stability**

The [validators](https://bordenet.github.io/product-requirements-assistant/validator/) emerged because the assistants stabilized. You can't build on a shaky foundation.

## What Worked

The tools work. Each [Assistant](https://bordenet.github.io/one-pager/) guides users through a 3-phase workflow. Each [Validator](https://bordenet.github.io/one-pager/validator/) scores documents against defined dimensions. The [`project-diff`](https://github.com/bordenet/genesis/blob/main/project-diff/diff-projects.js) tool catches divergence. [CI/CD](https://github.com/bordenet/genesis/blob/main/genesis/examples/hello-world/.github/workflows/ci.yml) runs automatically. Test coverage is 72% JS, 93% Go.

Consistency improved over time. By the ninth project, I could spawn a new repository and have it running in under an hour.

[**CONTINUOUS_IMPROVEMENT.md**](https://github.com/bordenet/genesis/blob/main/CONTINUOUS_IMPROVEMENT.md) was the game-changer. Every bug discovered during development gets logged with severity, root cause, and fix. These feed back into the [AI instructions](https://github.com/bordenet/genesis/tree/main/genesis/ai-instructions), preventing the same mistake twice.

## What Failed

### Early Comparison Tools (3 Attempts)

Before the current [`project-diff`](https://github.com/bordenet/genesis/tree/main/project-diff) tool, I tried three different approaches:

1. **genesis-parity-check.sh** - Pattern-based shell script that checked for specific strings. Gave false confidence with "95% similar" scores while files had diverged in ways the patterns didn't catch.

2. **consistency-checker/** - A similarity scoring system that compared files using fuzzy matching. The problem: 90% similar isn't identical. Small differences compound.

3. **alignment-tools/** - Specialized scanners for specific file types. Too narrow; missed cross-cutting issues.

In February 2026, I replaced all three with a unified [`diff-projects.js`](https://github.com/bordenet/genesis/blob/main/project-diff/diff-projects.js) that does byte-for-byte MD5 comparison. The new tool immediately found 51 divergent files the old tools had missed. The [archived comparison tools](https://github.com/bordenet/genesis/tree/main/_archive/comparison-tools-2026-02-04) remain for reference.

### Evolutionary Prompt Optimization (Abandoned)

I built an entire module for automated prompt tuning: run 20-40 rounds of mutations, score outputs, keep improvements. The system worked (+31% quality improvement in testing) but the overhead wasn't worth it. The prompts were already good enough. The module still exists in [`genesis/modules/evolutionary-optimization/`](https://github.com/bordenet/genesis/tree/main/genesis/modules/evolutionary-optimization) but no project uses it.

See the dedicated section below for the full story of this experiment.

### Long Markdown Files (1,000+ Lines)

The original AI instruction files were massive:
- [`00-GENESIS-PLAN.md`](https://github.com/bordenet/genesis/blob/main/genesis/00-GENESIS-PLAN.md): 1,018 lines
- [`01-AI-INSTRUCTIONS.md`](https://github.com/bordenet/genesis/blob/main/genesis/01-AI-INSTRUCTIONS.md): 936 lines
- [`TROUBLESHOOTING.md`](https://github.com/bordenet/genesis/blob/main/genesis/TROUBLESHOOTING.md): 776 lines
- `GENESIS-PROCESS-IMPROVEMENTS.md`: 1,023 lines
- [`CONTINUOUS_IMPROVEMENT.md`](https://github.com/bordenet/genesis/blob/main/CONTINUOUS_IMPROVEMENT.md): 668 lines

LLMs lose attention in long documents. Critical instructions buried on line 800 get ignored. I had to split these into [modular files](https://github.com/bordenet/genesis/tree/main/genesis/troubleshooting) and compress the originals:
- `00-GENESIS-PLAN.md`: 1,018 → 38 lines (archived original)
- `TROUBLESHOOTING.md`: 776 → 73 lines ([split into 5 files](https://github.com/bordenet/genesis/tree/main/genesis/troubleshooting))
- `GENESIS-PROCESS-IMPROVEMENTS.md`: 1,023 → 76 lines
- `CONTINUOUS_IMPROVEMENT.md`: 668 → 117 lines (history moved to `docs/IMPROVEMENT-HISTORY.md`)

### Dead Code from LLM Prompt Tuning

The LLM generated files that were never actually used:
- [`ai-mock-ui.js`](https://github.com/bordenet/genesis/blob/main/genesis/examples/hello-world/assistant/js/ai-mock.js) - only tests imported it
- `keyboard-shortcuts.js` - only one project ([ADR](https://github.com/bordenet/architecture-decision-record)) uses it
- `phase2-review.js` - dead code
- `phase3-synthesis.js` - dead code

These accumulated during iterative development. I purged 1,109 lines of dead code in February 2026.

### Template Placeholders Not Replaced

The most embarrassing failure: [`business-justification-assistant`](https://github.com/bordenet/business-justification-assistant) shipped with template placeholders still in the code. The validator showed "One-Pager Validator" because nobody replaced `{{PROJECT_TITLE}}`. The IndexedDB used `one-pager-validator-history`, causing data collisions with the actual [one-pager](https://github.com/bordenet/one-pager) tool.

This led to mandatory verification scans in the [checklist](https://github.com/bordenet/genesis/blob/main/genesis/CHECKLIST.md).

## What Didn't Scale

The maintenance burden compounds. Every improvement to Genesis requires propagation to 9 derived projects. The [`project-diff`](https://github.com/bordenet/genesis/blob/main/project-diff/diff-projects.js) tool helps, but it can't catch semantic drift. When I fixed a bug in [`business-justification-assistant`](https://github.com/bordenet/business-justification-assistant) in February 2026, I discovered the [AI instructions](https://github.com/bordenet/genesis/tree/main/genesis/ai-instructions) had a fundamental gap that had been there since the beginning.

The conformity mechanisms themselves became a source of bugs. The [`validator-inline.js`](https://github.com/bordenet/genesis/blob/main/genesis/examples/hello-world/assistant/js/validator-inline.js) file was incorrectly categorized as a shared library when it actually needs project-specific customization. This caused score discrepancies between the [Assistant](https://bordenet.github.io/business-justification-assistant/) and [Validator](https://bordenet.github.io/business-justification-assistant/validator/) that took hours to diagnose.

## Workspace Strategy That Helped

When working across multiple repos, I had better success using **dedicated project workspace directories** with all repo clones as peer directories on disk. This let Claude Code see and edit files across repos in a single session.

```
~/GitHub/Personal/genesis-tools/
├── genesis/                    # Framework
├── one-pager/                  # Derived project
├── product-requirements-assistant/
├── architecture-decision-record/
└── ...                         # All 10 repos as siblings
```

Opening the parent directory (`genesis-tools/`) as the workspace meant:
- The diff tool could compare all projects in one run
- Fixes could be propagated immediately without switching contexts
- The AI could see patterns across repos and suggest consistent changes

Single-repo workspaces made cross-repo consistency nearly impossible. The AI couldn't see what it was supposed to match.

## LLM Prompt Tuning Experiments

The most ambitious experiment was automated prompt optimization. This deserves its own section because it taught me more about LLM behavior than any other work.

### The Python Tooling (Nov 21, 2025)

On November 21, 2025, I committed 2,488 lines of Python across 7 modules in [`one-pager`](https://github.com/bordenet/one-pager):

```
scripts/evolutionary_tuner.py   (458 lines) - Mutation-based optimization engine
scripts/llm_client.py           (525 lines) - Universal client for Claude/Gemini/GPT
scripts/prompt_simulator.py     (245 lines) - Test case execution
scripts/prompt_tuning_cli.py    (329 lines) - Rich CLI interface
scripts/prompt_tuning_config.py (171 lines) - Configuration management
scripts/quality_evaluator.py    (451 lines) - 5-point scoring system
scripts/release.py              (211 lines) - Release automation
```

The system worked:
- **Baseline:** 3.12/5.0
- **After 20 rounds:** 4.09/5.0 (+31.1% improvement)
- **After 40 rounds:** 4.18/5.0 (+33.9% improvement)

### The 12-Round Insight

The data showed **diminishing returns after round 11-12**. The first 12 iterations delivered 70-80% of total improvement. Rounds 13-40 added marginal gains at significant time cost.

This matched intuition: the "obvious" improvements (ban vague language, require quantified metrics, strengthen [adversarial tension](https://github.com/bordenet/genesis/blob/main/genesis/SAME-LLM-ADVERSARIAL-GUIDE.md)) happen early. Later rounds find increasingly obscure optimizations.

**Top 5 mutations (71-73% of total improvement):**
1. Ban vague language ("improve", "enhance", "better") → +6.0% (see [slop detection](https://github.com/bordenet/genesis/blob/main/genesis/examples/hello-world/assistant/js/slop-detection.js))
2. Strengthen "no implementation" rule → +5.4%
3. Enhance adversarial tension in Phase 2 → +2.9%
4. Require stakeholder impact quantification → +2.6%
5. Require baseline + target + timeline metrics → +2.5%

### Why It Was Abandoned

The tooling worked but the overhead wasn't worth it:

1. **Setup cost:** Each project needed custom test cases, scoring criteria, and configuration
2. **Execution time:** 30-60 minutes per 20-round simulation
3. **Diminishing returns:** Prompts were already "good enough" after manual iteration
4. **Maintenance burden:** Python dependencies, API keys, rate limits

The module still exists in [`genesis/modules/evolutionary-optimization/`](https://github.com/bordenet/genesis/tree/main/genesis/modules/evolutionary-optimization) but no derived project uses it.

### The Better Approach: Outbound Prompts

What worked better was **generating outbound prompts for other models**. Instead of tuning prompts internally, I learned to:

1. **Generate research prompts for [Perplexity.ai](https://www.perplexity.ai/)** - Ask Perplexity for domain-specific research, then feed the results back to Claude for synthesis (see my [perplexity-research skill](https://github.com/bordenet/superpowers-plus/blob/main/skills/perplexity-research/SKILL.md))
2. **Use the [same-LLM adversarial pattern](https://github.com/bordenet/genesis/blob/main/genesis/SAME-LLM-ADVERSARIAL-GUIDE.md)** - When Phase 1 and Phase 2 use the same model, inject a "Gemini personality simulation" via [`same-llm-adversarial.js`](https://github.com/bordenet/genesis/blob/main/genesis/examples/hello-world/assistant/js/same-llm-adversarial.js) to maintain adversarial tension
3. **Manual iteration with feedback** - 10-12 rounds of human-in-the-loop refinement often beat 40 rounds of automated optimization

The key insight: **LLMs are better at generating prompts for other LLMs than at optimizing their own prompts**. A prompt that asks Perplexity "What are the common failure modes of [business justification](https://bordenet.github.io/business-justification-assistant/) documents?" produces more actionable insights than 40 rounds of mutation-based optimization.

### Git History Timeline

```
Nov 21, 2025 - 43 commits in one-pager alone
├── 7c9d508 feat: Complete AI Agent Prompt Tuning Automation Tool
├── d16e239 feat: Upgrade to Rigorous Evolutionary Prompt Tuning Methodology
├── 6c1bf8b feat: Focused Genesis Same-LLM Implementation Prompt
├── 47ebbdc feat: Enhanced Same-LLM Detection with URL/Endpoint Support
└── 72dd9ab feat: Complete Utility Scripts Suite - Final

Nov 22, 2025 - Archiving begins
├── 6bf1847 chore: move historical prompt tuning and integration docs to archive/

Feb 4, 2026 - Python tooling removed
├── 582f76d chore: remove Python tooling (HELLO_WORLD_ONLY)
└── 2,488 lines deleted - the experiment was over
```

The Python tooling lived for 75 days before being purged. The learnings (top 5 mutations, 12-round insight, outbound prompt pattern) were incorporated into the prompts themselves.

## The Validator Innovation Story

The [validators](https://bordenet.github.io/one-pager/validator/) represent the most successful innovation in the Genesis ecosystem. They emerged because the assistants had stabilized enough to build on.

### The Problem: Assistants Couldn't Score Themselves

Each [Assistant](https://bordenet.github.io/one-pager/) guides users through a 3-phase workflow:
1. **Phase 1:** User fills form → generates prompt → pastes to Claude → saves response
2. **Phase 2:** [Adversarial review](https://github.com/bordenet/genesis/blob/main/genesis/SAME-LLM-ADVERSARIAL-GUIDE.md) → Gemini critiques Claude's output
3. **Phase 3:** Synthesis → Claude incorporates feedback into final document

But there was no way to know if the output was *good*. Users would complete all three phases and have no idea if their [PRD](https://bordenet.github.io/product-requirements-assistant/) or [One-Pager](https://bordenet.github.io/one-pager/) met quality standards.

### First Attempt: Go-Based Validator (Nov 2025)

The first validator was written in [Go](https://github.com/bordenet/genesis/tree/main/genesis-validator):

```
Nov 21, 2025
├── eb13d4d Add Genesis Validator - Go-based quality gate tool
```

This was a CLI tool that scored documents against predefined criteria. It worked, but:
- Required Go installation
- Couldn't run in the browser
- Separate from the Assistant workflow

### The Paired Architecture Emerges (Feb 2, 2026)

On February 2, 2026, the breakthrough came:

```
Feb 2, 2026
├── refactor: Restructure to paired assistant/validator model
├── feat: add PRD Validator link to completion banner
├── feat: auto-rename project from phase 3 document title
```

Each project now has **two web apps**:
- [`assistant/`](https://github.com/bordenet/genesis/tree/main/genesis/examples/hello-world/assistant) - The guided creation workflow
- [`validator/`](https://github.com/bordenet/genesis/tree/main/genesis/examples/hello-world/validator) - Standalone scoring and feedback

The validator is a separate GitHub Pages deployment. Users can:
1. Complete a document in the [Assistant](https://bordenet.github.io/product-requirements-assistant/)
2. Click "Full Validation" to open the [Validator](https://bordenet.github.io/product-requirements-assistant/validator/)
3. Paste their document and get a detailed score

### The Inline Scoring Addition (Feb 3-5, 2026)

But clicking through to a separate app was friction. So I added **inline scoring** via [`validator-inline.js`](https://github.com/bordenet/genesis/blob/main/genesis/examples/hello-world/assistant/js/validator-inline.js):

```
Feb 3, 2026
├── feat: add inline PRD quality score display after Phase 3 completion
├── feat: copy document to clipboard when clicking Validate & Score button

Feb 5, 2026
├── feat: add AI slop detection to assistant inline validator
```

Now when users complete Phase 3, they see an immediate quality score *inside* the Assistant. The full [Validator](https://bordenet.github.io/one-pager/validator/) remains available for detailed feedback.

### The validator-inline.js Bug (Feb 5-6, 2026)

This innovation created a subtle bug. The [`validator-inline.js`](https://github.com/bordenet/genesis/blob/main/genesis/examples/hello-world/assistant/js/validator-inline.js) file was categorized as a "shared library" (MUST_MATCH across all projects), but it actually needs **project-specific scoring dimensions**.

```
Feb 5, 2026
├── fix: title extraction and validator alignment
└── Score discrepancy: Assistant showed 72/100, Validator showed 85/100
```

The fix required understanding that `validator-inline.js` is a **plugin file** (INTENTIONAL_DIFF), not a core file. Each project needs its own scoring logic. See the [CODE-CONSISTENCY-MANDATE.md](https://github.com/bordenet/genesis/blob/main/genesis/CODE-CONSISTENCY-MANDATE.md) for the MUST_MATCH vs INTENTIONAL_DIFF distinction.

### What Made Validators Possible

The validators only worked because:

1. **Stable assistants** - The [3-phase workflow](https://github.com/bordenet/genesis/blob/main/genesis/examples/hello-world/assistant/js/core/workflow-engine.js) was proven and consistent
2. **Standardized output** - All projects produce markdown documents
3. **Defined quality dimensions** - Each document type has specific criteria (see [`validator.js`](https://github.com/bordenet/genesis/blob/main/genesis/examples/hello-world/validator/js/validator.js))
4. **[Slop detection](https://github.com/bordenet/genesis/blob/main/genesis/examples/hello-world/assistant/js/slop-detection.js)** - AI-generated text patterns could be flagged automatically

### Git History: The Validator Timeline

```
Nov 21, 2025 - First validator (Go-based CLI)
├── eb13d4d Add Genesis Validator - Go-based quality gate tool

Jan 5, 2026 - First UI integration
├── 50d659f Add hyperlink to pr-faq-validator on landing page

Feb 2, 2026 - Paired architecture emerges
├── Restructure to paired assistant/validator model (6 projects)
├── feat: add PRD Validator link to completion banner

Feb 3, 2026 - Inline scoring
├── feat: add inline PRD quality score display after Phase 3 completion
├── 207 commits across all projects

Feb 4, 2026 - Slop detection
├── feat(hello-world): add AI slop detection boilerplate prompts
├── feat: add AI slop detection to assistant inline validator

Feb 5-6, 2026 - Alignment fixes
├── fix: title extraction and validator alignment
├── Score discrepancy bug discovered and fixed
```

### The Pattern That Emerged

**Stability → Confidence → Innovation → New Features → New Bugs → Stability**

The validators couldn't exist until the assistants were stable. Once they were, I could build a parallel scoring system. That system introduced new bugs ([`validator-inline.js`](https://github.com/bordenet/genesis/blob/main/genesis/examples/hello-world/assistant/js/validator-inline.js) categorization), which required new fixes, which led to new stability.

This is the Genesis cycle: each layer of tooling enables the next, but also introduces new failure modes.

## The Conclusion

Keeping an AI consistent turned out to be far harder than I expected. In hindsight, the time spent building conformity mechanisms would have been better spent on upfront design—a clean architecture with shared abstractions instead of constantly fighting against the stochastic system which practically "willed" the ten repositories to continue drifting apart. But I learned a lot, and wrestling with these tools made me a better AI wrangler.

The time spent building conformity mechanisms ([`project-diff`](https://github.com/bordenet/genesis/tree/main/project-diff), template validation, [self-reinforcing instructions](https://github.com/bordenet/genesis/blob/main/CONTINUOUS_IMPROVEMENT.md), parity checks) could have gone into thoughtful design. A monorepo with shared code would have eliminated the propagation problem entirely.

## Why Not a Monorepo?

At this point, consolidation would require:

1. Merging 10 repositories with divergent histories
2. Refactoring shared code into proper modules
3. Updating all [CI/CD](https://github.com/bordenet/genesis/blob/main/genesis/examples/hello-world/.github/workflows/ci.yml), deployment, and documentation
4. Migrating [GitHub Pages](https://bordenet.github.io/one-pager/) URLs

The effort exceeds the benefit for a personal project. Enterprise deployment (monorepo, unified portal) remains an option if there's demand.

## What These Repos Illustrate

- The limits of AI conformity tooling
- How far you need to go to approach deterministic AI-assisted development
- Why simpler approaches usually win

The tools remain useful. The experiment was educational. But I wouldn't do it this way again.

---

## Quick Links

| Resource | Link |
|----------|------|
| **Live Demos** | |
| One-Pager Assistant | [▶️ Try it](https://bordenet.github.io/one-pager/) |
| PRD Assistant | [▶️ Try it](https://bordenet.github.io/product-requirements-assistant/) |
| ADR Assistant | [▶️ Try it](https://bordenet.github.io/architecture-decision-record/) |
| **Source Code** | |
| Genesis Framework | [GitHub](https://github.com/bordenet/genesis) |
| Hello-World Template | [GitHub](https://github.com/bordenet/genesis/tree/main/genesis/examples/hello-world) |
| Project Diff Tool | [GitHub](https://github.com/bordenet/genesis/tree/main/project-diff) |
| **Documentation** | |
| AI Instructions | [GitHub](https://github.com/bordenet/genesis/tree/main/genesis/ai-instructions) |
| Continuous Improvement | [GitHub](https://github.com/bordenet/genesis/blob/main/CONTINUOUS_IMPROVEMENT.md) |
| Same-LLM Adversarial Guide | [GitHub](https://github.com/bordenet/genesis/blob/main/genesis/SAME-LLM-ADVERSARIAL-GUIDE.md) |
| **Related Projects** | |
| Superpowers Plus (Skills) | [GitHub](https://github.com/bordenet/superpowers-plus) |
| obra/superpowers (TDD) | [GitHub](https://github.com/obra/superpowers) |
