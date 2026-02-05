# Python Style Guide for bordenet/* Projects

This document defines the Python coding standards for tools development projects
in the bordenet organization. Standards are derived from PEP 8, PEP 257, and the
Google Python Style Guide, with automated enforcement via Black, isort, pylint, and mypy.

---

## Quick Navigation

> **For AI Agents**: Load only the section you need to minimize context usage.

| Section | Contents |
|---------|----------|
| [Tooling & Structure](./python-style-guide/tooling-and-structure.md) | Automated tooling, pre-commit, project structure, linting rules |
| [Naming Conventions](./python-style-guide/naming-and-conventions.md) | Modules, classes, functions, variables, type variables |
| [Documentation & Types](./python-style-guide/documentation-and-types.md) | PEP 257 docstrings, type annotations |
| [Error Handling & Testing](./python-style-guide/error-handling-and-testing.md) | Exceptions, test structure, coverage |
| [Code Patterns](./python-style-guide/code-patterns.md) | File organization, dataclasses, context managers, logging |

---

## Key Rules

1. **Black formatting** - Line length 120, no exceptions
2. **Type everything** - All parameters, return values, attributes
3. **pylint score ≥9.5** - Required for all code
4. **≥50% test coverage** - Enforced in CI
