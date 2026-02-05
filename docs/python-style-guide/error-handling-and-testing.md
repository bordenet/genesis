# Python Style Guide: Error Handling & Testing

> Part of [Python Style Guide](../PYTHON_STYLE_GUIDE.md)

---

## Error Handling

### Exception Hierarchy

```python
# Define custom exceptions in a module
class CodebaseReviewerError(Exception):
    """Base exception for codebase-reviewer."""

class ValidationError(CodebaseReviewerError):
    """Raised when validation fails."""

class ConfigurationError(CodebaseReviewerError):
    """Raised when configuration is invalid."""
```

### Error Messages

```python
# Good - descriptive with context
raise ValueError(f"Invalid file path: {path!r} (must be absolute)")

# Bad - vague
raise ValueError("invalid path")
```

### Exception Chaining

```python
try:
    config = load_config(path)
except yaml.YAMLError as e:
    raise ConfigurationError(f"Failed to parse config at {path}") from e
```

---

## Testing

### Test Structure

```python
# tests/test_analyzer.py
import pytest
from codebase_reviewer.analyzers import CodeAnalyzer

class TestCodeAnalyzer:
    """Tests for CodeAnalyzer class."""

    def test_analyze_empty_file(self, tmp_path: Path) -> None:
        """Empty files should return no findings."""
        file = tmp_path / "empty.py"
        file.write_text("")

        analyzer = CodeAnalyzer()
        result = analyzer.analyze(file)

        assert result.findings == []

    def test_analyze_syntax_error(self, tmp_path: Path) -> None:
        """Syntax errors should be reported as critical findings."""
        file = tmp_path / "broken.py"
        file.write_text("def broken(")

        analyzer = CodeAnalyzer()
        result = analyzer.analyze(file)

        assert any(f.severity == "critical" for f in result.findings)
```

### Fixtures

```python
# tests/conftest.py
import pytest
from pathlib import Path

@pytest.fixture
def sample_repo(tmp_path: Path) -> Path:
    """Create a minimal repository structure."""
    (tmp_path / "src").mkdir()
    (tmp_path / "src" / "__init__.py").touch()
    (tmp_path / "tests").mkdir()
    return tmp_path
```

### Coverage

- Target: **≥50%** overall (enforced in CI)
- Critical modules: **≥80%** coverage
- Use `# pragma: no cover` sparingly and with justification

