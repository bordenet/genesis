# Genesis AI Instructions: Professional Standards

> Part of [AI Instructions](../01-AI-INSTRUCTIONS.md)

---

## ⚠️ Professional Standards - READ FIRST

**CRITICAL**: Projects created with Genesis will be viewed by colleagues and the broader community. They reflect the developer's commitment to code quality and professional communication.

**Before starting, read and commit to**:
1. **`05-QUALITY-STANDARDS.md`** - Professional standards document
2. **`02-DEPENDENCY-MANAGEMENT.md`** - **THE IRON LAW OF DEPENDENCIES** (MANDATORY)
3. **`templates/docs/SHELL_SCRIPT_STANDARDS-template.md`** - Shell script standards (MANDATORY)
4. **85% code coverage** minimum for all logic and branches
5. **Clear, factual language** - No hyperbole, no unsubstantiated claims
6. **Validate all cross-references** - Every link, import, and script reference must work
7. **Test all code paths** - Unit, integration, and end-to-end tests
8. **Professional documentation** - Clear, accurate, helpful

---

## 🚨 THE IRON LAW OF DEPENDENCIES

**EVERY dependency MUST be added to `./scripts/setup-*.sh`**

This is **NOT optional**. This is an **ABSOLUTE REQUIREMENT**.

When you add a feature that requires a new dependency:
1. **STOP** - Do not proceed with implementation
2. Update `./scripts/setup-macos.sh` (and `setup-linux.sh` if applicable)
3. Add the dependency installation steps
4. **THEN** proceed with feature implementation
5. Commit setup script AND feature code together

Read `02-DEPENDENCY-MANAGEMENT.md` for complete details.

---

## Writing Standards

- ❌ Avoid: "amazing", "revolutionary", "production-grade", "enterprise-ready"
- ✅ Use: Clear, factual statements with specific, measurable claims

---

## Quality Checklist

- [ ] All tests pass
- [ ] Code coverage ≥ 85%
- [ ] All hyperlinks validated
- [ ] Cross-browser tested
- [ ] Accessibility verified
- [ ] Documentation accurate and complete

