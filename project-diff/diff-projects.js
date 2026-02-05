#!/usr/bin/env node

/**
 * Genesis Project Diff Tool
 * 
 * Compares EVERY file across all assistant projects to detect divergence.
 * Files are categorized as:
 * - MUST_MATCH: Must be byte-for-byte identical across all projects
 * - INTENTIONAL_DIFF: Expected to differ (prompts, templates, project-specific)
 * - PROJECT_SPECIFIC: Only exists in some projects (acceptable)
 * 
 * Usage:
 *   node diff-projects.js                    # Full diff report
 *   node diff-projects.js --json             # JSON output
 *   node diff-projects.js --ci               # Exit 1 if MUST_MATCH files diverge
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// All 8 projects (7 derived + hello-world baseline)
const PROJECTS = [
  'architecture-decision-record',
  'jd-assistant',
  'one-pager',
  'power-statement-assistant',
  'pr-faq-assistant',
  'product-requirements-assistant',
  'strategic-proposal',
  'genesis/genesis/examples/hello-world',
];

// Critical test patterns that MUST exist in ALL projects
// These patterns indicate coverage for essential functionality
// If a pattern exists in ANY project, it must exist in ALL projects
const CRITICAL_TEST_PATTERNS = [
  // === EXPORT/IMPORT FUNCTIONALITY ===
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
  // === ERROR HANDLING ===
  {
    name: 'errorHandler',
    description: 'Tests for error handling infrastructure',
    filePattern: /error-handler\.test\.js$/,
    codePatterns: [
      /describe\s*\(\s*['"`].*[Ee]rror.*[Hh]andl/,
      /test\s*\(\s*['"`].*error/i,
    ]
  },
  // === STORAGE FUNCTIONALITY ===
  {
    name: 'storageInit',
    description: 'Tests for storage initialization',
    filePattern: /storage\.test\.js$/,
    codePatterns: [
      /describe\s*\(\s*['"`].*init/i,
      /test\s*\(\s*['"`].*init/i,
    ]
  },
  // === STORAGE EXPORT/IMPORT (storage.test.js level) ===
  {
    name: 'storage.exportAll',
    description: 'Tests for storage-level exportAll',
    filePattern: /storage\.test\.js$/,
    codePatterns: [
      /describe\s*\(\s*['"`]exportAll['"`]/,
      /test\s*\(\s*['"`].*exportAll/i,
      /it\s*\(\s*['"`].*exportAll/i,
    ]
  },
  {
    name: 'storage.importAll',
    description: 'Tests for storage-level importAll',
    filePattern: /storage\.test\.js$/,
    codePatterns: [
      /describe\s*\(\s*['"`]importAll['"`]/,
      /test\s*\(\s*['"`].*importAll/i,
      /it\s*\(\s*['"`].*importAll/i,
    ]
  },
];

// ============================================================================
// VALIDATOR STRUCTURE REQUIREMENTS
// ============================================================================
// Minimum file sizes (in lines) for a functional validator
// Based on one-pager reference implementation
// If a validator file is significantly smaller, it's likely a stub
const VALIDATOR_STRUCTURE_REQUIREMENTS = {
  // Minimum line counts for functional validator files
  // Based on one-pager (the reference implementation)
  minLineCounts: {
    'validator/index.html': 200,      // one-pager: 349 lines, stub: 94 lines
    'validator/js/app.js': 300,       // one-pager: 454 lines, stub: 122 lines
    'validator/js/validator.js': 200, // one-pager: 556 lines, stub: 68 lines
  },
  // Required files that MUST exist for a functional validator
  requiredFiles: [
    'validator/index.html',
    'validator/js/app.js',
    'validator/js/validator.js',
    'validator/js/prompts.js',  // CRITICAL: Missing in hello-world template
  ],
  // Required UI elements in validator/index.html
  // Based on actual working validators (one-pager, jd-assistant)
  requiredHtmlElements: [
    { pattern: /id=["']?btn-toggle-mode["']?/, description: 'Scoring mode toggle button' },
    { pattern: /id=["']?quick-score-panel["']?/, description: 'Quick score panel' },
    { pattern: /id=["']?llm-score-panel["']?/, description: 'LLM score panel' },
    { pattern: /id=["']?ai-powerups["']?/, description: 'AI Power-ups section' },
    { pattern: /id=["']?btn-save["']?/, description: 'Save button for version control' },
    { pattern: /id=["']?btn-back["']?/, description: 'Back button for version control' },
    { pattern: /id=["']?btn-forward["']?/, description: 'Forward button for version control' },
  ],
  // Required functions/patterns in validator/js/app.js
  requiredAppFunctions: [
    { pattern: /updateScoreDisplay|updateScore/, description: 'Score display update function' },
    { pattern: /storage\.saveVersion|saveVersion/, description: 'Version save functionality' },
    { pattern: /storage\.goBack|goBack/, description: 'Version back navigation' },
    { pattern: /storage\.goForward|goForward/, description: 'Version forward navigation' },
  ],
};

// ============================================================================
// INTERNAL CONSISTENCY REQUIREMENTS
// ============================================================================
// Files that exist in BOTH js/ and assistant/js/ MUST be identical within each project.
// This catches the common bug where changes are made to one copy but not the other.
// The ROOT index.html loads from js/, while assistant/index.html loads from assistant/js/.
// If these diverge, users see different behavior depending on which entry point they use.
const INTERNAL_CONSISTENCY_PAIRS = [
  // Core application files that MUST be identical between js/ and assistant/js/
  { root: 'js/project-view.js', assistant: 'assistant/js/project-view.js' },
  { root: 'js/views.js', assistant: 'assistant/js/views.js' },
  { root: 'js/router.js', assistant: 'assistant/js/router.js' },
  { root: 'js/workflow.js', assistant: 'assistant/js/workflow.js' },
  { root: 'js/projects.js', assistant: 'assistant/js/projects.js' },
  { root: 'js/ui.js', assistant: 'assistant/js/ui.js' },
  { root: 'js/storage.js', assistant: 'assistant/js/storage.js' },
  { root: 'js/app.js', assistant: 'assistant/js/app.js' },
  { root: 'js/prompts.js', assistant: 'assistant/js/prompts.js' },
  { root: 'js/error-handler.js', assistant: 'assistant/js/error-handler.js' },
  { root: 'js/ai-mock.js', assistant: 'assistant/js/ai-mock.js' },
  { root: 'js/diff-view.js', assistant: 'assistant/js/diff-view.js' },
  { root: 'js/types.js', assistant: 'assistant/js/types.js' },
  { root: 'js/attachments.js', assistant: 'assistant/js/attachments.js' },
  // Core shared modules
  { root: 'js/core/ui.js', assistant: 'assistant/js/core/ui.js' },
  { root: 'js/core/storage.js', assistant: 'assistant/js/core/storage.js' },
  { root: 'js/core/workflow.js', assistant: 'assistant/js/core/workflow.js' },
  { root: 'js/core/index.js', assistant: 'assistant/js/core/index.js' },
];

// Files/patterns that are EXPECTED to differ between projects
const INTENTIONAL_DIFF_PATTERNS = [
  // === LLM PROMPTS (document-type specific) ===
  /^prompts\//,
  /^templates\//,
  /^validator\/js\/prompts\.js$/,
  /^assistant\/js\/prompts\.js$/,
  /^js\/prompts\.js$/,

  // === PROJECT IDENTITY (contains project name/title) ===
  /^README\.md$/,
  /^CONTRIBUTING\.md$/,
  /^Agents\.md$/,           // Contains project-specific AI guidance
  /^CLAUDE\.md$/,           // Contains project-specific instructions
  /^LICENSE$/,
  /^\.env\.example$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  // NOTE: AGENT.md, CODEX.md, COPILOT.md, GEMINI.md, ADOPT-PROMPT.md are
  // intentionally NOT listed here - they are identical across all projects
  // and should be in MUST_MATCH category

  // === HTML FILES (contain project title in <title> tag) ===
  /^index\.html$/,
  /^assistant\/index\.html$/,
  /^validator\/index\.html$/,

  // === DOCUMENT-TYPE SPECIFIC CODE ===
  // AI mock data (generates fake document content)
  /^js\/ai-mock\.js$/,
  /^assistant\/js\/ai-mock\.js$/,
  // Type definitions (document schema)
  /^js\/types\.js$/,
  /^assistant\/js\/types\.js$/,
  // Validator logic (document-specific validation rules)
  /^validator\/js\/validator\.js$/,
  // Deploy scripts (contain project-specific paths/names)
  /^scripts\/deploy-web\.sh$/,

  // === TEST DATA (document-type specific) ===
  /^validator\/testdata\//,
  /^data\//,

  // === TESTS FOR DOCUMENT-SPECIFIC CODE ===
  // Tests for app (contains project-specific terminology like "ADRs" vs "proposals")
  /^assistant\/tests\/app\.test\.js$/,
  // Tests for ai-mock (tests mock document content)
  /^assistant\/tests\/ai-mock\.test\.js$/,
  /^tests\/ai-mock\.test\.js$/,
  // Tests for prompts (tests document-specific prompts)
  /^assistant\/tests\/prompts\.test\.js$/,
  /^tests\/prompts\.test\.js$/,
  // Tests for validator (tests document-specific validation)
  /^validator\/tests\/validator\.test\.js$/,

  // === PROJECT-SPECIFIC TOOLS ===
  /^tools\//,
  /^evolutionary-optimization\//,

  // === INFRASTRUCTURE (may differ based on project language mix) ===
  // one-pager has Python files, so needs Python hooks in pre-commit
  /^\.pre-commit-config\.yaml$/,

  // === CSS (may have project-specific branding colors) ===
  // TODO: These SHOULD be identical but currently have minor diffs
  // Marking as intentional for now, but should be unified
  /^css\/styles\.css$/,
  /^assistant\/css\/styles\.css$/,

  // === STORAGE (contains project-specific DB_NAME) ===
  /^js\/storage\.js$/,
  /^assistant\/js\/storage\.js$/,
  // Storage tests (test project-specific storage behavior)
  /^assistant\/tests\/storage\.test\.js$/,
  /^validator\/tests\/storage\.test\.js$/,

  // === APP ENTRY POINT (different import patterns per project) ===
  /^js\/app\.js$/,
  /^assistant\/js\/app\.js$/,
  /^validator\/js\/app\.js$/,

  // === DOCUMENT-TYPE SPECIFIC UI LOGIC ===
  // These files contain project-specific UI rendering, workflow steps, and form fields
  // that differ based on the document type (ADR, PRD, One-Pager, etc.)
  /^js\/project-view\.js$/,
  /^assistant\/js\/project-view\.js$/,
  /^js\/views\.js$/,
  /^assistant\/js\/views\.js$/,
  /^js\/workflow\.js$/,
  /^assistant\/js\/workflow\.js$/,
  /^js\/projects\.js$/,
  /^assistant\/js\/projects\.js$/,
  /^js\/router\.js$/,
  /^assistant\/js\/router\.js$/,
  // Tests for document-type specific UI
  /^assistant\/tests\/project-view\.test\.js$/,
  /^assistant\/tests\/views\.test\.js$/,
  /^assistant\/tests\/workflow\.test\.js$/,
  /^assistant\/tests\/projects\.test\.js$/,
  /^assistant\/tests\/router\.test\.js$/,
  /^assistant\/tests\/ui\.test\.js$/,

  // === PROJECT SETUP/CONFIG (contain project-specific names and tooling) ===
  // These files have project-specific configuration (project names, dependencies, etc.)
  /^\.github\/dependabot\.yml$/,
  /^\.pre-commit-config\.yaml$/,
  /^scripts\/install-hooks\.sh$/,
  /^scripts\/lib\/common\.sh$/,
  /^scripts\/setup-linux\.sh$/,
  /^scripts\/setup-macos\.sh$/,
  /^scripts\/setup-windows-wsl\.sh$/,

  // === CONFIG FILES (differ due to validator paths in derived projects) ===
  // hello-world has no validator, so jest.config.js differs slightly
  /^jest\.config\.js$/,

  // === CI WORKFLOW (differs due to symlink handling) ===
  // Derived projects have symlinks to assistant-core/validator-core that need to be
  // resolved in CI. Hello-world doesn't have symlinks, so it has a simpler workflow.
  /^\.github\/workflows\/ci\.yml$/,

  // === ESLINT CONFIG (may differ in globals and ignore patterns) ===
  /^eslint\.config\.js$/,
];

// Directories to exclude from scanning
const EXCLUDE_DIRS = [
  'node_modules',
  'coverage',
  'test-results',
  'playwright-report',
  '.git',
  '_archive',
];

/**
 * Get MD5 hash of file contents
 */
