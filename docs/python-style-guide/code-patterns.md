# Python Style Guide: Code Patterns & File Organization

> Part of [Python Style Guide](../PYTHON_STYLE_GUIDE.md)

---

## File Organization

### File Length

- Target: **≤400 lines** per file
- Maximum: **600 lines** (refactor if approaching)

### Import Order (isort)

1. Standard library
2. Third-party packages
3. Local application imports

```python
import os
from pathlib import Path

import click
import yaml
from pydantic import BaseModel

from codebase_reviewer.models import Finding
from codebase_reviewer.analyzers import CodeAnalyzer
```

### Avoid Circular Imports

- Use `TYPE_CHECKING` for type-only imports
- Import at module level, not inside functions (unless necessary)

```python
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from codebase_reviewer.orchestrator import Orchestrator
```

---

## Code Patterns

### Dataclasses for Data

```python
from dataclasses import dataclass, field
from typing import Optional

@dataclass
class Finding:
    """A single code quality finding."""

    rule_id: str
    message: str
    severity: str
    file_path: Path
    line: int
    column: int = 0
    suggestion: Optional[str] = None
    metadata: dict = field(default_factory=dict)
```

### Context Managers for Resources

```python
from contextlib import contextmanager

@contextmanager
def temp_directory() -> Iterator[Path]:
    """Create a temporary directory that's cleaned up on exit."""
    path = Path(tempfile.mkdtemp())
    try:
        yield path
    finally:
        shutil.rmtree(path)
```

### Logging

```python
import logging

logger = logging.getLogger(__name__)

def analyze(path: Path) -> Result:
    logger.info("Starting analysis of %s", path)
    try:
        result = _do_analysis(path)
        logger.debug("Analysis complete: %d findings", len(result.findings))
        return result
    except Exception:
        logger.exception("Analysis failed for %s", path)
        raise
```

