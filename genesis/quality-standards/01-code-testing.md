# Quality Standards: Code, Documentation & Testing

> **Parent:** [`05-QUALITY-STANDARDS.md`](../05-QUALITY-STANDARDS.md)

---

## Code Quality Standards

### Testing Requirements

**Minimum Coverage**:
- Logic coverage: 85%
- Branch coverage: 85%
- End-to-end tests: All critical paths

**Test Types**:
1. **Unit Tests**: All business logic functions
2. **Integration Tests**: Storage, workflow, UI interactions
3. **End-to-End Tests**: Complete user workflows
4. **Browser Tests**: Cross-browser compatibility (Chrome, Firefox, Safari)
5. **🚨 Validator Alignment Tests**: MANDATORY smoke tests (see below)

### 🚨 MANDATORY: Validator Alignment Test

> **CRITICAL**: This test was requested THREE TIMES and never implemented, causing a 17-point scoring divergence. It is now NON-NEGOTIABLE.

Every genesis-derived project MUST have this test in `assistant/tests/smoke.test.js`:

```javascript
describe('CRITICAL: Validator Single Source of Truth', () => {
  test('validator-inline.js should NOT exist', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const inlinePath = path.join(process.cwd(), 'shared', 'js', 'validator-inline.js');
    expect(fs.existsSync(inlinePath)).toBe(false);
  });
});
```

**After adding this test, you MUST verify it works:**
1. Run `npm test` — should pass
2. Run `echo "// fake" > shared/js/validator-inline.js`
3. Run `npm test` — **MUST FAIL** (if it passes, test is broken!)
4. Run `rm shared/js/validator-inline.js`
5. Run `npm test` — should pass again

See [`CODE-CONSISTENCY-MANDATE.md`](../CODE-CONSISTENCY-MANDATE.md) for full details.

**Example Test Structure**:
```
tests/
├── unit/
│   ├── storage.test.js
│   ├── workflow.test.js
│   └── ui.test.js
├── integration/
│   ├── workflow-integration.test.js
│   └── storage-integration.test.js
└── e2e/
    ├── create-project.test.js
    ├── export-import.test.js
    └── multi-phase-workflow.test.js
```

### Code Review Checklist

Before committing:
- [ ] All tests pass
- [ ] Coverage meets 85% threshold
- [ ] No console.log() statements in production code
- [ ] Error handling on all async operations
- [ ] Input validation on all user inputs
- [ ] Accessibility: keyboard navigation works
- [ ] Accessibility: ARIA labels present
- [ ] Dark mode tested
- [ ] Mobile responsive tested
- [ ] Cross-browser tested
- [ ] **Shell scripts pass shellcheck with zero warnings**
- [ ] **Shell scripts follow SHELL_SCRIPT_STANDARDS.md**
- [ ] **All scripts include running timer (yellow on black)**
- [ ] **All scripts support `-h|--help` and `-v|--verbose`**
- [ ] **🚨 Validator alignment test exists and has been TESTED (see above)**

---

## Documentation Standards

### Writing Style

**Avoid**:
- ❌ Hyperbolic language ("amazing", "incredible", "revolutionary")
- ❌ Unsubstantiated claims ("production-grade", "enterprise-ready")
- ❌ Marketing speak ("game-changing", "cutting-edge")
- ❌ Exclamation marks (except in examples)
- ❌ Emojis in technical documentation (use sparingly in user-facing docs)

**Use**:
- ✅ Clear, factual statements
- ✅ Specific, measurable claims
- ✅ Professional tone
- ✅ Active voice
- ✅ Concrete examples

**Example - Before**:
```markdown
This amazing tool will revolutionize your workflow! It's production-grade and enterprise-ready!
```

**Example - After**:
```markdown
This tool provides a structured workflow for document creation with AI assistance.
It includes automated testing, error handling, and export functionality.
```

### Required Documentation

Every project must include:

1. **README.md**:
   - Clear project description
   - Installation instructions
   - Usage examples
   - Architecture overview
   - Contributing guidelines
   - License information

2. **ARCHITECTURE.md**:
   - System design
   - Data flow diagrams
   - Technology choices with rationale
   - Security considerations

3. **CONTRIBUTING.md**:
   - Development setup
   - Testing requirements
   - Code style guidelines
   - Pull request process

### Information Architecture

**File Organization**:
```
project-root/
├── README.md                    # Project overview
├── LICENSE                      # License file
├── CONTRIBUTING.md              # Contribution guidelines
│
├── docs/                        # Documentation
│   ├── architecture/
│   │   ├── ARCHITECTURE.md      # System design
│   │   ├── DATA_FLOW.md         # Data flow
│   │   └── SECURITY.md          # Security considerations
│   ├── deployment/
│   │   ├── DEPLOYMENT.md        # Deployment guide
│   │   └── TROUBLESHOOTING.md   # Common issues
│   └── development/
│       ├── DEVELOPMENT.md       # Dev setup
│       ├── TESTING.md           # Testing guide
│       └── DEBUGGING.md         # Debugging guide
│
├── src/                         # Source code
├── tests/                       # Test files
├── scripts/                     # Automation scripts
└── .github/                     # GitHub configuration
    └── workflows/               # CI/CD workflows
```

**Cross-Reference Validation**:
- All internal links must be valid
- All script references must use correct paths
- All imports must resolve correctly
- All documentation must be up-to-date

---

## README Badge Standards

### Required Badges

```markdown
[![CI/CD](https://github.com/{user}/{repo}/actions/workflows/ci.yml/badge.svg)](https://github.com/{user}/{repo}/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/{user}/{repo}/branch/main/graph/badge.svg?token={token})](https://codecov.io/gh/{user}/{repo})
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
```

### Language-Specific Badges

**JavaScript/Node.js**:
```markdown
[![Node Version](https://img.shields.io/badge/Node-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
```

**Python**:
```markdown
[![Python Version](https://img.shields.io/badge/Python-3.8+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
```

**Go**:
```markdown
[![Go Version](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go)](https://go.dev/)
```

### Optional Badges

```markdown
[![Release](https://img.shields.io/github/v/release/{user}/{repo})](https://github.com/{user}/{repo}/releases/latest)
[![Issues](https://img.shields.io/github/issues/{user}/{repo})](https://github.com/{user}/{repo}/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
```

---

## Testing Standards

### AI Integration Testing

**Critical Feature**: Mock AI responses for testing

When integrating with external LLMs (OpenAI, Anthropic, etc.), provide mock responses for testing:

**Purpose**:
- Enable end-to-end testing without API costs
- Ensure consistent test results
- Allow offline development
- Validate error handling

**Implementation**:
```javascript
// config.js
export const AI_CONFIG = {
  mode: process.env.AI_MODE || 'live', // 'live' or 'mock'
  mockResponses: {
    phase1: 'Mock response for phase 1...',
    phase2: 'Mock response for phase 2...'
  }
};

// ai-client.js
export async function callAI(prompt, phase) {
  if (AI_CONFIG.mode === 'mock') {
    return AI_CONFIG.mockResponses[phase];
  }
  
  // Real API call
  return await fetch(API_ENDPOINT, { ... });
}
```

**Documentation**:
- Clearly mark mock mode as for testing only
- Document how to enable/disable mock mode
- Provide example mock responses
- Explain limitations of mock mode

---