function getFileHash(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  } catch {
    return null;
  }
}

/**
 * Check if a path is a symlink
 */
function isSymlink(filePath) {
  try {
    return fs.lstatSync(filePath).isSymbolicLink();
  } catch {
    return false;
  }
}

/**
 * Recursively get all files in a directory
 * Returns objects with { path, isSymlink } to track symlinks
 */
function getAllFiles(dir, baseDir = dir) {
  const files = [];

  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    // Check if this entry is a symlink BEFORE following it
    const entryIsSymlink = entry.isSymbolicLink();

    // Skip excluded directories
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.includes(entry.name)) continue;
      // If it's a symlink to a directory, record it as a symlink marker
      if (entryIsSymlink) {
        files.push({ path: relativePath, isSymlink: true, isDir: true });
      } else {
        files.push(...getAllFiles(fullPath, baseDir));
      }
    } else {
      files.push({ path: relativePath, isSymlink: entryIsSymlink, isDir: false });
    }
  }

  return files;
}

/**
 * Check if a file path matches intentional diff patterns
 */
function isIntentionalDiff(relativePath) {
  return INTENTIONAL_DIFF_PATTERNS.some(pattern => pattern.test(relativePath));
}

/**
 * Find test files in a project matching a filename pattern
 */
function findTestFiles(projectPath, filePattern) {
  const testFiles = [];
  const testDirs = ['tests', 'assistant/tests', 'validator/tests'];

  for (const testDir of testDirs) {
    const dir = path.join(projectPath, testDir);
    if (!fs.existsSync(dir)) continue;

    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (filePattern.test(file)) {
          testFiles.push(path.join(dir, file));
        }
      }
    } catch {
      // Skip if directory can't be read
    }
  }

  return testFiles;
}

