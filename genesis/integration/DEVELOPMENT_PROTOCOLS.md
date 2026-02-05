# Development Protocols for AI-Assisted Engineering

**Purpose**: Critical protocols for working with AI assistants (Claude Code, GitHub Copilot, Gemini, ChatGPT) to avoid token waste, prevent costly mistakes, and maintain code quality.

**These protocols evolved from painful real-world failures. Follow them rigorously.**

---

## Quick Navigation

> **For AI Agents**: Load only the section you need to minimize context usage.

| Section | Description |
|---------|-------------|
| [Git Workflow](./development-protocols/git-workflow.md) | Context-aware commands, commit standards, PR creation |
| [Build & Compilation](./development-protocols/build-compilation.md) | 5-minute escalation policy, platform-specific rules |
| [Code Quality Gates](./development-protocols/code-quality-gates.md) | Go compilation protocol, JS/TS linting, pre-push validation |
| [AI Agent Collaboration](./development-protocols/ai-agent-collaboration.md) | Reviewing other AI work, task handoffs |
| [Debugging Protocol](./development-protocols/debugging-protocol.md) | Standard workflow, production triage, localhost policy |
| [Token Conservation](./development-protocols/token-conservation.md) | Efficient file reading, batch operations |
| [Build Hygiene](./development-protocols/build-hygiene.md) | Never modify source in place, post-push cleanup |
| [Quick Reference](./development-protocols/quick-reference.md) | Reference card, customization guide, CLAUDE.md template |

---

## Key Takeaways

**Before Starting Work**:
1. Check git status/diff if another AI worked on this
2. Read project's `CLAUDE.md` file
3. Understand which environment you're in (Web vs CLI)

**During Work**:
1. Escalate build issues after 5min / 3 attempts
2. Run `go build` after linting fixes (Go projects)
3. Never modify source files in place (use build/)

**Before Creating PR**:
1. Review ALL commits from branch divergence
2. Include comprehensive summary (not just latest commit)

---

## Related Documentation

- [Project Setup Checklist](./PROJECT_SETUP_CHECKLIST.md) - New project bootstrap
- [Safety Net](./SAFETY_NET.md) - Automated quality gates
- [Code Style Standards](./CODE_STYLE_STANDARDS.md) - Cross-language guide
