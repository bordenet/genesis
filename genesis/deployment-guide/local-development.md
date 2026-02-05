# Genesis Deployment: Local Development

> Part of [Deployment Guide](../04-DEPLOYMENT-GUIDE.md)

---

## Serve Locally

```bash
# Option 1: Python (recommended)
cd {{DEPLOY_FOLDER}}
python3 -m http.server 8000
# Open http://localhost:8000

# Option 2: Node.js
npx http-server {{DEPLOY_FOLDER}} -p 8000

# Option 3: PHP
cd {{DEPLOY_FOLDER}}
php -S localhost:8000
```

---

## Test Before Deploy

```bash
# Validate HTML
npx html-validate {{DEPLOY_FOLDER}}/index.html

# Check for broken links
npx broken-link-checker http://localhost:8000

# Test in multiple browsers
open -a "Google Chrome" http://localhost:8000
open -a "Safari" http://localhost:8000
open -a "Firefox" http://localhost:8000
```

---

## Self-Contained Project Architecture

Genesis projects are **self-contained with real directories** (no symlinks):

```
my-project/
├── assistant/
│   └── js/
│       ├── app.js
│       ├── workflow.js
│       ├── storage.js
│       └── ...
└── validator/
    └── js/
        ├── app.js
        ├── validator.js
        └── ...
```

**Benefits:**
- Simple setup: Clone and run
- No external dependencies for development or deployment
- Direct GitHub Pages deployment without special handling