/**
 * Count lines in a file
 */
function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n').length;
  } catch {
    return 0;
  }
}

/**
 * Check if file content matches a pattern
 */
function fileContainsPattern(filePath, pattern) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return pattern.test(content);
  } catch {
    return false;
  }
}

/**
 * Analyze validator structure across all projects
 * Detects stub validators that are missing critical functionality
 */
function analyzeValidatorStructure(genesisToolsDir) {
  const results = {
    projects: {},  // project -> { issues: [], isStub: boolean }
    summary: { projectsChecked: 0, stubValidators: 0, totalIssues: 0 }
  };

  for (const project of PROJECTS) {
    const projectPath = path.join(genesisToolsDir, project);
    const projectIssues = [];
    results.summary.projectsChecked++;

    // Check required files exist
    for (const requiredFile of VALIDATOR_STRUCTURE_REQUIREMENTS.requiredFiles) {
      const filePath = path.join(projectPath, requiredFile);
      if (!fs.existsSync(filePath)) {
        projectIssues.push({
          type: 'missing_file',
          file: requiredFile,
          message: `Missing required file: ${requiredFile}`
        });
      }
    }

    // Check minimum line counts
    for (const [file, minLines] of Object.entries(VALIDATOR_STRUCTURE_REQUIREMENTS.minLineCounts)) {
      const filePath = path.join(projectPath, file);
      if (fs.existsSync(filePath)) {
        const lineCount = countLines(filePath);
        if (lineCount < minLines) {
          projectIssues.push({
            type: 'undersized_file',
            file,
            lineCount,
            minLines,
            message: `${file} has ${lineCount} lines (minimum: ${minLines}) - likely a stub`
          });
        }
      }
    }

    // Check required HTML elements in index.html
    const indexPath = path.join(projectPath, 'validator/index.html');
    if (fs.existsSync(indexPath)) {
      for (const element of VALIDATOR_STRUCTURE_REQUIREMENTS.requiredHtmlElements) {
        if (!fileContainsPattern(indexPath, element.pattern)) {
          projectIssues.push({
            type: 'missing_html_element',
            file: 'validator/index.html',
            element: element.description,
            message: `Missing UI element: ${element.description}`
          });
        }
      }
    }

    // Check required functions in app.js
    const appPath = path.join(projectPath, 'validator/js/app.js');
    if (fs.existsSync(appPath)) {
      for (const func of VALIDATOR_STRUCTURE_REQUIREMENTS.requiredAppFunctions) {
        if (!fileContainsPattern(appPath, func.pattern)) {
          projectIssues.push({
            type: 'missing_function',
            file: 'validator/js/app.js',
            function: func.description,
            message: `Missing function: ${func.description}`
          });
        }
      }
    }

    // Determine if this is a stub validator (3+ issues = stub)
    const isStub = projectIssues.length >= 3;

    results.projects[project] = {
      issues: projectIssues,
      isStub,
      issueCount: projectIssues.length
    };

    if (isStub) {
      results.summary.stubValidators++;
    }
    results.summary.totalIssues += projectIssues.length;
  }

  return results;
}

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
        try {
          const content = fs.readFileSync(testFile, 'utf-8');
          // Check if any code pattern matches
          if (pattern.codePatterns.some(regex => regex.test(content))) {
            found = true;
            break;
          }
        } catch {
          // Skip if file can't be read
        }
      }

      if (found) {
        results.patterns[pattern.name].hasPattern.push(project);
      } else {
        results.patterns[pattern.name].missingPattern.push(project);
      }
    }

    // Track gaps: if SOME projects have it but not ALL, it's a gap
    if (results.patterns[pattern.name].missingPattern.length > 0 &&
        results.patterns[pattern.name].hasPattern.length > 0) {
      results.summary.patternsWithGaps++;
    }
  }

  return results;
}

