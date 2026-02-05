# Shell Script Style Guide

**Version:** 2.2 | **Last Updated:** 2025-11-29

**Canonical Source:** [bordenet/scripts/STYLE_GUIDE.md](https://github.com/bordenet/scripts/blob/main/STYLE_GUIDE.md)

> **See Also:** [Shell Script Standards](../genesis/integration/SHELL_SCRIPT_STANDARDS.md) - Genesis-specific `common.sh` library usage

---

## Quick Navigation

> **For AI Agents**: Load only the section you need to minimize context usage.

| Section | Contents |
|---------|----------|
| [Quick Reference](./shell-style-guide/quick-reference.md) | 8 rules to memorize, common mistakes, naming conventions |
| [Symlink Resolution](./shell-style-guide/symlink-resolution.md) | **CRITICAL** - Library sourcing patterns |
| [Error Handling](./shell-style-guide/error-handling.md) | set -euo pipefail, surviving strict mode |
| [UX & CLI](./shell-style-guide/ux-and-cli.md) | Documentation, logging, CLI interface contract |
| [Testing & Security](./shell-style-guide/testing-and-security.md) | Linting, platform compatibility, security |

---

## Summary

This style guide defines **universal shell scripting standards** for all bordenet projects. Goals:

- **Safe**: Defensive error handling, validated inputs
- **Readable**: Clear structure, boring naming
- **Predictable**: Consistent patterns across all scripts
- **Portable**: Platform-aware (macOS/Linux), handles BSD/GNU differences

## Key Rules

1. **400-line limit** - Refactor into `lib/` modules
2. **Zero ShellCheck warnings** - `shellcheck --severity=warning`
3. **Required flags** - All scripts implement `-h/--help` and `-v/--verbose`
4. **Error handling** - `set -euo pipefail` with proper trap cleanup

---

**Reference:** [GitLab Shell Scripting Guide](https://docs.gitlab.com/development/shell_scripting_guide/)
