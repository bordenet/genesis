# Project Setup: Phase 1 - Foundation

> Part of [Project Setup Checklist](../PROJECT_SETUP_CHECKLIST.md)

**Time Estimate**: 30 minutes

---

## Prerequisites

- [ ] **Git repository initialized**
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  ```

- [ ] **Project structure decided**
  - Monorepo vs. polyrepo
  - Languages/frameworks (Go, Node.js, Python, Flutter, etc.)
  - Deployment target (AWS, GCP, Azure, self-hosted)

- [ ] **Development machine ready**
  - macOS, Linux, or WSL2 on Windows
  - Admin/sudo access
  - Internet connection

---

## 1.1 Create Directory Structure

```bash
mkdir -p scripts/lib
mkdir -p scripts/setup-components
mkdir -p docs
mkdir -p build
mkdir -p tests
mkdir -p .husky
```

---

## 1.2 Copy Starter Kit Files

```bash
# From starter-kit directory
cp starter-kit/common.sh scripts/lib/common.sh
cp starter-kit/.gitignore.template .gitignore
cp starter-kit/.env.example .env.example
```

---

## 1.3 Create .gitignore

```gitignore
# SECURITY: Never commit credentials
.env
.env.local
.env.*.local
aws-credentials.json
secrets.json
*.pem
*.key

# Binaries (platform-specific, build from source)
*.exe
*.dll
*.bin
**/bin/*
**/*-darwin-*
**/*-linux-*
**/*-windows-*

# Build artifacts
node_modules/
dist/
build/
builds/
.dart_tool/
DerivedData/
cdk.out/
*.zip

# IDE and temp files
.vscode/
.idea/
*.swp
.DS_Store

# Test artifacts
coverage/
test-results/
.validation-logs/
```

---

## 1.4 Create .env.example

```bash
# AWS Configuration (if using AWS)
AWS_REGION=us-west-2
AWS_ACCOUNT_ID=your-account-id-here

# Application Settings
ENVIRONMENT=dev
PROJECT_NAME=YourProject

# Testing Credentials (never commit real values)
TEST_USER_EMAIL=
TEST_USER_PASSWORD=
```

---

## Checklist

- [ ] `.gitignore` created with all critical patterns
- [ ] `.env.example` created with all required variables
- [ ] `.env` added to `.gitignore`
- [ ] `common.sh` copied to `scripts/lib/common.sh`
- [ ] Directory structure created

