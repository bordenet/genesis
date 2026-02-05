# Genesis README: How to Use

> Part of [Genesis README](../README.md)

---

## How to Use

### Option 1: With AI Assistant (Recommended)

```bash
# Copy Genesis to new project
mkdir my-new-project
cp -r genesis/* my-new-project/
cd my-new-project

# Open with AI (Claude, Cursor, etc.)
# Tell AI: "Please read 01-AI-INSTRUCTIONS.md and help me create a new project"
```

### Option 2: Manual Setup

```bash
# Copy Genesis
mkdir my-new-project
cp -r genesis/* my-new-project/
cd my-new-project

# Follow 02-QUICK-START.md
```

---

## Examples

### Create One-Pager Assistant

```bash
mkdir one-pager-assistant
cp -r genesis/* one-pager-assistant/
cd one-pager-assistant

# Tell AI: "Create a One-Pager assistant using examples/one-pager/ as reference"
```

### Create Minimal Project

```bash
mkdir my-minimal-app
cp -r genesis/* my-minimal-app/
cd my-minimal-app

# Tell AI: "Create a minimal project using examples/minimal/ as reference"
```

---

## Validation & Quality Assurance

Genesis includes comprehensive validation scripts:

**Template Placeholder Validation** (`scripts/validate-template-placeholders.sh`):
- Scans for unreplaced `{{VARIABLES}}` in generated code
- Runs automatically in CI/CD pipeline
- Usage: `./genesis/scripts/validate-template-placeholders.sh .`

**Generated Project Test Suite** (`scripts/test-generated-project.sh`):
- Comprehensive test for all 7 critical issues from reverse-integration
- Validates storage exports, HTML elements, workflow functions
- Usage: `./genesis/scripts/test-generated-project.sh .`

**Genesis Structure Validation** (`validation/validate-genesis.sh`):
- Validates Genesis template system structure
- Ensures all required files are present

---

## Support

| Resource | Purpose |
|----------|---------|
| `START-HERE.md` | AI entry point |
| `02-QUICK-START.md` | Human quick start |
| `03-CUSTOMIZATION-GUIDE.md` | Customization options |
| `examples/hello-world/` | Baseline reference |