/**
 * Check internal consistency within each project.
 * Files in js/ and assistant/js/ should be identical.
 * This catches the common bug where changes are made to one copy but not the other.
 */
function analyzeInternalConsistency(genesisToolsDir) {
  const results = {
    summary: { projectsChecked: 0, projectsWithIssues: 0, totalDivergentPairs: 0 },
    projects: {}
  };

  for (const project of PROJECTS) {
    const projectPath = path.join(genesisToolsDir, project);
    const projectIssues = [];
    results.summary.projectsChecked++;

    for (const pair of INTERNAL_CONSISTENCY_PAIRS) {
      const rootPath = path.join(projectPath, pair.root);
      const assistantPath = path.join(projectPath, pair.assistant);

      // Only check if BOTH files exist
      if (fs.existsSync(rootPath) && fs.existsSync(assistantPath)) {
        const rootHash = getFileHash(rootPath);
        const assistantHash = getFileHash(assistantPath);

        if (rootHash !== assistantHash) {
          projectIssues.push({
            rootFile: pair.root,
            assistantFile: pair.assistant,
            rootHash: rootHash.substring(0, 8),
            assistantHash: assistantHash.substring(0, 8)
          });
          results.summary.totalDivergentPairs++;
        }
      }
    }

    if (projectIssues.length > 0) {
      results.projects[project] = projectIssues;
      results.summary.projectsWithIssues++;
    }
  }

  return results;
}

