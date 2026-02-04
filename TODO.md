# Genesis Backport Plan

> **Goal**: Backport all innovations from the 6 children back to hello-world baseline so new projects are complete from day one.
>
> **Current Confidence**: 35-40%
> **Target Confidence**: 95%+

---

## Execution Protocol

**After EACH wave:**
1. Run `node project-diff/diff-projects.js` to verify changes
2. Run tests in hello-world: `cd genesis/examples/hello-world && npm test`
3. Calculate progress: `(files_fixed / total_gaps) * 100`
4. Commit with message: `chore: Backport wave N - [description]`
5. Push and create PR
6. Wait for CI green, then merge
7. Update progress below before starting next wave

---

## Progress Tracker

| Wave | Description | Files | Status | PR |
|------|-------------|-------|--------|-----|
| 1 | AI instruction files | 6 | ✅ | #48 |
| 2 | DevOps config files | 5 | ✅ | #49 |
| 3 | Core module structure | 2 | ✅ | #50 |
| 4 | CI workflow alignment | 1 | ⬜ | - |
| 5 | Template additions | 8 | ⬜ | - |
| 6 | Children unification | 2 | ⬜ | - |
| 7 | Final validation | - | ⬜ | - |

**Total gaps to fix**: 23 items
**Current progress**: 6/23 (26%)

---

## Wave 1: AI Instruction Files (6 files)

**Goal**: Add all AI assistant instruction files to hello-world

### Files to add (copy from one-pager as canonical source):
- [ ] `ADOPT-PROMPT.md`
- [ ] `AGENT.md`
- [ ] `Agents.md`
- [ ] `CODEX.md`
- [ ] `COPILOT.md`
- [ ] `GEMINI.md`

### Validation:
```bash
cd genesis-tools/genesis
node project-diff/diff-projects.js 2>&1 | grep -E "ADOPT|AGENT|Agents|CODEX|COPILOT|GEMINI"
```

### Expected outcome:
- These 6 files should no longer appear in "PROJECT-SPECIFIC FILES" section
- They should either be in MUST_MATCH (if identical) or INTENTIONAL_DIFF (if project-specific)

---

## Wave 2: DevOps Configuration Files (4 files)

**Goal**: Add DevOps/CI configuration files to hello-world

### Files to add:
- [ ] `.env.example` (from templates or one-pager)
- [ ] `.github/dependabot.yml`
- [ ] `.github/copilot-instructions.md`
- [ ] `.pre-commit-config.yaml`
- [ ] `codecov.yml`

### Pre-work:
- Check if `.pre-commit-config.yaml` has 4 versions across children - pick canonical one
- Verify `codecov.yml` template exists in `templates/project-structure/codecov-template.yml`

### Validation:
```bash
cd genesis-tools/genesis
node project-diff/diff-projects.js 2>&1 | grep -E "env.example|dependabot|copilot-instructions|pre-commit|codecov"
```

---

## Wave 3: Core Module Structure (2 directories)

**Goal**: Add core module directories to hello-world

### Directories to add:
- [ ] `assistant/js/core/` - with `.gitkeep` or symlink placeholder
- [ ] `validator/js/core/` - with `.gitkeep` or symlink placeholder

### Decision needed:
- **Option A**: Add as symlinks to `../../../assistant-core/src` (like ADR, pr-faq)
- **Option B**: Add as directories with `.gitkeep` (simpler, no external dependency)
- **Option C**: Add as directories with actual core files copied

### Recommendation: Option B (directories with .gitkeep)
- Keeps hello-world self-contained
- CI workflow will handle cloning core repos for children

### Validation:
```bash
ls -la genesis/genesis/examples/hello-world/assistant/js/core/
ls -la genesis/genesis/examples/hello-world/validator/js/core/
```

---

## Wave 4: CI Workflow Alignment (1 file)

**Goal**: Update hello-world ci.yml to match children's pattern

### Current state:
- hello-world: 79 lines (no core repo cloning)
- children: 108 lines (with concurrency + core repo cloning)

