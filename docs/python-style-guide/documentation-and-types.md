# Python Style Guide: Documentation & Type Annotations

> Part of [Python Style Guide](../PYTHON_STYLE_GUIDE.md)

---

## Documentation (PEP 257)

### Module Docstrings

```python
"""Analyze code quality and detect issues.

This module provides functionality for static code analysis including:
- Syntax validation
- Style checking
- Security scanning
"""
```

### Function Docstrings

```python
def analyze_file(file_path: Path, *, include_metrics: bool = True) -> AnalysisResult:
    """Analyze a single file for code quality issues.

    Args:
        file_path: Path to the file to analyze.
        include_metrics: Whether to include code metrics. Defaults to True.

    Returns:
        AnalysisResult containing findings and metrics.

    Raises:
        FileNotFoundError: If file_path does not exist.
        ValueError: If file_path is not a valid Python file.
    """
```

### Class Docstrings

```python
class CodeAnalyzer:
    """Analyze Python source code for quality issues.

    This analyzer supports multiple rule sets and can be configured
    to check specific categories of issues.

    Attributes:
        rules: List of rules to apply during analysis.
        findings: Results from the most recent analysis.
    """
```

---

## Type Annotations

### Always Type

- All function parameters
- All return values (including `-> None`)
- Class attributes
- Module-level variables

```python
# Good
def calculate_score(findings: list[Finding], weight: float = 1.0) -> float:
    """Calculate weighted score from findings."""
    return sum(f.severity * weight for f in findings)

# Bad - no type annotations
def calculate_score(findings, weight=1.0):
    return sum(f.severity * weight for f in findings)
```

### Common Type Patterns

```python
from typing import Optional, Union, Callable, TypeVar

# Optional for nullable
def find_file(name: str) -> Optional[Path]:
    ...

# Union for multiple types (prefer | in Python 3.10+)
def parse(value: Union[str, int]) -> Result:
    ...

# Callable for function parameters
def apply(transform: Callable[[str], str], data: str) -> str:
    ...

# TypeVar for generics
T = TypeVar("T")
def first(items: list[T]) -> Optional[T]:
    return items[0] if items else None
```