/**
 * Main diff function
 */
function diffProjects(genesisToolsDir) {
  // Collect all unique file paths across all projects
  // Now stores { path, isSymlink, isDir } objects per project
  const allFilePaths = new Set();
  const projectFileMap = {};  // project -> Map<path, {isSymlink, isDir}>

  for (const project of PROJECTS) {
    const projectPath = path.join(genesisToolsDir, project);
    const fileObjs = getAllFiles(projectPath);
    projectFileMap[project] = new Map();
    for (const fileObj of fileObjs) {
      projectFileMap[project].set(fileObj.path, { isSymlink: fileObj.isSymlink, isDir: fileObj.isDir });
      allFilePaths.add(fileObj.path);
    }
  }

  // Analyze each file
  const results = {
    mustMatch: { identical: [], divergent: [] },
    intentionalDiff: [],
    projectSpecific: [],
    symlinkIssues: [],  // NEW: Track symlink vs regular file discrepancies
    summary: { total: 0, identical: 0, divergent: 0, intentional: 0, projectSpecific: 0, symlinkIssues: 0 }
  };

  for (const filePath of [...allFilePaths].sort()) {
    results.summary.total++;

    // Get hash and symlink status for each project that has this file
    const hashes = {};
    const symlinkStatus = {};
    const projectsWithFile = [];

    for (const project of PROJECTS) {
      if (projectFileMap[project].has(filePath)) {
        const fileInfo = projectFileMap[project].get(filePath);
        const fullPath = path.join(genesisToolsDir, project, filePath);

        // For symlinks to directories, we can't hash - mark specially
        if (fileInfo.isSymlink && fileInfo.isDir) {
          hashes[project] = 'SYMLINK_DIR';
        } else {
          hashes[project] = getFileHash(fullPath);
        }
        symlinkStatus[project] = fileInfo.isSymlink;
        projectsWithFile.push(project);
      }
    }

    // Check for symlink vs regular file discrepancy
    const symlinkValues = Object.values(symlinkStatus);
    const hasSymlinkMix = symlinkValues.includes(true) && symlinkValues.includes(false);

    if (hasSymlinkMix) {
      // STRUCTURAL DIVERGENCE: some projects use symlinks, others don't
      const symlinkedProjects = Object.entries(symlinkStatus).filter(([_, v]) => v).map(([k]) => k);
      const regularProjects = Object.entries(symlinkStatus).filter(([_, v]) => !v).map(([k]) => k);
      results.symlinkIssues.push({
        path: filePath,
        symlinkedIn: symlinkedProjects,
        regularIn: regularProjects
      });
      results.summary.symlinkIssues++;
      continue;  // Don't double-count as divergent
    }

    // Categorize the file
    if (projectsWithFile.length < PROJECTS.length) {
      // File doesn't exist in all projects
      results.projectSpecific.push({
        path: filePath,
        existsIn: projectsWithFile,
        missingFrom: PROJECTS.filter(p => !projectsWithFile.includes(p))
      });
      results.summary.projectSpecific++;
    } else if (isIntentionalDiff(filePath)) {
      // Expected to differ
      const uniqueHashes = [...new Set(Object.values(hashes))];
      results.intentionalDiff.push({
        path: filePath,
        uniqueVersions: uniqueHashes.length,
        hashes
      });
      results.summary.intentional++;
    } else {
      // MUST match - check if all hashes are identical
      const uniqueHashes = [...new Set(Object.values(hashes))];
      if (uniqueHashes.length === 1) {
        results.mustMatch.identical.push({ path: filePath, hash: uniqueHashes[0] });
        results.summary.identical++;
      } else {
        results.mustMatch.divergent.push({ path: filePath, hashes });
        results.summary.divergent++;
      }
    }
  }

  // Analyze test coverage for critical patterns
  results.testCoverage = analyzeTestCoverage(genesisToolsDir);

  // Analyze validator structure for stub detection
  results.validatorStructure = analyzeValidatorStructure(genesisToolsDir);

  // Analyze internal consistency (js/ vs assistant/js/)
  results.internalConsistency = analyzeInternalConsistency(genesisToolsDir);

  return results;
}

