# Genesis README: Reference Implementations

> Part of [Genesis README](../README.md)

---

## 📚 Reference Implementations (CRITICAL)

Genesis is based on **TWO known-good reference implementations**. When implementing a new project, **ALWAYS reference these first**.

### Primary References

1. **[product-requirements-assistant](https://github.com/bordenet/product-requirements-assistant)** ⭐ **PRIMARY REFERENCE**
   - **Live Demo**: https://bordenet.github.io/product-requirements-assistant/
   - **What it demonstrates**: 3-phase PRD generator with mock/manual modes
   - **Key patterns**: Dark mode toggle, workflow architecture, form-to-prompt, deployment scripts
   - **Study BEFORE implementing**: See [`REFERENCE-IMPLEMENTATIONS.md`](../REFERENCE-IMPLEMENTATIONS.md)

2. **[one-pager](https://github.com/bordenet/one-pager)** ⭐ **SECONDARY REFERENCE**
   - **Live Demo**: https://bordenet.github.io/one-pager/
   - **What it demonstrates**: 3-phase one-pager generator (same pattern, different document type)
   - **Key patterns**: Related projects dropdown, privacy notice, UI patterns

---

## When to Reference

**✅ ALWAYS reference these implementations when:**
- Implementing dark mode toggle (CRITICAL - always broken without Tailwind config)
- Setting up workflow phases (mock vs manual modes)
- Creating form-to-prompt patterns
- Writing deployment scripts (compact mode, quality gates)
- Writing setup scripts (fast, resumable, smart caching)
- Adding UI patterns (dropdowns, modals, notifications)
- Structuring prompts and templates
- Testing async functionality

---

## Reverse-Integration Notes

**📝 ALWAYS create a reverse-integration note when:**
- You reference the implementations to solve a problem
- You discover a pattern that should be in Genesis templates
- You fix a bug that Genesis should prevent
- You implement a feature that future projects will need

**Format for reverse-integration notes:**
```markdown
## REVERSE-INTEGRATION NOTE

**Date**: YYYY-MM-DD
**Project**: [project-name]
**Issue**: [What problem did you encounter?]
**Solution**: [How did you solve it by referencing the implementations?]
**Genesis Gap**: [What's missing from Genesis that caused this?]
**Recommendation**: [What should be added/updated in Genesis?]
**Files to Update**: [List Genesis files that need changes]
**Priority**: [CRITICAL / HIGH / MEDIUM / LOW]
```

**Where to save notes**: Create `REVERSE-INTEGRATION-NOTES.md` in your project root.

---

## Why This Matters

**Genesis is a living system.** Every project built from Genesis teaches us:
- What patterns work well (keep in Genesis)
- What's missing (add to Genesis)
- What's broken (fix in Genesis)
- What's confusing (document better in Genesis)

**The cycle**:
1. Build project from Genesis
2. Reference implementations when stuck
3. Document what you learned
4. Reverse-integrate improvements back to Genesis
5. Next project is easier

**This ensures Genesis gets better with every project, not worse.**

