# Test Coverage Comparison Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add semantic test coverage analysis to the genesis diffing tool to detect when critical test patterns exist in some projects but not others.

**Architecture:** Extend diff-projects.js with a new `analyzeTestCoverage()` function that scans test files for defined "critical patterns" (e.g., exportAllProjects, importProjects tests) and reports which projects have/lack each pattern. This runs alongside the existing hash-based comparison.

**Tech Stack:** Node.js, regex pattern matching, existing diff-projects.js infrastructure

---

## Problem Statement

The current diff tool:
1. Compares files by MD5 hash only
2. `projects.test.js` is in `INTENTIONAL_DIFF_PATTERNS`, so it's expected to differ
3. Cannot detect when one project has comprehensive tests and others have stubs
4. Missed that jd-assistant had Export/Import tests while 6 other projects did not

---

## Task 1: Define Critical Test Patterns

**Files:**
- Modify: `genesis-tools/genesis/project-diff/diff-projects.js:39` (after INTENTIONAL_DIFF_PATTERNS)

**Step 1: Add CRITICAL_TEST_PATTERNS constant**

```javascript
// Critical test patterns that MUST exist in ALL projects
// These patterns indicate coverage for essential functionality
const CRITICAL_TEST_PATTERNS = [
  {
    name: 'exportAllProjects',
    description: 'Tests for bulk export functionality',
    filePattern: /projects\.test\.js$/,
    codePatterns: [
      /describe\s*\(\s*['"`]exportAllProjects['"`]/,
      /test\s*\(\s*['"`].*exportAllProjects/i,
      /it\s*\(\s*['"`].*exportAllProjects/i,
    ]
  },
  {
    name: 'importProjects',
    description: 'Tests for bulk import functionality',
    filePattern: /projects\.test\.js$/,
    codePatterns: [
      /describe\s*\(\s*['"`]importProjects['"`]/,
      /test\s*\(\s*['"`].*importProjects/i,
      /it\s*\(\s*['"`].*importProjects/i,
    ]
  },
  {
    name: 'exportProject',
    description: 'Tests for single project export',
    filePattern: /projects\.test\.js$/,
    codePatterns: [
      /describe\s*\(\s*['"`]exportProject['"`]/,
      /test\s*\(\s*['"`].*exportProject/i,
      /it\s*\(\s*['"`].*exportProject/i,
    ]
  },
];
```

---

## Task 2: Implement analyzeTestCoverage Function

**Files:**
- Modify: `genesis-tools/genesis/project-diff/diff-projects.js` (add new function after getFileHash)

**Step 1: Add function to scan for test patterns**

```javascript
/**
 * Analyze test coverage for critical patterns across all projects
 */
function analyzeTestCoverage(genesisToolsDir) {
  const results = {
    patterns: {},  // pattern name -> { hasPattern: [projects], missingPattern: [projects] }
    summary: { patternsChecked: 0, patternsWithGaps: 0 }
  };

  for (const pattern of CRITICAL_TEST_PATTERNS) {
    results.patterns[pattern.name] = {
      description: pattern.description,
      hasPattern: [],
      missingPattern: []
    };
    results.summary.patternsChecked++;

    for (const project of PROJECTS) {
      const projectPath = path.join(genesisToolsDir, project);
      let found = false;

      // Find test files matching filePattern
      const testFiles = findTestFiles(projectPath, pattern.filePattern);
      
      for (const testFile of testFiles) {
        const content = fs.readFileSync(testFile, 'utf-8');
        // Check if any code pattern matches
        if (pattern.codePatterns.some(regex => regex.test(content))) {
          found = true;
          break;
        }
      }

      if (found) {
        results.patterns[pattern.name].hasPattern.push(project);
      } else {
        results.patterns[pattern.name].missingPattern.push(project);
      }
    }

    // Track gaps
    if (results.patterns[pattern.name].missingPattern.length > 0 &&
        results.patterns[pattern.name].hasPattern.length > 0) {
      results.summary.patternsWithGaps++;
    }
  }

  return results;
}
```

---

## Task 3: Add findTestFiles Helper Function

**Files:**
- Modify: `genesis-tools/genesis/project-diff/diff-projects.js` (add after getAllFiles)

**Step 1: Add helper to find test files matching a pattern**

```javascript
/**
 * Find test files in a project matching a filename pattern
 */
function findTestFiles(projectPath, filePattern) {
  const testFiles = [];
  const testDirs = ['tests', 'assistant/tests', 'validator/tests'];

  for (const testDir of testDirs) {
    const dir = path.join(projectPath, testDir);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (filePattern.test(file)) {
        testFiles.push(path.join(dir, file));
      }
    }
  }

  return testFiles;
}
```

---

## Task 4: Add Test Coverage Report Section

**Files:**
- Modify: `genesis-tools/genesis/project-diff/diff-projects.js:formatConsoleReport`

**Step 1: Add coverage gaps section to report**

Add after the symlink issues section in formatConsoleReport:

```javascript
// TEST COVERAGE GAPS
if (results.testCoverage && results.testCoverage.summary.patternsWithGaps > 0) {
  lines.push(red(bold('🔍 TEST COVERAGE GAPS (critical patterns missing)')));
  lines.push(red('─'.repeat(60)));
  lines.push('');

  for (const [name, data] of Object.entries(results.testCoverage.patterns)) {
    if (data.missingPattern.length > 0 && data.hasPattern.length > 0) {
      lines.push(red(`  ${name}: ${data.description}`));
      lines.push(green(`    ✓ Has tests: ${data.hasPattern.join(', ')}`));
      lines.push(red(`    ✗ Missing: ${data.missingPattern.join(', ')}`));
      lines.push('');
    }
  }
}
```

---

## Task 5: Integrate into Main Diff Function

**Files:**
- Modify: `genesis-tools/genesis/project-diff/diff-projects.js:diffProjects`

**Step 1: Call analyzeTestCoverage and add to results**

At the end of diffProjects function, before `return results`:

```javascript
// Analyze test coverage for critical patterns
results.testCoverage = analyzeTestCoverage(genesisToolsDir);
```

---

## Task 6: Update CI Mode Exit Conditions

**Files:**
- Modify: `genesis-tools/genesis/project-diff/diff-projects.js:main`

**Step 1: Exit 1 if test coverage gaps exist**

```javascript
// CI mode: exit 1 if divergent files, symlink issues, OR test coverage gaps
if (ciMode && (
  results.summary.divergent > 0 || 
  results.summary.symlinkIssues > 0 ||
  results.testCoverage.summary.patternsWithGaps > 0
)) {
  process.exit(1);
}
```

---

## Task 7: Update Summary Output

**Files:**
- Modify: `genesis-tools/genesis/project-diff/diff-projects.js:formatConsoleReport`

**Step 1: Add coverage gaps to summary section**

```javascript
if (results.testCoverage && results.testCoverage.summary.patternsWithGaps > 0) {
  lines.push(`  ${red('🔍')} Test coverage gaps: ${results.testCoverage.summary.patternsWithGaps}`);
}
```

---

## Task 8: Run and Validate

**Step 1: Run the improved diff tool**

```bash
cd genesis-tools/genesis/project-diff
node diff-projects.js
```

**Step 2: Verify it detects current gaps**

Expected: Should show test coverage section (if gaps remain after our fixes)

**Step 3: Commit changes**

```bash
git add diff-projects.js
git commit -m "feat: add test coverage gap detection to diff tool

- Add CRITICAL_TEST_PATTERNS for exportAllProjects, importProjects, exportProject
- Add analyzeTestCoverage() to scan test files for critical patterns  
- Add findTestFiles() helper to locate test files
- Add TEST COVERAGE GAPS section to console report
- Update CI mode to fail on coverage gaps
- Prevents future situations where one project has tests and others don't"
```

---

## Extensibility

To add new critical patterns in the future, simply add entries to `CRITICAL_TEST_PATTERNS`:

```javascript
{
  name: 'patternName',
  description: 'What this pattern tests',
  filePattern: /filename\.test\.js$/,
  codePatterns: [/regex1/, /regex2/]
}
```

