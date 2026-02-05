# Genesis Customization: Template Variables

> Part of [Customization Guide](../03-CUSTOMIZATION-GUIDE.md)

---

## Core Variables

All templates use `{{VARIABLE_NAME}}` syntax. Here are the core variables:

```bash
# Project Identity
{{PROJECT_NAME}}                 # e.g., "one-pager-assistant"
{{PROJECT_TITLE}}                # e.g., "One-Pager Assistant"
{{PROJECT_DESCRIPTION}}          # One-line description
{{GITHUB_USER}}                  # GitHub username
{{GITHUB_REPO}}                  # Repository name
{{AUTHOR_NAME}}                  # Author full name
{{AUTHOR_EMAIL}}                 # Author email

# Workflow Configuration
{{WORKFLOW_TYPE}}                # "multi-phase" or "single-phase"
{{PHASE_COUNT}}                  # Number of workflow phases
{{PHASE_1_NAME}}                 # e.g., "Initial Draft"
{{PHASE_1_AI}}                   # e.g., "Claude Sonnet 4.5"
{{PHASE_2_NAME}}                 # e.g., "Review & Critique"
{{PHASE_2_AI}}                   # e.g., "Gemini 2.5 Pro"

# Architecture Flags
{{ENABLE_BACKEND}}               # true/false
{{ENABLE_DESKTOP_CLIENTS}}       # true/false
{{ENABLE_CODECOV}}               # true/false
{{ENABLE_PRE_COMMIT_HOOKS}}      # true/false

# Deployment
{{GITHUB_PAGES_URL}}             # e.g., "https://user.github.io/repo"
{{DEPLOY_BRANCH}}                # e.g., "main"
{{DEPLOY_FOLDER}}                # e.g., "docs" or "web"

# Storage
{{STORAGE_TYPE}}                 # "indexeddb", "localstorage", "backend"
{{DB_NAME}}                      # IndexedDB database name
{{STORE_NAME}}                   # IndexedDB store name
```

---

## Adding Custom Variables

1. **Define in config.json**:
   ```json
   {
     "custom": {
       "my_variable": "my_value"
     }
   }
   ```

2. **Use in templates**:
   ```html
   <title>{{MY_VARIABLE}}</title>
   ```

3. **Document in this file** so AI knows about it

