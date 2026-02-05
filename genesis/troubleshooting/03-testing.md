# Troubleshooting: Linting & Testing

> **Parent:** [`TROUBLESHOOTING.md`](../TROUBLESHOOTING.md)

---

## Linting Errors

### Symptoms
- `npm run lint` shows errors
- Pre-commit hook blocks commits

### Common Causes & Solutions

#### Cause 1: Template variables in JS files

**Solution**:
```bash
# Find all {{VARIABLES}} in JS files
grep -r "{{PROJECT_NAME}}" js/ tests/

# Replace with actual project name
```

#### Cause 2: Syntax errors in customized code

**Solution**:
```bash
# Run linter with auto-fix
npm run lint -- --fix

# Check remaining errors
npm run lint
```

---

## Tests Fail

### Symptoms
- `npm test` shows failures
- Coverage below threshold

### Common Causes & Solutions

#### Cause 1: Template variables in test files

**Solution**:
```bash
grep "{{PROJECT_NAME}}" tests/
# Replace all occurrences with actual project name
```

#### Cause 2: Tests not customized for your workflow

**Solution**:
```bash
# Edit tests/workflow.test.js
# Update test cases to match your actual workflow phases and form fields
```

#### Cause 3: Missing test dependencies

**Solution**:
```bash
npm install
```

---

## Dark Mode Doesn't Work

### Symptoms
- Dark mode toggle button doesn't change theme
- Theme stuck in light or dark mode

### Cause
Missing Tailwind dark mode configuration

### Solution

1. **Check index.html** (lines 10-18):
   ```html
   <script>
       tailwind.config = {
           darkMode: 'class'
       }
   </script>
   ```

2. **If missing, add after Tailwind CDN**:
   ```html
   <script src="https://cdn.tailwindcss.com"></script>
   <script>
       tailwind.config = {
           darkMode: 'class'
       }
   </script>
   ```

---

## GitHub Pages 404 Error

### Symptoms
- Site shows 404 Not Found
- https://USERNAME.github.io/REPO/ doesn't load

### Common Causes & Solutions

#### Cause 1: GitHub Pages not enabled

**Solution**:
1. Go to: https://github.com/USERNAME/REPO/settings/pages
2. Source: GitHub Actions
3. Save
4. Wait 2 minutes

#### Cause 2: index.html not in root

**Solution**:
```bash
ls -la index.html
# Should exist in root directory
```

#### Cause 3: Workflow hasn't run yet

**Solution**:
1. Go to: https://github.com/USERNAME/REPO/actions
2. Check if workflow ran successfully
3. If not, push a commit to trigger it

---

