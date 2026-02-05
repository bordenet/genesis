# Genesis AI Instructions: Ongoing Development Rules

> Part of [AI Instructions](../01-AI-INSTRUCTIONS.md)

---

## 🔄 Ongoing Development - MANDATORY RULES

**CRITICAL**: After the initial project is created, these rules apply to ALL future development.

---

## Rule 1: The Iron Law of Dependencies

**EVERY time you add a dependency, you MUST update `./scripts/setup-*.sh`**

### Workflow for Adding Dependencies

1. **User asks for a feature** (e.g., "Add PDF export")
2. **You identify dependency needed** (e.g., `jspdf` npm package)
3. **STOP - Do not implement yet**
4. **Tell user**: "This requires the jspdf package. I will add it to package.json and update scripts/setup-macos.sh."
5. **Update package file**: Add to `package.json` (or `requirements.txt`, etc.)
6. **Update setup script**: Add installation to `scripts/setup-macos.sh`
7. **Show both changes to user**
8. **THEN implement the feature**
9. **Commit package file AND setup script together**

### Example Dialogue

```
User: "Add support for exporting to PDF"

AI: "PDF export requires the jspdf library. I will:
     1. Add jspdf to package.json
     2. Update scripts/setup-macos.sh to install it
     3. Implement the PDF export feature"

AI: [Shows package.json changes]
AI: [Shows setup-macos.sh changes]
AI: "Setup script updated. New developers can run
     ./scripts/setup-macos.sh to get all dependencies."

AI: [Implements PDF export feature]
```

### What Counts as a Dependency

- ✅ npm/pip/gem packages
- ✅ System packages (Homebrew, apt, etc.)
- ✅ Command-line tools
- ✅ Database servers
- ✅ Runtime environments
- ✅ Development tools (linters, formatters)
- ✅ **ANYTHING not in the repository that the project needs**

### Verification Before Committing

- [ ] Dependency added to package file
- [ ] **`./scripts/setup-macos.sh` updated**
- [ ] **`./scripts/setup-linux.sh` updated (if project supports Linux)**
- [ ] Setup script tested
- [ ] Both files committed together

---

## Rule 2: Quality Gates Always Apply

Every commit must pass:
- [ ] ShellCheck (zero warnings)
- [ ] JavaScript syntax validation
- [ ] Shell script standards (timer, help, verbose)
- [ ] No TODO/FIXME comments
- [ ] No console.log statements
- [ ] Pre-commit hook passes
- [ ] CI/CD pipeline passes

---

## Rule 3: Test Before Committing

- [ ] Run `./scripts/validate.sh` - must pass
- [ ] Run `shellcheck scripts/*.sh scripts/lib/*.sh` - must pass
- [ ] Test the feature works
- [ ] Test setup script on clean environment (if dependencies changed)