/**
 * Format console report
 */
function formatConsoleReport(results) {
  const lines = [];
  const red = (s) => `\x1b[31m${s}\x1b[0m`;
  const green = (s) => `\x1b[32m${s}\x1b[0m`;
  const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
  const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
  const bold = (s) => `\x1b[1m${s}\x1b[0m`;

  lines.push('');
  lines.push(bold('═══════════════════════════════════════════════════════════════'));
  lines.push(bold('  GENESIS PROJECT DIFF REPORT'));
  lines.push(bold('═══════════════════════════════════════════════════════════════'));
  lines.push('');

  // Summary
  const magenta = (s) => `\x1b[35m${s}\x1b[0m`;
  const orange = (s) => `\x1b[38;5;208m${s}\x1b[0m`;
  lines.push(bold('SUMMARY'));
  lines.push(`  Total files scanned: ${results.summary.total}`);
  lines.push(`  ${green('✓')} Identical (MUST_MATCH): ${results.summary.identical}`);
  lines.push(`  ${red('✗')} Divergent (MUST_MATCH): ${results.summary.divergent}`);
  if (results.summary.symlinkIssues > 0) {
    lines.push(`  ${magenta('⚡')} Symlink structural issues: ${results.summary.symlinkIssues}`);
  }
  if (results.validatorStructure && results.validatorStructure.summary.stubValidators > 0) {
    lines.push(`  ${orange('🔧')} Stub validators: ${results.validatorStructure.summary.stubValidators}`);
  }
  if (results.testCoverage && results.testCoverage.summary.patternsWithGaps > 0) {
    lines.push(`  ${red('🔍')} Test coverage gaps: ${results.testCoverage.summary.patternsWithGaps}`);
  }
  if (results.internalConsistency && results.internalConsistency.summary.totalDivergentPairs > 0) {
    lines.push(`  ${red('🔀')} Internal consistency issues: ${results.internalConsistency.summary.totalDivergentPairs} divergent file pairs`);
  }
  lines.push(`  ${yellow('~')} Intentional differences: ${results.summary.intentional}`);
  lines.push(`  ${cyan('?')} Project-specific: ${results.summary.projectSpecific}`);
  lines.push('');

  // CRITICAL: Divergent files that MUST match
  if (results.mustMatch.divergent.length > 0) {
    lines.push(red(bold('🚨 CRITICAL: DIVERGENT FILES (MUST BE IDENTICAL)')));
    lines.push(red('─'.repeat(60)));

    for (const file of results.mustMatch.divergent) {
      lines.push('');
      lines.push(red(`  ${file.path}`));

      // Group projects by hash
      const hashGroups = {};
      for (const [project, hash] of Object.entries(file.hashes)) {
        if (!hashGroups[hash]) hashGroups[hash] = [];
        hashGroups[hash].push(project);
      }

      let groupNum = 1;
      for (const [hash, projects] of Object.entries(hashGroups)) {
        lines.push(`    Version ${groupNum} (${hash.slice(0, 8)}...): ${projects.join(', ')}`);
        groupNum++;
      }
    }
    lines.push('');
  }

  // INTERNAL CONSISTENCY: js/ vs assistant/js/ divergence within projects
  if (results.internalConsistency && results.internalConsistency.summary.totalDivergentPairs > 0) {
    lines.push(red(bold('🔀 CRITICAL: INTERNAL CONSISTENCY ISSUES (js/ vs assistant/js/)')));
    lines.push(red('─'.repeat(60)));
    lines.push('');
    lines.push('  Files in js/ and assistant/js/ MUST be identical within each project.');
    lines.push('  ROOT index.html loads from js/, assistant/index.html loads from assistant/js/.');
    lines.push('  Divergence causes different behavior depending on entry point!');
    lines.push('');

    for (const [project, issues] of Object.entries(results.internalConsistency.projects)) {
      lines.push(red(`  ${project}:`));
      for (const issue of issues) {
        lines.push(`    ${issue.rootFile} (${issue.rootHash}) ≠ ${issue.assistantFile} (${issue.assistantHash})`);
      }
      lines.push('');
    }
  }

  // SYMLINK ISSUES: Some projects use symlinks, others use regular files
  if (results.symlinkIssues && results.symlinkIssues.length > 0) {
    const magenta = (s) => `\x1b[35m${s}\x1b[0m`;
    lines.push(magenta(bold('⚡ STRUCTURAL: SYMLINK VS REGULAR FILE MISMATCH')));
    lines.push(magenta('─'.repeat(60)));
    lines.push('');
    lines.push('  These paths are symlinks in some projects but regular files in others.');
    lines.push('  This is a structural divergence that should be unified.');
    lines.push('');

    for (const issue of results.symlinkIssues) {
      lines.push(magenta(`  ${issue.path}`));
      lines.push(`    Symlink in: ${issue.symlinkedIn.join(', ')}`);
      lines.push(`    Regular in: ${issue.regularIn.join(', ')}`);
    }
    lines.push('');
  }

  // TEST COVERAGE GAPS: Critical test patterns missing from some projects
  if (results.testCoverage && results.testCoverage.summary.patternsWithGaps > 0) {
    lines.push(red(bold('🔍 TEST COVERAGE GAPS (critical patterns missing in some projects)')));
    lines.push(red('─'.repeat(60)));
    lines.push('');
    lines.push('  If a test pattern exists in ANY project, it should exist in ALL.');
    lines.push('');

    for (const [name, data] of Object.entries(results.testCoverage.patterns)) {
      if (data.missingPattern.length > 0 && data.hasPattern.length > 0) {
        lines.push(red(`  ${name}: ${data.description}`));
        lines.push(green(`    ✓ Has tests: ${data.hasPattern.join(', ')}`));
        lines.push(red(`    ✗ Missing:   ${data.missingPattern.join(', ')}`));
        lines.push('');
      }
    }
  }

  // STUB VALIDATORS: Validators missing critical functionality
  if (results.validatorStructure && results.validatorStructure.summary.stubValidators > 0) {
    lines.push(orange(bold('🔧 STUB VALIDATORS (missing critical functionality)')));
    lines.push(orange('─'.repeat(60)));
    lines.push('');
    lines.push('  These validators are incomplete stubs that need to be replaced');
    lines.push('  with full implementations based on one-pager reference.');
    lines.push('');

    for (const [project, data] of Object.entries(results.validatorStructure.projects)) {
      if (data.isStub) {
        lines.push(orange(`  ${project} (${data.issueCount} issues):`));
        // Show first 5 issues
        for (const issue of data.issues.slice(0, 5)) {
          lines.push(red(`    ✗ ${issue.message}`));
        }
        if (data.issues.length > 5) {
          lines.push(`    ... and ${data.issues.length - 5} more issues`);
        }
        lines.push('');
      }
    }
  }

  // Project-specific files (might indicate missing files)
  if (results.projectSpecific.length > 0) {
    lines.push(yellow(bold('⚠️  PROJECT-SPECIFIC FILES (not in all projects)')));
    lines.push(yellow('─'.repeat(60)));

    // Group by which projects have the file
    const byPattern = {};
    for (const file of results.projectSpecific) {
      const key = file.existsIn.sort().join(',');
      if (!byPattern[key]) byPattern[key] = [];
      byPattern[key].push(file.path);
    }

    for (const [projects, files] of Object.entries(byPattern)) {
      lines.push('');
      lines.push(`  Exists in: ${projects}`);
      for (const f of files.slice(0, 10)) {
        lines.push(`    - ${f}`);
      }
      if (files.length > 10) {
        lines.push(`    ... and ${files.length - 10} more`);
      }
    }
    lines.push('');
  }

  // Final verdict
  lines.push(bold('═══════════════════════════════════════════════════════════════'));
  const symlinkCount = results.summary.symlinkIssues || 0;
  const coverageGaps = results.testCoverage?.summary?.patternsWithGaps || 0;
  const stubValidators = results.validatorStructure?.summary?.stubValidators || 0;
  const internalIssues = results.internalConsistency?.summary?.totalDivergentPairs || 0;

  if (results.summary.divergent === 0 && symlinkCount === 0 && coverageGaps === 0 && stubValidators === 0 && internalIssues === 0) {
    lines.push(green(bold('  ✓ ALL MUST-MATCH FILES ARE IDENTICAL')));
    lines.push(green(bold('  ✓ NO INTERNAL CONSISTENCY ISSUES')));
    lines.push(green(bold('  ✓ NO TEST COVERAGE GAPS DETECTED')));
    lines.push(green(bold('  ✓ NO STUB VALIDATORS DETECTED')));
  } else {
    if (results.summary.divergent > 0) {
      lines.push(red(bold(`  ✗ ${results.summary.divergent} FILES HAVE DIVERGED - FIX REQUIRED`)));
    }
    if (internalIssues > 0) {
      lines.push(red(bold(`  🔀 ${internalIssues} INTERNAL CONSISTENCY ISSUES - js/ vs assistant/js/ DIVERGED`)));
    }
    if (symlinkCount > 0) {
      lines.push(magenta(bold(`  ⚡ ${symlinkCount} SYMLINK STRUCTURAL ISSUES - UNIFY REQUIRED`)));
    }
    if (stubValidators > 0) {
      lines.push(orange(bold(`  🔧 ${stubValidators} STUB VALIDATORS - REPLACE WITH FULL IMPLEMENTATION`)));
    }
    if (coverageGaps > 0) {
      lines.push(red(bold(`  🔍 ${coverageGaps} TEST COVERAGE GAPS - ADD MISSING TESTS`)));
    }
  }
  lines.push(bold('═══════════════════════════════════════════════════════════════'));
  lines.push('');

  return lines.join('\n');
}

/**
 * CLI entry point
 */
function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes('--json');
  const ciMode = args.includes('--ci');

  // Find genesis-tools directory
  const genesisToolsDir = path.resolve(__dirname, '..', '..');

  const results = diffProjects(genesisToolsDir);

  if (jsonOutput) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log(formatConsoleReport(results));
  }

  // CI mode: exit 1 if divergent files, symlink issues, test coverage gaps, stub validators, OR internal consistency issues exist
  const coverageGapsCount = results.testCoverage?.summary?.patternsWithGaps || 0;
  const stubValidatorsCount = results.validatorStructure?.summary?.stubValidators || 0;
  const internalIssuesCount = results.internalConsistency?.summary?.totalDivergentPairs || 0;
  if (ciMode && (
    results.summary.divergent > 0 ||
    results.summary.symlinkIssues > 0 ||
    coverageGapsCount > 0 ||
    stubValidatorsCount > 0 ||
    internalIssuesCount > 0
  )) {
    process.exit(1);
  }
}

// Run if executed directly
if (process.argv[1] === __filename) {
  main();
}

export { diffProjects, PROJECTS, INTENTIONAL_DIFF_PATTERNS, formatConsoleReport };

