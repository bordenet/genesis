# Python Style Guide: Tooling & Project Structure

> Part of [Python Style Guide](../PYTHON_STYLE_GUIDE.md)

---

## References

- [PEP 8 – Style Guide for Python Code](https://peps.python.org/pep-0008/) - Primary baseline
- [PEP 257 – Docstring Conventions](https://peps.python.org/pep-0257/) - Documentation standards
- [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html) - Stricter conventions
- [Black Code Formatter](https://black.readthedocs.io/) - Opinionated formatting
- [Ruff](https://docs.astral.sh/ruff/) - Fast Python linter (optional, replacing flake8)

---

## Automated Tooling

All code must pass these tools before commit:

```bash
# Formatting (automatic)
black --line-length=120 src/
isort --profile black --line-length 120 src/

# Linting (must pass with score >= 9.5)
pylint src/ --max-line-length=120 --min-similarity-lines=10 --fail-under=9.5

# Type checking (must pass)
mypy src/ --ignore-missing-imports

# Docstring checking (must pass)
pydocstyle src/ --convention=pep257

# Tests (must pass with >= 50% coverage)
pytest tests/ --cov=src --cov-fail-under=50
```

### Pre-commit Configuration

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/psf/black
    hooks:
      - id: black
        args: ['--line-length=120']
  - repo: https://github.com/pycqa/isort
    hooks:
      - id: isort
        args: ['--profile', 'black', '--line-length', '120']
```

---

## Project Structure

```text
src/
  package_name/
    __init__.py          # Package exports, version
    __main__.py          # CLI entry point
    models.py            # Data classes and types
    cli/                 # CLI commands (click/argparse)
    analyzers/           # Analysis logic
    exporters/           # Output formatters
tests/
  __init__.py
  test_*.py              # Test modules
  conftest.py            # Shared fixtures
docs/
  *.md                   # Documentation
```

---

## Linting Rules Summary

### pylint

- Required score: **≥9.5/10**
- Key rules: `missing-docstring`, `too-many-arguments`, `unused-import`

### mypy

- Strict mode recommended for new projects
- Minimum: `--ignore-missing-imports`

### Black

- Line length: **120** (configured in pre-commit)
- No configuration needed - use defaults

### isort

- Profile: **black** (compatible formatting)
- Line length: **120**

