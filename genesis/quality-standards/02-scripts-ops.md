# Quality Standards: Scripts, Security & Operations

> **Parent:** [`05-QUALITY-STANDARDS.md`](../05-QUALITY-STANDARDS.md)

---

## Shell Script Standards

**MANDATORY**: All shell scripts must follow `templates/docs/SHELL_SCRIPT_STANDARDS-template.md`.

### Required Features

Every shell script **MUST** include:

1. **Running Timer** (yellow text on black background, top-right corner)
   - Format: `[HH:MM:SS]`
   - Updates at least every second
   - Visible throughout script execution

2. **Help System** (`-h | --help`)
   - Man-page style format
   - Includes NAME, SYNOPSIS, DESCRIPTION, OPTIONS, EXAMPLES
   - Exits with status code 0

3. **Verbose Mode** (`-v | --verbose`)
   - Shows INFO-level logs
   - Default mode is compact (minimal vertical space)

4. **Compact Display**
   - Uses ANSI escape codes to overwrite lines
   - Minimal vertical terminal usage (< 10 lines for typical scripts)
   - Clear progress indicators

5. **Error Handling**
   - `set -euo pipefail` at script start
   - Cleanup handlers with `trap`
   - Actionable error messages

6. **ShellCheck Compliance**
   - Zero warnings before commit
   - Platform compatibility (macOS/Linux)

### Required Scripts

Every project **MUST** include these scripts:

#### 1. Setup Script (`scripts/setup-macos.sh`)
- Installs ALL project dependencies
- Creates virtual environments
- Configures pre-commit hooks
- Supports `-y` flag for non-interactive mode
- Supports `-v` flag for verbose output

#### 2. Deployment Script (`scripts/deploy-web.sh`) - For Web Apps
- Runs linting checks (`npm run lint`)
- Runs all tests (`npm test`)
- Verifies test coverage threshold
- Commits and pushes to GitHub
- Verifies GitHub Pages deployment
- Supports `--skip-tests` and `--skip-lint` flags (NOT RECOMMENDED)
- Supports `-v` flag for verbose output
- Displays deployment URL and status

**Reference Implementations**:
- [bu.sh](https://github.com/bordenet/scripts/blob/main/bu.sh) - Complete example
- [setup-macos.sh](https://github.com/bordenet/bloginator/blob/main/scripts/setup-macos.sh) - Setup script example
- `templates/scripts/deploy-web.sh.template` - Deployment script template

### Common Library

Use `scripts/lib/common.sh` for shared functionality:
- Timer functions
- Logging functions (log_info, log_success, log_error, etc.)
- Platform detection (is_macos, is_linux, is_arm64)
- Utility functions (retry_command, ask_yes_no, etc.)

---

## Logging Standards

### Structured Logging

Use structured logging for all significant events:

```javascript
// Good
logger.info('Project created', {
  projectId: project.id,
  phase: 1,
  timestamp: new Date().toISOString()
});

// Bad
console.log('Project created!');
```

### Log Levels

- **ERROR**: Unrecoverable errors
- **WARN**: Recoverable errors, deprecated features
- **INFO**: Significant events (project created, phase completed)
- **DEBUG**: Detailed diagnostic information

### What to Log

**Do log**:
- User actions (create, update, delete)
- State transitions (phase changes)
- Errors with context
- Performance metrics

**Don't log**:
- Sensitive data (API keys, user content)
- Excessive debug information in production
- Stack traces to user-facing logs

---

## Security Standards

### Input Validation

All user inputs must be validated:

```javascript
function validateProjectTitle(title) {
  if (!title || typeof title !== 'string') {
    throw new Error('Title must be a non-empty string');
  }
  
  if (title.length > 200) {
    throw new Error('Title must be 200 characters or less');
  }
  
  return title.trim();
}
```

### Data Sanitization

Sanitize all user content before display:

```javascript
import DOMPurify from 'dompurify';

function renderUserContent(content) {
  return DOMPurify.sanitize(content);
}
```

### Storage Security

- Never store API keys in IndexedDB
- Use environment variables for secrets
- Validate all data before storage
- Implement data size limits

---

## Accessibility Standards

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Tab order must be logical
- Focus indicators must be visible

### Screen Readers

- All images must have alt text
- All form inputs must have labels
- ARIA labels for dynamic content

### Color Contrast

- Text must meet WCAG AA standards (4.5:1 ratio)
- Interactive elements must be distinguishable
- Don't rely on color alone for information

---

## Performance Standards

### Metrics

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: > 90

### Optimization

- Minimize JavaScript bundle size
- Use CDN for external libraries
- Lazy load non-critical resources
- Implement proper caching headers

---

## Version Control Standards

### Commit Messages

Format: `<type>: <description>`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test changes
- `refactor`: Code refactoring
- `chore`: Maintenance tasks

Example:
```
feat: Add export to PDF functionality
fix: Resolve dark mode toggle issue
docs: Update deployment guide
test: Add integration tests for workflow
```

### Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: Feature branches
- `fix/*`: Bug fix branches

---

## Pre-Deployment Checklist

Before deploying to production:

- [ ] All tests pass (unit, integration, e2e)
- [ ] Code coverage ≥ 85%
- [ ] Documentation updated
- [ ] No TODO comments in code
- [ ] All hyperlinks validated
- [ ] Cross-browser tested
- [ ] Mobile responsive verified
- [ ] Accessibility audit passed
- [ ] Performance metrics met
- [ ] Security audit completed
- [ ] Error handling verified
- [ ] Logging implemented
- [ ] README badges updated
- [ ] **Shell scripts tested on target platform**
- [ ] **`scripts/setup-macos.sh` (or equivalent) works end-to-end**
- [ ] **All scripts display timer correctly**

---

**These standards ensure every Genesis project reflects professional excellence.**

