# Python Style Guide: Naming Conventions

> Part of [Python Style Guide](../PYTHON_STYLE_GUIDE.md)

---

## Modules and Packages

- **snake_case**: `code_analyzer.py`, `security_rules.py`
- Avoid: `codeAnalyzer.py`, `CodeAnalyzer.py`

---

## Classes

- **PascalCase**: `CodeAnalyzer`, `SecurityRule`, `ValidationResult`
- Suffix base classes with `Base`: `AnalyzerBase`
- Suffix abstract classes with `ABC`: `ExporterABC`

---

## Functions and Methods

- **snake_case**: `analyze_code()`, `get_findings()`, `_private_helper()`
- Use verbs: `calculate_`, `generate_`, `validate_`, `parse_`
- Boolean methods: `is_valid()`, `has_errors()`, `can_process()`

---

## Variables

- **snake_case**: `file_path`, `error_count`, `is_valid`
- **UPPER_SNAKE_CASE** for constants: `MAX_LINE_LENGTH`, `DEFAULT_TIMEOUT`
- Prefix private with underscore: `_internal_state`

---

## Type Variables

- **PascalCase** with descriptive suffix: `T`, `ItemT`, `ReturnT`

---

## Function and Method Guidelines

### Length

- Target: **≤50 lines** per function
- Maximum: **100 lines** (refactor if approaching)
- Single responsibility principle

### Parameters

- **≤5 parameters** - use dataclass/dict if more needed
- Use keyword arguments for optional parameters
- Type all parameters and return values

```python
# Good
def analyze_file(
    file_path: Path,
    *,
    include_metrics: bool = True,
    max_depth: int = 10,
) -> AnalysisResult:
    """Analyze a single file."""
    ...

# Bad - too many positional parameters
def analyze_file(path, metrics, depth, lang, encoding, timeout):
    ...
```

### Return Values

- Always type return values
- Prefer returning objects over tuples for complex returns
- Use `Optional[T]` for nullable returns