### Changes needed:
- [ ] Add `concurrency` block
- [ ] Add core repo cloning steps (conditional or always)
- [ ] Ensure hello-world CI still passes (it doesn't use core repos)

### Alternative approach:
- Document this as INTENTIONAL_DIFF in project-diff tool
- hello-world is self-contained; children need external repos

### Validation:
```bash
cd genesis-tools/genesis/genesis/examples/hello-world
# Trigger CI and verify it passes
```

---

## Wave 5: Template Additions (8 files)

**Goal**: Add missing templates so new projects get these files automatically

### Templates to create in `genesis/templates/`:
- [ ] `github/dependabot.yml.template`
- [ ] `project-structure/pre-commit-config.yaml.template`
- [ ] `project-structure/ADOPT-PROMPT.md.template`
- [ ] `project-structure/AGENT.md.template`
- [ ] `project-structure/CODEX.md.template`
- [ ] `project-structure/COPILOT.md.template`
- [ ] `project-structure/GEMINI.md.template`
- [ ] `github/copilot-instructions.md.template`

### Template variable replacement:
- Use `{{PROJECT_NAME}}` for project name
- Use `{{PROJECT_TITLE}}` for display title
- Use `{{GITHUB_USER}}` for GitHub username
- Use `{{GITHUB_REPO}}` for repository name

### Validation:
```bash
find genesis/genesis/templates -name "*.template" | wc -l
# Should increase by 8
```

---

## Wave 6: Children Unification (2 items)

**Goal**: Fix divergence between children themselves

### Items to unify:
- [ ] `.pre-commit-config.yaml` - currently 4 versions, pick canonical and propagate
- [ ] `css/styles.css` comment header - all say "One-Pager Assistant", should use project name

### Process:
1. Identify canonical version of `.pre-commit-config.yaml`
2. Update all 6 children to match
3. Update hello-world to match
4. For css/styles.css, decide if comment should be project-specific or generic

### Validation:
```bash
cd genesis-tools
for project in architecture-decision-record one-pager power-statement-assistant pr-faq-assistant product-requirements-assistant strategic-proposal; do
  md5 -q "$project/.pre-commit-config.yaml"
done | sort -u | wc -l
# Should be 1
```

---

## Wave 7: Final Validation

**Goal**: Comprehensive validation and confidence reassessment

### Checklist:
- [ ] Run full project-diff: `node project-diff/diff-projects.js`
- [ ] Verify 0 DIVERGENT files in MUST_MATCH category
- [ ] Verify all expected files exist in hello-world
- [ ] Run hello-world tests: `npm test` (all pass)
- [ ] Run hello-world lint: `npm run lint` (clean)
- [ ] Create test project from genesis and verify completeness

### Final confidence assessment:
```bash
# Count remaining gaps
node project-diff/diff-projects.js --json | jq '.projectSpecific | length'
```

### Success criteria:
- 0 DIVERGENT MUST_MATCH files
- All 6 AI instruction files in hello-world
- All DevOps config files in hello-world
- Core module directories exist
- Templates exist for all standard files
- Children have unified `.pre-commit-config.yaml`

---

## Appendix: File Inventory

### Files missing from hello-world (exist in ALL 6 children):

| File | Category | Wave |
|------|----------|------|
| `.env.example` | DevOps | 2 |
| `.github/copilot-instructions.md` | DevOps | 2 |
| `.github/dependabot.yml` | DevOps | 2 |
| `.pre-commit-config.yaml` | DevOps | 2 |
| `ADOPT-PROMPT.md` | AI Instructions | 1 |
| `AGENT.md` | AI Instructions | 1 |
| `Agents.md` | AI Instructions | 1 |
| `CODEX.md` | AI Instructions | 1 |
| `COPILOT.md` | AI Instructions | 1 |
| `GEMINI.md` | AI Instructions | 1 |
| `codecov.yml` | DevOps | 2 |
| `assistant/js/core/` | Core Modules | 3 |
| `validator/js/core/` | Core Modules | 3 |

### Children divergence issues:

| File | Versions | Issue |
|------|----------|-------|
| `.pre-commit-config.yaml` | 4 | Need to unify |
| `css/styles.css` comment | 1 (wrong) | All say "One-Pager" |
| `assistant/js/core/` | 2 types | Symlink vs directory |

---

## Notes

- **Do NOT touch**: `package.json`, `package-lock.json` (project-specific by design)
- **Intentional diffs**: prompts/, templates/, README.md, index.html (contain project identity)
- **Reference child**: Use `one-pager` as canonical source unless noted otherwise

