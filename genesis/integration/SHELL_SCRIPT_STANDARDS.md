# Shell Script Standards & Common Library

**Purpose**: Genesis-specific conventions for using the `common.sh` library.

**Core Principle**: All genesis shell scripts should appear written by the same engineer.

> **See Also:** [Shell Script Style Guide](../../docs/SHELL_SCRIPT_STYLE_GUIDE.md) - Universal shell scripting rules

---

## Quick Navigation

> **For AI Agents**: Load only the section you need to minimize context usage.

| Section | Description |
|---------|-------------|
| [Quick Start & File Structure](./shell-scripts/quick-start.md) | Minimum viable script, header template, main body |
| [Common Library](./shell-scripts/common-library.md) | Installation, available functions, utilities |
| [Logging & Error Handling](./shell-scripts/logging-and-errors.md) | Logging standards, error handling, variable naming |
| [Argument Parsing & Testing](./shell-scripts/argument-parsing.md) | Standard arg parsing, validation checklist |
| [Examples & Anti-Patterns](./shell-scripts/examples.md) | Minimal script, full-featured example, what NOT to do |

---

## TL;DR - The Essentials

1. **Always source common library**: `source "$SCRIPT_DIR/lib/common.sh"`
2. **Always call init_script**: Sets up error handling and traps
3. **Use log_* functions**: Never use raw `echo`
4. **Include --help**: Every script must have usage info
5. **Use readonly for constants**: `readonly SCRIPT_NAME="deploy.sh"`
6. **Validate dependencies**: `require_command "flutter" "brew install flutter"`

---

**Remember**: Consistent shell scripts are maintainable shell scripts. Use the common library religiously.
