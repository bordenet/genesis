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

// All 9 projects (8 derived + hello-world baseline)
const PROJECTS = [
  'acceptance-criteria-assistant',
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
      /describe\s*\(\s*['"`]exportProject/i,  // Matches exportProject, exportProjectAsMarkdown, etc.
      /test\s*\(\s*['"`].*exportProject/i,
      /it\s*\(\s*['"`].*exportProject/i,
      /test\s*\(\s*['"`].*export.*project/i,  // Matches "export project as markdown", etc.
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
      /describe\s*\(\s*['"`]exportAll/i,  // Matches 'exportAll', 'exportAll and importAll', etc.
      /test\s*\(\s*['"`].*exportAll/i,
      /it\s*\(\s*['"`].*exportAll/i,
      /test\s*\(\s*['"`].*exports? all/i,  // Matches 'exports all projects', 'export all', etc.
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
// SHARED LIBRARY NAMING REQUIREMENTS
// ============================================================================
// Shared library files MUST use generic function names, not document-specific names.
// This catches anti-patterns like validateProposal, validateOnePager, validateADR
// that should instead be validateDocument.
//
// WHY: Document-specific names in shared libraries create arbitrary variation,
// prevent MUST_MATCH file consistency, and are a source of bugs.

// Document-specific terms that should NOT appear in shared library function names
const DOCUMENT_SPECIFIC_TERMS = [
  'Proposal',           // validateProposal, exportProposal, etc.
  'OnePager',           // validateOnePager
  'ADR',                // validateADR
  'PRFAQ',              // validatePRFAQ
  'PRD',                // validatePRD (but NOT PRDGenerated which is different)
  'PowerStatement',     // validatePowerStatement
  'StrategicProposal',  // validateStrategicProposal
  'AcceptanceCriteria', // validateAcceptanceCriteria
  'JobDescription',     // validateJobDescription
];

// Shared library files that MUST use generic function names
// NOTE: validator-inline.js was REMOVED from this list on 2026-02-06.
// It previously caused a bug where the AI would copy generic scoring functions
// from hello-world, but validator-inline.js MUST have document-specific scoring
// that matches validator.js. See INTENTIONAL_DIFF_PATTERNS for validator-inline.js.
const SHARED_LIBRARY_FILES = [
  // Note: jd-assistant uses jd-validator.js which is project-specific by design
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

// ============================================================================
// DOMAIN BLEED-OVER DETECTION
// ============================================================================
// Each project should ONLY contain terminology specific to its domain.
// Terms from other project domains bleeding into a project indicate
// the template was not properly customized during project creation.
//
// Example: "dealership" appearing in jd-assistant means strategic-proposal
// content bled over during template copying.

// Files to scan for domain bleed-over (these contain domain-specific content)
const BLEED_OVER_FILES = [
  'assistant/js/prompts.js',
  'assistant/js/views.js',
  'assistant/js/projects.js',
  'assistant/js/types.js',
  'assistant/js/workflow.js',
  'js/prompts.js',
  'js/views.js',
  'js/projects.js',
  'js/types.js',
  'js/workflow.js',
  'prompts/phase1.md',
  'prompts/phase2.md',
  'prompts/phase3.md',
];

// Domain-specific terms that should ONLY appear in their respective projects
// Format: project -> { bannedTerms: [terms from OTHER domains that should NOT appear] }
// Note: hello-world is excluded - it uses generic placeholders intentionally
const DOMAIN_BLEED_OVER = {
  'acceptance-criteria-assistant': {
    ownTerms: ['acceptance criteria', 'Linear', 'issue', 'testable', 'checklist'],
    bannedTerms: ['dealership', 'DEALERSHIP_NAME', 'DEALERSHIP_LOCATION', 'STORE_COUNT', 'CURRENT_VENDOR', 'proposalId']
  },
  'strategic-proposal': {
    // Strategic proposal owns these terms - they should NOT appear in other projects
    ownTerms: ['dealership', 'DEALERSHIP_NAME', 'DEALERSHIP_LOCATION', 'STORE_COUNT', 'CURRENT_VENDOR'],
    // No banned terms - this is the "source" domain that was bleeding over
    bannedTerms: []
  },
  'jd-assistant': {
    ownTerms: ['job description', 'responsibilities', 'qualifications', 'experience required'],
    // Ban 'proposalId' (code artifact) but not 'proposal' (could be legitimate context)
    bannedTerms: ['dealership', 'DEALERSHIP_NAME', 'DEALERSHIP_LOCATION', 'STORE_COUNT', 'CURRENT_VENDOR', 'proposalId']
  },
  'one-pager': {
    ownTerms: ['one-pager', 'executive summary'],
    bannedTerms: ['dealership', 'DEALERSHIP_NAME', 'DEALERSHIP_LOCATION', 'STORE_COUNT', 'CURRENT_VENDOR']
  },
  'power-statement-assistant': {
    ownTerms: ['power statement', 'achievement', 'impact'],
    // Note: 'proposal' is NOT banned because power statements are legitimately used in proposals
    bannedTerms: ['dealership', 'DEALERSHIP_NAME', 'DEALERSHIP_LOCATION', 'STORE_COUNT', 'CURRENT_VENDOR', 'proposalId']
  },
  'pr-faq-assistant': {
    ownTerms: ['press release', 'FAQ', 'frequently asked'],
    bannedTerms: ['dealership', 'DEALERSHIP_NAME', 'DEALERSHIP_LOCATION', 'STORE_COUNT', 'CURRENT_VENDOR']
  },
  'product-requirements-assistant': {
    ownTerms: ['PRD', 'product requirements', 'user story', 'acceptance criteria'],
    bannedTerms: ['dealership', 'DEALERSHIP_NAME', 'DEALERSHIP_LOCATION', 'STORE_COUNT', 'CURRENT_VENDOR']
  },
  'architecture-decision-record': {
    ownTerms: ['ADR', 'architecture decision', 'decision drivers', 'considered options'],
    // Ban 'proposalId' (code artifact) but not 'proposal' (could be legitimate context)
    bannedTerms: ['dealership', 'DEALERSHIP_NAME', 'DEALERSHIP_LOCATION', 'STORE_COUNT', 'CURRENT_VENDOR', 'proposalId']
  },
  // hello-world is intentionally excluded - it contains generic placeholders
};

// ============================================================================
// FUNCTION SIGNATURE CONSISTENCY
// ============================================================================
// Boilerplate files that MUST have identical exported function signatures across all projects.
// This catches bugs like confirm(title, message) vs confirm(message, title) mismatches.
// The function BODY can differ (for intentional diff files), but the SIGNATURE must match.
const SIGNATURE_CHECK_FILES = [
  // Core UI functions - these are called from multiple places
  'assistant/js/ui.js',
  'js/ui.js',
  // Storage functions - critical for data consistency
  'assistant/js/storage.js',
  'js/storage.js',
  // Project management functions
  'assistant/js/projects.js',
  'js/projects.js',
  // Workflow functions
  'assistant/js/workflow.js',
  'js/workflow.js',
  // NOTE: router.js is in INTENTIONAL_DIFF - signature differs by project
  // because it imports from views.js which has different exports per project
  // Error handler functions
  'assistant/js/error-handler.js',
  'js/error-handler.js',
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
  // Router (imports from views.js which differs per project)
  /^js\/router\.js$/,
  /^assistant\/js\/router\.js$/,
  // Document-specific templates (one-pager templates, PR FAQ templates, etc.)
  /^js\/document-specific-templates\.js$/,
  /^assistant\/js\/document-specific-templates\.js$/,
  /^assistant\/tests\/document-specific-templates\.test\.js$/,
  // Validator logic (document-specific validation rules)
  /^validator\/js\/validator\.js$/,
  /^js\/validator\.js$/,  // Root copy of validator/js/validator.js
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
  // Smoke tests (jd-assistant uses jd-validator.js instead of validator-inline.js,
  // so its smoke.test.js has different validator export checks)
  /^assistant\/tests\/smoke\.test\.js$/,

  // === INLINE VALIDATOR (document-specific scoring - MUST MATCH validator.js) ===
  // CRITICAL: validator-inline.js MUST have document-specific scoring functions
  // that align with validator.js. Each project has different scoring dimensions
  // (e.g., scoreProblemClarity for business-justification, scoreExecutiveSummary for one-pager).
  // Generic functions like scoreDocumentStructure will cause score discrepancies
  // between the Assistant (which uses validator-inline.js) and the Validator tool.
  /^assistant\/js\/validator-inline\.js$/,
  /^js\/validator-inline\.js$/,
  // Tests for inline validator (tests document-specific inline validation)
  /^assistant\/tests\/validator-inline\.test\.js$/,

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
 * Analyze domain bleed-over across all projects.
 * Detects when domain-specific terms from one project type (e.g., strategic-proposal)
 * appear in another project (e.g., jd-assistant).
 * This indicates the template was not properly customized during project creation.
 */
function analyzeDomainBleedOver(genesisToolsDir) {
  const results = {
    summary: { projectsChecked: 0, projectsWithIssues: 0, totalBleedOverTerms: 0 },
    projects: {}
  };

  for (const project of PROJECTS) {
    // Skip hello-world - it uses generic placeholders intentionally
    if (project.includes('hello-world')) {
      continue;
    }

    const config = DOMAIN_BLEED_OVER[project];
    if (!config || config.bannedTerms.length === 0) {
      continue;  // No banned terms configured for this project
    }

    const projectPath = path.join(genesisToolsDir, project);
    const projectIssues = [];
    results.summary.projectsChecked++;

    for (const file of BLEED_OVER_FILES) {
      const filePath = path.join(projectPath, file);
      if (!fs.existsSync(filePath)) {
        continue;
      }

      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        for (const bannedTerm of config.bannedTerms) {
          // Create case-insensitive regex for the term
          const regex = new RegExp(bannedTerm, 'gi');

          lines.forEach((line, lineNum) => {
            // Skip comment lines that might be documentation about what to customize
            if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('#')) {
              // Still check - bleed-over in comments is still a problem
            }

            const matches = line.match(regex);
            if (matches) {
              projectIssues.push({
                file,
                line: lineNum + 1,
                term: bannedTerm,
                context: line.trim().substring(0, 100)
              });
              results.summary.totalBleedOverTerms++;
            }
          });
        }
      } catch {
        // Skip files that can't be read
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
 * Extract exported function signatures from a JavaScript file.
 * Returns array of { name, signature, line } objects.
 * Signature includes function name and parameters but not body.
 */
function extractFunctionSignatures(filePath) {
  const signatures = [];

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Patterns to match exported functions
    // export function name(params) {
    // export async function name(params) {
    // export const name = (params) => {
    // export const name = async (params) => {
    // export const name = function(params) {
    const patterns = [
      // export function name(params)
      /^export\s+(async\s+)?function\s+(\w+)\s*\(([^)]*)\)/,
      // export const name = (params) =>
      /^export\s+const\s+(\w+)\s*=\s*(async\s+)?\(([^)]*)\)\s*=>/,
      // export const name = function(params)
      /^export\s+const\s+(\w+)\s*=\s*(async\s+)?function\s*\(([^)]*)\)/,
    ];

    lines.forEach((line, lineNum) => {
      const trimmedLine = line.trim();

      for (const pattern of patterns) {
        const match = trimmedLine.match(pattern);
        if (match) {
          let name, params, isAsync;

          if (pattern.source.includes('function\\s+(\\w+)')) {
            // export [async] function name(params)
            isAsync = !!match[1];
            name = match[2];
            params = match[3];
          } else {
            // export const name = [async] (params) => or function(params)
            name = match[1];
            isAsync = !!match[2];
            params = match[3];
          }

          // Normalize params: remove extra whitespace, keep defaults
          const normalizedParams = params
            .split(',')
            .map(p => p.trim())
            .filter(p => p.length > 0)
            .join(', ');

          signatures.push({
            name,
            params: normalizedParams,
            isAsync,
            signature: `${isAsync ? 'async ' : ''}function ${name}(${normalizedParams})`,
            line: lineNum + 1
          });
          break;
        }
      }
    });
  } catch {
    // File doesn't exist or can't be read
  }

  return signatures;
}

/**
 * Analyze function signature consistency across all projects.
 * Detects when the same exported function has different signatures in different projects.
 * This catches bugs like confirm(title, message) vs confirm(message, title).
 */
function analyzeFunctionSignatures(genesisToolsDir) {
  const results = {
    summary: { filesChecked: 0, functionsChecked: 0, signatureMismatches: 0 },
    mismatches: [],  // Array of { functionName, file, signatures: { project: signature } }
    allSignatures: {}  // file -> functionName -> { project: signature }
  };

  for (const file of SIGNATURE_CHECK_FILES) {
    const fileSignatures = {};  // functionName -> { project: { signature, line } }
    let fileExists = false;

    for (const project of PROJECTS) {
      const filePath = path.join(genesisToolsDir, project, file);
      const signatures = extractFunctionSignatures(filePath);

      if (signatures.length > 0) {
        fileExists = true;
        for (const sig of signatures) {
          if (!fileSignatures[sig.name]) {
            fileSignatures[sig.name] = {};
          }
          fileSignatures[sig.name][project] = {
            signature: sig.signature,
            params: sig.params,
            line: sig.line
          };
        }
      }
    }

    if (fileExists) {
      results.summary.filesChecked++;
      results.allSignatures[file] = fileSignatures;

      // Check for mismatches
      for (const [funcName, projectSigs] of Object.entries(fileSignatures)) {
        results.summary.functionsChecked++;

        const uniqueSignatures = [...new Set(Object.values(projectSigs).map(s => s.signature))];

        if (uniqueSignatures.length > 1) {
          // MISMATCH DETECTED
          results.summary.signatureMismatches++;

          // Group projects by signature
          const signatureGroups = {};
          for (const [project, sigInfo] of Object.entries(projectSigs)) {
            if (!signatureGroups[sigInfo.signature]) {
              signatureGroups[sigInfo.signature] = [];
            }
            signatureGroups[sigInfo.signature].push({ project, line: sigInfo.line });
          }

          results.mismatches.push({
            functionName: funcName,
            file,
            signatureGroups,
            uniqueSignatures
          });
        }
      }
    }
  }

  return results;
}

/**
 * Analyze URL self-reference issues in project-view.js files.
 * Detects when a project uses absolute URLs that reference a DIFFERENT project.
 * Relative URLs (../validator/) are acceptable and encouraged.
 * Returns summary and detailed issues per project.
 */
function analyzeURLSelfReference(genesisToolsDir) {
  const results = {
    summary: { projectsChecked: 0, projectsWithIssues: 0, totalURLIssues: 0 },
    projects: {}
  };

  for (const project of PROJECTS) {
    const projectPath = path.join(genesisToolsDir, project);
    const projectViewPath = path.join(projectPath, 'assistant/js/project-view.js');

    if (!fs.existsSync(projectViewPath)) {
      continue;
    }

    results.summary.projectsChecked++;
    const issues = [];

    try {
      const content = fs.readFileSync(projectViewPath, 'utf-8');
      const lines = content.split('\n');

      // Get the actual project name (strip path prefix for hello-world)
      const actualProject = project.includes('hello-world') ? 'hello-world' : project;

      lines.forEach((line, lineNum) => {
        // Pattern to match bordenet.github.io URLs with project name
        const linePattern = /bordenet\.github\.io\/([a-zA-Z0-9_-]+)\//g;
        let match;
        while ((match = linePattern.exec(line)) !== null) {
          const urlProject = match[1];
          if (urlProject !== actualProject) {
            issues.push({
              line: lineNum + 1,
              urlProject,
              actualProject,
              context: line.trim().substring(0, 100)
            });
            results.summary.totalURLIssues++;
          }
        }
      });
    } catch {
      // Skip files that can't be read
    }

    if (issues.length > 0) {
      results.projects[project] = issues;
      results.summary.projectsWithIssues++;
    }
  }

  return results;
}

/**
 * Analyze template customization issues in all projects.
 * Detects the 8 documented hello-world template issues:
 * 1. Hardcoded "Hello World" text not replaced by sed
 * 2. ROOT index.html footer with placeholder href="#" links
 * 3. ROOT index.html tagline says "2-phase" instead of privacy tagline
 * 4. Standalone Compare Phases button (outdated UI pattern)
 * 5. About modal with hardcoded "Strategic Proposal Generator" text
 * 6. Attribution URL placeholder ({{GITHUB_USER}}) in workflow.js
 * 7. Full Validation button has wrong styling (outline vs solid)
 * 8. ROOT js/project-view.js uses ../validator/ which resolves incorrectly
 *
 * Returns summary and detailed issues per project.
 */
function analyzeTemplateCustomization(genesisToolsDir) {
  const results = {
    summary: { projectsChecked: 0, projectsWithIssues: 0, totalIssues: 0 },
    projects: {}
  };

  for (const project of PROJECTS) {
    // Skip hello-world for some checks - it's the template, not a derived project
    const isTemplate = project.includes('hello-world');
    const projectPath = path.join(genesisToolsDir, project);
    const issues = [];
    results.summary.projectsChecked++;

    // === ISSUE 1: Hardcoded "Hello World" text ===
    // Skip this check for hello-world template itself
    if (!isTemplate) {
      const filesToCheck = ['index.html', 'assistant/index.html'];
      for (const file of filesToCheck) {
        const filePath = path.join(projectPath, file);
        if (fs.existsSync(filePath)) {
          try {
            const content = fs.readFileSync(filePath, 'utf-8');
            if (/Hello\s+World/i.test(content)) {
              issues.push({
                type: 'hardcoded_template_text',
                file,
                message: 'Contains hardcoded "Hello World" text - not replaced during project creation'
              });
            }
          } catch {}
        }
      }
    }

    // === ISSUE 2: ROOT index.html footer with placeholder href="#" ===
    const rootIndexPath = path.join(projectPath, 'index.html');
    if (fs.existsSync(rootIndexPath)) {
      try {
        const content = fs.readFileSync(rootIndexPath, 'utf-8');
        // Look for href="#" that are NOT id="about-link" (which is valid)
        // Pattern: href="#" but not followed by about-link context
        const lines = content.split('\n');
        lines.forEach((line, lineNum) => {
          // Skip about-link which legitimately uses href="#"
          if (line.includes('href="#"') && !line.includes('about-link')) {
            // Also skip any that look like internal anchors
            if (!line.includes('href="#about"') && !line.includes('href="#top"')) {
              issues.push({
                type: 'placeholder_href',
                file: 'index.html',
                line: lineNum + 1,
                message: 'ROOT index.html has placeholder href="#" - should link to actual project URLs'
              });
            }
          }
        });
      } catch {}
    }

    // === ISSUE 3: ROOT index.html tagline says "2-phase" instead of privacy tagline ===
    if (fs.existsSync(rootIndexPath)) {
      try {
        const content = fs.readFileSync(rootIndexPath, 'utf-8');
        if (/2-phase/i.test(content) && !content.includes('Privacy-First')) {
          issues.push({
            type: 'wrong_tagline',
            file: 'index.html',
            message: 'ROOT index.html has old "2-phase" tagline - should use privacy-first tagline'
          });
        }
      } catch {}
    }

    // === ISSUE 4: Standalone Compare Phases button (outdated UI pattern) ===
    // The Compare Phases button should NOT appear in the completion banner.
    // It's acceptable in the hamburger menu (dynamically rendered), but NOT as a
    // standalone button between "Preview & Copy" and "Full Validation".
    // Check HTML files for hardcoded Compare Phases buttons
    const htmlFiles = ['index.html', 'assistant/index.html'];
    for (const file of htmlFiles) {
      const filePath = path.join(projectPath, file);
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          if (/compare-phases-btn|>Compare\s+Phases<|"Compare Phases"/i.test(content)) {
            issues.push({
              type: 'outdated_compare_phases',
              file,
              message: 'Contains hardcoded "Compare Phases" button in HTML - should be dynamically rendered or removed'
            });
          }
        } catch {}
      }
    }
    const projectViewFiles = ['js/project-view.js', 'assistant/js/project-view.js'];

    // Also check JavaScript files for Compare Phases button in completion banner
    // The anti-pattern is: compare-phases-btn appearing in the completionBanner template literal
    // (NOT in the hamburger menu which is acceptable)
    for (const file of projectViewFiles) {
      const filePath = path.join(projectPath, file);
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          // Look for compare-phases-btn in the completion banner area
          // The pattern: completionBanner = ` ... compare-phases-btn ... `
          // We detect this by looking for compare-phases-btn near "is Complete!" or "completionBanner"
          const completionBannerMatch = content.match(/completionBanner\s*=\s*`[\s\S]*?`;/);
          if (completionBannerMatch && /compare-phases-btn|Compare\s+Phases/.test(completionBannerMatch[0])) {
            issues.push({
              type: 'outdated_compare_phases_in_banner',
              file,
              message: 'Compare Phases button in completion banner - should only be in hamburger menu, not between Preview & Copy and Full Validation'
            });
          }
        } catch {}
      }
    }

    // === ISSUE 5: About modal with hardcoded "Strategic Proposal Generator" ===
    // Skip hello-world template - it has placeholder text
    if (!isTemplate) {
      for (const file of projectViewFiles) {
        const filePath = path.join(projectPath, file);
        if (fs.existsSync(filePath)) {
          try {
            const content = fs.readFileSync(filePath, 'utf-8');
            if (/Strategic\s+Proposal\s+Generator/i.test(content)) {
              issues.push({
                type: 'hardcoded_about_modal',
                file,
                message: 'Contains hardcoded "Strategic Proposal Generator" in About modal - should use project-specific text'
              });
            }
          } catch {}
        }
      }
    }

    // === ISSUE 6: Attribution URL placeholder ({{GITHUB_USER}}) ===
    // Skip this check for hello-world - it IS the template, so template variables are expected
    if (!isTemplate) {
      const workflowFiles = ['js/workflow.js', 'assistant/js/workflow.js'];
      for (const file of workflowFiles) {
        const filePath = path.join(projectPath, file);
        if (fs.existsSync(filePath)) {
          try {
            const content = fs.readFileSync(filePath, 'utf-8');
            if (/\{\{GITHUB_USER\}\}|\{\{GITHUB_REPO\}\}|\{\{PROJECT_TITLE\}\}/i.test(content)) {
              issues.push({
                type: 'unreplaced_template_var',
                file,
                message: 'Contains unreplaced template variables ({{GITHUB_USER}}, etc.) - sed replacement incomplete'
              });
            }
          } catch {}
        }
      }
    }

    // === ISSUE 7: Full Validation button has wrong styling (outline vs solid) ===
    // Correct: bg-blue-600 text-white (solid)
    // Wrong: border border-blue-600 text-blue-600 (outline)
    for (const file of projectViewFiles) {
      const filePath = path.join(projectPath, file);
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          // Look for validation button with outline styling
          if (/Full\s+Validation|validator.*\/?/i.test(content)) {
            // Check for wrong outline styling pattern
            if (/border\s+border-blue-600.*text-blue-600|text-blue-600.*border\s+border-blue-600/.test(content)) {
              issues.push({
                type: 'wrong_button_styling',
                file,
                message: 'Full Validation button has outline styling (border-blue-600) - should be solid (bg-blue-600 text-white)'
              });
            }
          }
        } catch {}
      }
    }

    // === ISSUE 8: ROOT js/project-view.js uses ../validator/ (wrong path) ===
    // ROOT files should use ./validator/ not ../validator/
    const rootProjectView = path.join(projectPath, 'js/project-view.js');
    if (fs.existsSync(rootProjectView)) {
      try {
        const content = fs.readFileSync(rootProjectView, 'utf-8');
        // Look for ../validator/ in href attributes (excluding comments)
        const lines = content.split('\n');
        lines.forEach((line, lineNum) => {
          // Skip comment lines
          if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;

          if (/href\s*=\s*['"]\.\.\/validator\/['"]/.test(line)) {
            issues.push({
              type: 'wrong_root_validator_path',
              file: 'js/project-view.js',
              line: lineNum + 1,
              message: 'ROOT js/project-view.js uses "../validator/" - should use "./validator/" for correct path resolution'
            });
          }
        });
      } catch {}
    }

    // Record issues for this project
    if (issues.length > 0) {
      results.projects[project] = issues;
      results.summary.projectsWithIssues++;
      results.summary.totalIssues += issues.length;
    }
  }

  return results;
}

/**
 * Analyze inline scoring presence in all projects.
 * Checks that each project has:
 * 1. A validator import in project-view.js (validate*, getScoreColor, getScoreLabel)
 * 2. A validator-inline.js or jd-validator.js file in assistant/js/
 * 3. Score display elements in the completion banner (totalScore, scoreColor)
 * Returns summary and detailed issues per project.
 */
function analyzeInlineScoringPresence(genesisToolsDir) {
  const results = {
    summary: { projectsChecked: 0, projectsWithoutScoring: 0 },
    projects: {}
  };

  for (const project of PROJECTS) {
    const projectPath = path.join(genesisToolsDir, project);
    const projectViewPath = path.join(projectPath, 'assistant/js/project-view.js');
    const issues = [];

    if (!fs.existsSync(projectViewPath)) {
      continue;
    }

    results.summary.projectsChecked++;

    try {
      const content = fs.readFileSync(projectViewPath, 'utf-8');

      // Check for validator import (various patterns)
      const hasValidatorImport = /import\s+{[^}]*(validate|getScoreColor|getScoreLabel)[^}]*}\s+from\s+['"]\.\/.*validator.*\.js['"]/.test(content);
      if (!hasValidatorImport) {
        issues.push('Missing validator import (validate*, getScoreColor, getScoreLabel) in project-view.js');
      }

      // Check for score display in completion banner
      // totalScore/scoreColor pattern (most projects) or validation.score/validation.colorClass (jd-assistant)
      const hasStandardScoreDisplay = /totalScore/.test(content) && /scoreColor/.test(content);
      const hasJDScoreDisplay = /validationResult\.totalScore/.test(content) && /scoreColor/.test(content);
      if (!hasStandardScoreDisplay && !hasJDScoreDisplay) {
        issues.push('Missing inline score display (totalScore/scoreColor or validationResult.totalScore/scoreColor) in completion banner');
      }

      // Check for the "Inline Quality Score" section with 4-column breakdown
      // This is the full quality score UI that should be present in ALL projects
      const hasInlineQualityScoreSection = /Inline Quality Score/.test(content);
      const hasScoreBreakdown = /grid-cols-2\s+md:grid-cols-4/.test(content);
      if (!hasInlineQualityScoreSection) {
        issues.push('Missing "Inline Quality Score" section in completion banner - should show 4-column breakdown');
      }
      if (!hasScoreBreakdown) {
        issues.push('Missing 4-column score breakdown grid (grid-cols-2 md:grid-cols-4) in completion banner');
      }

      // Check for validator file existence
      const validatorFiles = [
        'assistant/js/validator-inline.js',
        'assistant/js/jd-validator.js',  // jd-assistant uses this
      ];
      const hasValidatorFile = validatorFiles.some(f =>
        fs.existsSync(path.join(projectPath, f))
      );
      if (!hasValidatorFile) {
        issues.push('Missing validator-inline.js or jd-validator.js in assistant/js/');
      }
    } catch {
      issues.push('Could not read project-view.js');
    }

    if (issues.length > 0) {
      results.projects[project] = issues;
      results.summary.projectsWithoutScoring++;
    }
  }

  return results;
}

/**
 * Analyze shared library naming conventions across all projects.
 * Detects document-specific function names in shared libraries that should
 * use generic names instead (e.g., validateProposal should be validateDocument).
 *
 * Returns summary and detailed issues per project.
 */
function analyzeSharedLibraryNaming(genesisToolsDir) {
  const results = {
    summary: { projectsChecked: 0, projectsWithIssues: 0, antiPatternsFound: 0 },
    projects: {}
  };

  for (const project of PROJECTS) {
    // Skip jd-assistant - it uses jd-validator.js which is project-specific by design
    if (project === 'jd-assistant') continue;

    const projectPath = path.join(genesisToolsDir, project);
    const projectIssues = [];
    results.summary.projectsChecked++;

    for (const file of SHARED_LIBRARY_FILES) {
      const filePath = path.join(projectPath, file);

      if (!fs.existsSync(filePath)) continue;

      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        // Pattern to match exported functions
        const patterns = [
          /^export\s+(?:async\s+)?function\s+(\w+)/,           // export function name(
          /^export\s+const\s+(\w+)\s*=\s*(?:async\s+)?\(/,    // export const name = (
          /^export\s+const\s+(\w+)\s*=\s*(?:async\s+)?function/, // export const name = function
        ];

        lines.forEach((line, lineNum) => {
          const trimmed = line.trim();
          for (const pattern of patterns) {
            const match = trimmed.match(pattern);
            if (match) {
              const functionName = match[1];

              // Check for document-specific terms in function name
              for (const term of DOCUMENT_SPECIFIC_TERMS) {
                if (functionName.includes(term)) {
                  projectIssues.push({
                    file,
                    functionName,
                    line: lineNum + 1,
                    term,
                    suggestedName: functionName.replace(term, 'Document'),
                  });
                  results.summary.antiPatternsFound++;
                  break;
                }
              }
              break;
            }
          }
        });
      } catch {
        // Skip files that can't be read
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
 * Analyze validator scoring alignment between inline and full validators.
 * Detects when assistant/js/validator-inline.js and validator/js/validator.js
 * would produce different scores for the same document.
 *
 * Checks:
 * 1. Slop deduction formula consistency
 * 2. js/validator-inline.js matches assistant/js/validator-inline.js
 * 3. Scoring function names match between inline and full validators
 *
 * Returns summary and detailed issues per project.
 */
function analyzeValidatorScoringAlignment(genesisToolsDir) {
  const results = {
    summary: { projectsChecked: 0, projectsWithIssues: 0, totalIssues: 0 },
    projects: {}
  };

  // Standard slop deduction formula that all validators should use
  const STANDARD_SLOP_FORMULA = 'Math.min(5, Math.floor(slopPenalty.penalty * 0.6))';
  const SLOP_PATTERN = /slopDeduction\s*=\s*Math\.min\s*\(\s*(\d+)\s*,\s*Math\.floor\s*\(\s*slopPenalty\.penalty\s*\*\s*([\d.]+)\s*\)\s*\)/;
  const ALT_SLOP_PATTERN = /slopDeduction\s*=\s*Math\.min\s*\(\s*(\d+)\s*,\s*slopPenalty\.penalty\s*\)/;

  // Pattern to extract scoring function names
  const SCORE_FUNCTION_PATTERN = /^(?:export\s+)?function\s+(score[A-Za-z]+)\s*\(/gm;

  for (const project of PROJECTS) {
    // Skip hello-world baseline - it's a template
    if (project.includes('hello-world')) continue;
    // Skip jd-assistant - uses different validator structure
    if (project === 'jd-assistant') continue;

    const projectPath = path.join(genesisToolsDir, project);
    const projectIssues = [];
    results.summary.projectsChecked++;

    // Files to check
    const inlineValidatorPath = path.join(projectPath, 'assistant/js/validator-inline.js');
    const rootInlineValidatorPath = path.join(projectPath, 'js/validator-inline.js');
    const fullValidatorPath = path.join(projectPath, 'validator/js/validator.js');

    // Check 1: Slop deduction formula in inline validator
    if (fs.existsSync(inlineValidatorPath)) {
      try {
        const content = fs.readFileSync(inlineValidatorPath, 'utf-8');
        const match = content.match(SLOP_PATTERN);
        const altMatch = content.match(ALT_SLOP_PATTERN);

        if (match) {
          const maxPenalty = match[1];
          const multiplier = match[2];
          if (maxPenalty !== '5' || multiplier !== '0.6') {
            projectIssues.push({
              type: 'slop_formula_mismatch',
              file: 'assistant/js/validator-inline.js',
              found: `Math.min(${maxPenalty}, Math.floor(penalty * ${multiplier}))`,
              expected: STANDARD_SLOP_FORMULA,
              message: `Inline validator uses non-standard slop formula`
            });
          }
        } else if (altMatch) {
          projectIssues.push({
            type: 'slop_formula_mismatch',
            file: 'assistant/js/validator-inline.js',
            found: `Math.min(${altMatch[1]}, penalty)`,
            expected: STANDARD_SLOP_FORMULA,
            message: `Inline validator uses non-standard slop formula (missing floor/multiplier)`
          });
        }
      } catch {
        // Skip files that can't be read
      }
    }

    // Check 2: Slop deduction formula in full validator
    if (fs.existsSync(fullValidatorPath)) {
      try {
        const content = fs.readFileSync(fullValidatorPath, 'utf-8');
        const match = content.match(SLOP_PATTERN);
        const altMatch = content.match(ALT_SLOP_PATTERN);

        if (match) {
          const maxPenalty = match[1];
          const multiplier = match[2];
          if (maxPenalty !== '5' || multiplier !== '0.6') {
            projectIssues.push({
              type: 'slop_formula_mismatch',
              file: 'validator/js/validator.js',
              found: `Math.min(${maxPenalty}, Math.floor(penalty * ${multiplier}))`,
              expected: STANDARD_SLOP_FORMULA,
              message: `Full validator uses non-standard slop formula`
            });
          }
        } else if (altMatch) {
          projectIssues.push({
            type: 'slop_formula_mismatch',
            file: 'validator/js/validator.js',
            found: `Math.min(${altMatch[1]}, penalty)`,
            expected: STANDARD_SLOP_FORMULA,
            message: `Full validator uses non-standard slop formula (missing floor/multiplier)`
          });
        }
      } catch {
        // Skip files that can't be read
      }
    }

    // Check 3: js/validator-inline.js matches assistant/js/validator-inline.js
    if (fs.existsSync(inlineValidatorPath) && fs.existsSync(rootInlineValidatorPath)) {
      try {
        const inlineContent = fs.readFileSync(inlineValidatorPath, 'utf-8');
        const rootContent = fs.readFileSync(rootInlineValidatorPath, 'utf-8');

        if (inlineContent !== rootContent) {
          projectIssues.push({
            type: 'inline_validator_mismatch',
            file: 'js/validator-inline.js',
            message: `js/validator-inline.js differs from assistant/js/validator-inline.js - users will see different scores`
          });
        }
      } catch {
        // Skip files that can't be read
      }
    }

    // Check 4: Scoring function names match between inline and full validators
    // Different function names indicate different scoring algorithms
    if (fs.existsSync(inlineValidatorPath) && fs.existsSync(fullValidatorPath)) {
      try {
        const inlineContent = fs.readFileSync(inlineValidatorPath, 'utf-8');
        const fullContent = fs.readFileSync(fullValidatorPath, 'utf-8');

        // Extract scoring function names from both files
        const inlineFunctions = new Set();
        const fullFunctions = new Set();

        let match;
        const inlinePattern = /^(?:export\s+)?function\s+(score[A-Za-z]+)\s*\(/gm;
        while ((match = inlinePattern.exec(inlineContent)) !== null) {
          inlineFunctions.add(match[1]);
        }

        const fullPattern = /^(?:export\s+)?function\s+(score[A-Za-z]+)\s*\(/gm;
        while ((match = fullPattern.exec(fullContent)) !== null) {
          fullFunctions.add(match[1]);
        }

        // Check if the scoring functions match
        const inlineOnly = [...inlineFunctions].filter(f => !fullFunctions.has(f));
        const fullOnly = [...fullFunctions].filter(f => !inlineFunctions.has(f));

        // If there are functions unique to each file, they're using different algorithms
        if (inlineOnly.length > 0 && fullOnly.length > 0) {
          projectIssues.push({
            type: 'scoring_algorithm_mismatch',
            file: 'validator-inline.js vs validator.js',
            inlineFunctions: inlineOnly,
            fullFunctions: fullOnly,
            message: `Inline and full validators use DIFFERENT scoring algorithms - scores will NOT match`
          });
        }
      } catch {
        // Skip files that can't be read
      }
    }

    if (projectIssues.length > 0) {
      results.projects[project] = projectIssues;
      results.summary.projectsWithIssues++;
      results.summary.totalIssues += projectIssues.length;
    }
  }

  return results;
}

// ============================================================================
// FIT-AND-FINISH REQUIREMENTS
// ============================================================================
// These checks ensure consistent UI/UX polish across all genesis projects.
// They verify:
// 1. Navigation dropdown has canonical order (excluding self)
// 2. Footer GitHub link points to genesis BACKGROUND.md
// 3. Import document feature has double-click prevention (isSaving flag)
// 4. Import tile is present on landing page (views.js)

// Canonical navigation order - each project should list these (excluding itself)
const CANONICAL_NAV_ORDER = [
  'one-pager',
  'product-requirements-assistant',
  'acceptance-criteria-assistant',
  'architecture-decision-record',
  'business-justification-assistant',
  'jd-assistant',
  'pr-faq-assistant',
  'power-statement-assistant',
  'strategic-proposal',
];

// Required footer link
const REQUIRED_FOOTER_LINK = 'https://github.com/bordenet/genesis/blob/main/BACKGROUND.md';

/**
 * Analyze fit-and-finish consistency across all projects.
 * Checks:
 * 1. Navigation dropdown order matches canonical order (excluding self)
 * 2. Footer GitHub link points to genesis BACKGROUND.md
 * 3. Import document has double-click prevention (isSaving flag)
 * 4. Import tile is present in views.js
 *
 * Returns summary and detailed issues per project.
 */
function analyzeFitAndFinish(genesisToolsDir) {
  const results = {
    summary: {
      projectsChecked: 0,
      projectsWithIssues: 0,
      totalIssues: 0,
      navOrderIssues: 0,
      footerLinkIssues: 0,
      doubleClickIssues: 0,
      importTileIssues: 0,
      tileStatusIssues: 0,
    },
    projects: {}
  };

  for (const project of PROJECTS) {
    const projectPath = path.join(genesisToolsDir, project);
    const projectIssues = [];
    results.summary.projectsChecked++;

    // Get the project's slug for self-exclusion check
    const projectSlug = project.includes('hello-world') ? 'hello-world' : project;

    // === CHECK 1: Navigation dropdown order ===
    const indexHtmlPath = path.join(projectPath, 'index.html');
    if (fs.existsSync(indexHtmlPath)) {
      try {
        const content = fs.readFileSync(indexHtmlPath, 'utf-8');

        // Extract navigation links in order
        const navPattern = /bordenet\.github\.io\/([a-zA-Z0-9_-]+)\//g;
        const navLinks = [];
        let match;
        // Only look at the Related Tools section (first 8-9 matches before footer)
        const relatedToolsSection = content.match(/Related Tools[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
        if (relatedToolsSection) {
          const sectionContent = relatedToolsSection[0];
          while ((match = navPattern.exec(sectionContent)) !== null) {
            navLinks.push(match[1]);
          }
        }

        // Expected order: canonical order minus self
        const expectedOrder = CANONICAL_NAV_ORDER.filter(p => p !== projectSlug);

        // Check if navigation matches expected order
        if (navLinks.length > 0) {
          // Compare first 8 links (the navigation dropdown)
          const actualNav = navLinks.slice(0, 8);
          const orderMatches = expectedOrder.every((expected, i) => actualNav[i] === expected);

          if (!orderMatches) {
            projectIssues.push({
              type: 'nav_order_mismatch',
              file: 'index.html',
              expected: expectedOrder.join(' → '),
              actual: actualNav.join(' → '),
              message: 'Navigation dropdown order does not match canonical order'
            });
            results.summary.navOrderIssues++;
          }

          // Check that project excludes itself
          if (navLinks.includes(projectSlug)) {
            projectIssues.push({
              type: 'nav_includes_self',
              file: 'index.html',
              message: `Navigation includes self-reference to ${projectSlug}`
            });
            results.summary.navOrderIssues++;
          }
        }

        // === CHECK 2: Footer GitHub link ===
        if (!content.includes(REQUIRED_FOOTER_LINK)) {
          projectIssues.push({
            type: 'footer_link_missing',
            file: 'index.html',
            expected: REQUIRED_FOOTER_LINK,
            message: 'Footer does not link to genesis BACKGROUND.md'
          });
          results.summary.footerLinkIssues++;
        }
      } catch {
        // Skip files that can't be read
      }
    }

    // === CHECK 3: Double-click prevention in import-document.js ===
    const importDocPaths = [
      path.join(projectPath, 'shared/js/import-document.js'),
      path.join(projectPath, 'shared/js/import-prd.js'),  // PRD assistant uses different name
    ];

    let hasImportDoc = false;
    for (const importDocPath of importDocPaths) {
      if (fs.existsSync(importDocPath)) {
        hasImportDoc = true;
        try {
          const content = fs.readFileSync(importDocPath, 'utf-8');

          // Check for isSaving flag pattern
          const hasIsSavingDecl = /let\s+isSaving\s*=\s*false/.test(content);
          const hasIsSavingCheck = /if\s*\(\s*isSaving\s*\)\s*return/.test(content);
          const hasIsSavingSet = /isSaving\s*=\s*true/.test(content);
          const hasIsSavingReset = /isSaving\s*=\s*false/.test(content);

          if (!hasIsSavingDecl || !hasIsSavingCheck || !hasIsSavingSet) {
            projectIssues.push({
              type: 'double_click_prevention_missing',
              file: path.basename(importDocPath),
              message: 'Import document missing double-click prevention (isSaving flag pattern)'
            });
            results.summary.doubleClickIssues++;
          }

          // Check for button disable pattern
          const hasButtonDisable = /saveBtn\.disabled\s*=\s*true/.test(content);
          const hasSavingText = /saveBtn\.textContent\s*=\s*['"]Saving/.test(content);

          if (!hasButtonDisable || !hasSavingText) {
            projectIssues.push({
              type: 'double_click_ui_feedback_missing',
              file: path.basename(importDocPath),
              message: 'Import document missing UI feedback (button disable + "Saving..." text)'
            });
            results.summary.doubleClickIssues++;
          }
        } catch {
          // Skip files that can't be read
        }
        break;  // Only check one import file per project
      }
    }

    // === CHECK 4: Import tile in views.js ===
    const viewsPaths = [
      path.join(projectPath, 'shared/js/views.js'),
      path.join(projectPath, 'assistant/js/views.js'),
    ];

    for (const viewsPath of viewsPaths) {
      if (fs.existsSync(viewsPath)) {
        try {
          const content = fs.readFileSync(viewsPath, 'utf-8');

          // Check for import tile
          const hasImportTile = /import-doc-btn|import-prd-btn/.test(content);
          const hasImportIcon = /📥/.test(content);
          const hasImportLabel = /Import/.test(content);

          if (!hasImportTile) {
            projectIssues.push({
              type: 'import_tile_missing',
              file: path.basename(viewsPath),
              message: 'Views.js missing Import tile (import-doc-btn or import-prd-btn)'
            });
            results.summary.importTileIssues++;
          }

          // Check for showImportModal import
          const hasShowImportModalImport = /import\s*{[^}]*showImportModal[^}]*}\s*from/.test(content);
          if (!hasShowImportModalImport && hasImportTile) {
            projectIssues.push({
              type: 'import_modal_import_missing',
              file: path.basename(viewsPath),
              message: 'Views.js has import tile but missing showImportModal import'
            });
            results.summary.importTileIssues++;
          }
        } catch {
          // Skip files that can't be read
        }
        break;  // Only check one views file per project
      }
    }

    // === CHECK 5: Project tile status display ===
    // Verify that views.js implements the standard project tile status pattern:
    // - Shows phase progress (N/3) for in-progress documents
    // - Shows quality score with color/label for completed documents
    for (const viewsPath of viewsPaths) {
      if (fs.existsSync(viewsPath)) {
        try {
          const content = fs.readFileSync(viewsPath, 'utf-8');

          // Check for scoreData variable (stores validation results)
          const hasScoreData = /let\s+scoreData\s*=\s*null/.test(content) ||
                               /scoreData\s*=\s*{\s*score/.test(content);

          // Check for validateDocument call
          const hasValidateDocument = /validateDocument\s*\(/.test(content);

          // Check for getScoreColor and getScoreLabel usage
          const hasScoreColor = /getScoreColor\s*\(/.test(content);
          const hasScoreLabel = /getScoreLabel\s*\(/.test(content);

          // Check for completedPhases counter
          const hasCompletedPhases = /completedPhases/.test(content);

          // Check for phase progress display (N/3)
          const hasPhaseProgress = /\$\{completedPhases\}\/3/.test(content) ||
                                   /completedPhases.*\/.*3/.test(content);

          // Check for Quality Score label
          const hasQualityScoreLabel = /Quality Score/.test(content);

          const missingElements = [];
          if (!hasScoreData) missingElements.push('scoreData variable');
          if (!hasValidateDocument) missingElements.push('validateDocument() call');
          if (!hasScoreColor) missingElements.push('getScoreColor()');
          if (!hasScoreLabel) missingElements.push('getScoreLabel()');
          if (!hasCompletedPhases) missingElements.push('completedPhases counter');
          if (!hasPhaseProgress) missingElements.push('phase progress display (N/3)');
          if (!hasQualityScoreLabel) missingElements.push('Quality Score label');

          if (missingElements.length > 0) {
            projectIssues.push({
              type: 'tile_status_incomplete',
              file: path.basename(viewsPath),
              missing: missingElements,
              message: `Project tile status missing: ${missingElements.join(', ')}`
            });
            results.summary.tileStatusIssues++;
          }
        } catch {
          // Skip files that can't be read
        }
        break;  // Only check one views file per project
      }
    }

    // Record issues for this project
    if (projectIssues.length > 0) {
      results.projects[project] = projectIssues;
      results.summary.projectsWithIssues++;
      results.summary.totalIssues += projectIssues.length;
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

  // Analyze domain bleed-over (terms from other domains appearing in wrong project)
  results.domainBleedOver = analyzeDomainBleedOver(genesisToolsDir);

  // Analyze function signature consistency across projects
  results.functionSignatures = analyzeFunctionSignatures(genesisToolsDir);

  // Analyze URL self-reference issues (absolute URLs pointing to wrong project)
  results.urlSelfReference = analyzeURLSelfReference(genesisToolsDir);

  // Analyze inline scoring presence (all projects should have inline scoring)
  results.inlineScoring = analyzeInlineScoringPresence(genesisToolsDir);

  // Analyze template customization issues (8 documented hello-world issues)
  results.templateCustomization = analyzeTemplateCustomization(genesisToolsDir);

  // Analyze shared library naming (detect document-specific names in shared libs)
  results.sharedLibraryNaming = analyzeSharedLibraryNaming(genesisToolsDir);

  // Analyze validator scoring alignment (inline vs full validator consistency)
  results.validatorScoringAlignment = analyzeValidatorScoringAlignment(genesisToolsDir);

  // Analyze fit-and-finish consistency (nav order, footer, import feature)
  results.fitAndFinish = analyzeFitAndFinish(genesisToolsDir);

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
  if (results.domainBleedOver && results.domainBleedOver.summary.totalBleedOverTerms > 0) {
    lines.push(`  ${red('🩸')} Domain bleed-over: ${results.domainBleedOver.summary.totalBleedOverTerms} terms in ${results.domainBleedOver.summary.projectsWithIssues} projects`);
  }
  if (results.urlSelfReference && results.urlSelfReference.summary.totalURLIssues > 0) {
    lines.push(`  ${red('🔗')} URL self-reference issues: ${results.urlSelfReference.summary.totalURLIssues} URLs in ${results.urlSelfReference.summary.projectsWithIssues} projects`);
  }
  if (results.inlineScoring && results.inlineScoring.summary.projectsWithoutScoring > 0) {
    lines.push(`  ${red('📊')} Missing inline scoring: ${results.inlineScoring.summary.projectsWithoutScoring} projects`);
  }
  if (results.templateCustomization && results.templateCustomization.summary.totalIssues > 0) {
    lines.push(`  ${red('📝')} Template customization issues: ${results.templateCustomization.summary.totalIssues} issues in ${results.templateCustomization.summary.projectsWithIssues} projects`);
  }
  if (results.sharedLibraryNaming && results.sharedLibraryNaming.summary.antiPatternsFound > 0) {
    lines.push(`  ${red('🏷️')} Shared library naming issues: ${results.sharedLibraryNaming.summary.antiPatternsFound} anti-patterns in ${results.sharedLibraryNaming.summary.projectsWithIssues} projects`);
  }
  if (results.fitAndFinish && results.fitAndFinish.summary.totalIssues > 0) {
    lines.push(`  ${red('✨')} Fit-and-finish issues: ${results.fitAndFinish.summary.totalIssues} issues in ${results.fitAndFinish.summary.projectsWithIssues} projects`);
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

  // DOMAIN BLEED-OVER: Terms from other domains appearing in wrong project
  if (results.domainBleedOver && results.domainBleedOver.summary.totalBleedOverTerms > 0) {
    lines.push(red(bold('🩸 CRITICAL: DOMAIN BLEED-OVER (terms from other domains)')));
    lines.push(red('─'.repeat(60)));
    lines.push('');
    lines.push('  Domain-specific terms from another project type have bled over.');
    lines.push('  This indicates the template was not properly customized.');
    lines.push('  Example: "dealership" in jd-assistant = strategic-proposal bleed-over.');
    lines.push('');

    for (const [project, issues] of Object.entries(results.domainBleedOver.projects)) {
      lines.push(red(`  ${project}: ${issues.length} bleed-over occurrences`));

      // Group issues by term for cleaner output
      const byTerm = {};
      for (const issue of issues) {
        if (!byTerm[issue.term]) byTerm[issue.term] = [];
        byTerm[issue.term].push(issue);
      }

      for (const [term, termIssues] of Object.entries(byTerm)) {
        lines.push(yellow(`    "${term}" found ${termIssues.length} times:`));
        // Show first 3 occurrences
        for (const issue of termIssues.slice(0, 3)) {
          lines.push(`      ${issue.file}:${issue.line}`);
        }
        if (termIssues.length > 3) {
          lines.push(`      ... and ${termIssues.length - 3} more`);
        }
      }
      lines.push('');
    }
  }

  // URL SELF-REFERENCE ISSUES: Absolute URLs pointing to wrong project
  if (results.urlSelfReference && results.urlSelfReference.summary.totalURLIssues > 0) {
    lines.push(red(bold('🔗 CRITICAL: URL SELF-REFERENCE ISSUES (wrong project in URLs)')));
    lines.push(red('─'.repeat(60)));
    lines.push('');
    lines.push('  Absolute URLs in project-view.js reference a DIFFERENT project.');
    lines.push('  This causes links to open the wrong validator/app.');
    lines.push('  FIX: Use relative URLs (../validator/) or correct the project name.');
    lines.push('');

    for (const [project, issues] of Object.entries(results.urlSelfReference.projects)) {
      lines.push(red(`  ${project}: ${issues.length} URL issue(s)`));
      for (const issue of issues.slice(0, 5)) {
        lines.push(yellow(`    Line ${issue.line}: URL references "${issue.urlProject}" but project is "${issue.actualProject}"`));
        lines.push(`      ${issue.context}`);
      }
      if (issues.length > 5) {
        lines.push(`      ... and ${issues.length - 5} more`);
      }
      lines.push('');
    }
  }

  // INLINE SCORING ISSUES: Projects missing inline scoring in completion banner
  if (results.inlineScoring && results.inlineScoring.summary.projectsWithoutScoring > 0) {
    lines.push(red(bold('📊 CRITICAL: MISSING INLINE SCORING (projects without scoring in completion banner)')));
    lines.push(red('─'.repeat(60)));
    lines.push('');
    lines.push('  All projects should display inline quality scores in the Phase 3 completion banner.');
    lines.push('  This requires: validator-inline.js, import in project-view.js, and score display in banner.');
    lines.push('');

    for (const [project, issues] of Object.entries(results.inlineScoring.projects)) {
      lines.push(red(`  ${project}:`));
      for (const issue of issues) {
        lines.push(yellow(`    ✗ ${issue}`));
      }
      lines.push('');
    }
  }

  // TEMPLATE CUSTOMIZATION ISSUES: 8 documented hello-world template issues
  if (results.templateCustomization && results.templateCustomization.summary.totalIssues > 0) {
    lines.push(red(bold('📝 TEMPLATE CUSTOMIZATION ISSUES (hello-world template problems)')));
    lines.push(red('─'.repeat(60)));
    lines.push('');
    lines.push('  These issues indicate incomplete template customization or outdated patterns.');
    lines.push('  See CONTINUOUS_IMPROVEMENT.md for full documentation of these 8 issues.');
    lines.push('');

    for (const [project, issues] of Object.entries(results.templateCustomization.projects)) {
      lines.push(red(`  ${project}: ${issues.length} issue(s)`));

      // Group issues by type for cleaner output
      const byType = {};
      for (const issue of issues) {
        if (!byType[issue.type]) byType[issue.type] = [];
        byType[issue.type].push(issue);
      }

      for (const [type, typeIssues] of Object.entries(byType)) {
        for (const issue of typeIssues.slice(0, 3)) {
          const location = issue.line ? `${issue.file}:${issue.line}` : issue.file;
          lines.push(yellow(`    ✗ ${location}: ${issue.message}`));
        }
        if (typeIssues.length > 3) {
          lines.push(`      ... and ${typeIssues.length - 3} more of this type`);
        }
      }
      lines.push('');
    }
  }

  // SHARED LIBRARY NAMING: Document-specific names in shared libraries
  if (results.sharedLibraryNaming && results.sharedLibraryNaming.summary.antiPatternsFound > 0) {
    lines.push(red(bold('🏷️ CRITICAL: SHARED LIBRARY NAMING ANTI-PATTERNS')));
    lines.push(red('─'.repeat(60)));
    lines.push('');
    lines.push('  Shared libraries MUST use generic function names, not document-specific names.');
    lines.push('  Example: validateDocument (correct) vs validateProposal (anti-pattern)');
    lines.push('');

    for (const [project, issues] of Object.entries(results.sharedLibraryNaming.projects)) {
      lines.push(red(`  ${project}: ${issues.length} anti-pattern(s)`));
      for (const issue of issues) {
        lines.push(yellow(`    ✗ ${issue.file}:${issue.line} - ${issue.functionName}`));
        lines.push(`      Contains "${issue.term}" → suggest: ${issue.suggestedName}`);
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

  // FUNCTION SIGNATURE MISMATCHES: Same function with different signatures across projects
  if (results.functionSignatures && results.functionSignatures.summary.signatureMismatches > 0) {
    const purple = (s) => `\x1b[35m${s}\x1b[0m`;
    lines.push(purple(bold('🔧 FUNCTION SIGNATURE MISMATCHES (API inconsistency across projects)')));
    lines.push(purple('─'.repeat(60)));
    lines.push('');
    lines.push('  These functions have DIFFERENT signatures in different projects.');
    lines.push('  This causes bugs when callers use the wrong parameter order.');
    lines.push('');

    for (const mismatch of results.functionSignatures.mismatches) {
      lines.push(purple(`  ${mismatch.functionName}() in ${mismatch.file}`));
      for (const [signature, projects] of Object.entries(mismatch.signatureGroups)) {
        const projectList = projects.map(p => `${p.project}:${p.line}`).join(', ');
        lines.push(red(`    ${signature}`));
        lines.push(`      Used in: ${projectList}`);
      }
      lines.push('');
    }
  }

  // VALIDATOR SCORING ALIGNMENT: Inline vs full validator consistency
  if (results.validatorScoringAlignment && results.validatorScoringAlignment.summary.totalIssues > 0) {
    const pink = (s) => `\x1b[38;5;205m${s}\x1b[0m`;
    lines.push(pink(bold('⚖️  VALIDATOR SCORING ALIGNMENT (inline vs full validator mismatch)')));
    lines.push(pink('─'.repeat(60)));
    lines.push('');
    lines.push('  Users will see DIFFERENT scores in the Assistant vs Validator.');
    lines.push('  Standard slop formula: Math.min(5, Math.floor(penalty * 0.6))');
    lines.push('');

    for (const [project, issues] of Object.entries(results.validatorScoringAlignment.projects)) {
      lines.push(pink(`  ${project}:`));
      for (const issue of issues) {
        if (issue.type === 'slop_formula_mismatch') {
          lines.push(red(`    ✗ ${issue.file}: ${issue.message}`));
          lines.push(`      Found: ${issue.found}`);
          lines.push(`      Expected: ${issue.expected}`);
        } else if (issue.type === 'inline_validator_mismatch') {
          lines.push(red(`    ✗ ${issue.message}`));
        } else if (issue.type === 'scoring_algorithm_mismatch') {
          lines.push(red(`    ✗ ${issue.message}`));
          lines.push(`      Inline-only functions: ${issue.inlineFunctions.join(', ')}`);
          lines.push(`      Full-only functions: ${issue.fullFunctions.join(', ')}`);
        }
      }
      lines.push('');
    }
  }

  // FIT-AND-FINISH ISSUES: Navigation order, footer link, double-click prevention, import tile
  if (results.fitAndFinish && results.fitAndFinish.summary.totalIssues > 0) {
    const teal = (s) => `\x1b[38;5;44m${s}\x1b[0m`;
    lines.push(teal(bold('✨ FIT-AND-FINISH ISSUES (UI/UX consistency problems)')));
    lines.push(teal('─'.repeat(60)));
    lines.push('');
    lines.push('  These checks ensure consistent polish across all genesis projects.');
    lines.push('  Issues: nav order, footer link, double-click prevention, import tile.');
    lines.push('');

    for (const [project, issues] of Object.entries(results.fitAndFinish.projects)) {
      lines.push(teal(`  ${project}: ${issues.length} issue(s)`));
      for (const issue of issues) {
        if (issue.type === 'nav_order_mismatch') {
          lines.push(red(`    ✗ ${issue.file}: ${issue.message}`));
          lines.push(`      Expected: ${issue.expected}`);
          lines.push(`      Actual:   ${issue.actual}`);
        } else if (issue.type === 'nav_includes_self') {
          lines.push(red(`    ✗ ${issue.file}: ${issue.message}`));
        } else if (issue.type === 'footer_link_missing') {
          lines.push(red(`    ✗ ${issue.file}: ${issue.message}`));
          lines.push(`      Expected: ${issue.expected}`);
        } else if (issue.type === 'double_click_prevention_missing' || issue.type === 'double_click_ui_feedback_missing') {
          lines.push(red(`    ✗ ${issue.file}: ${issue.message}`));
        } else if (issue.type === 'import_tile_missing' || issue.type === 'import_modal_import_missing') {
          lines.push(red(`    ✗ ${issue.file}: ${issue.message}`));
        } else {
          lines.push(red(`    ✗ ${issue.file}: ${issue.message}`));
        }
      }
      lines.push('');
    }
  }

  // Final verdict
  lines.push(bold('═══════════════════════════════════════════════════════════════'));
  const symlinkCount = results.summary.symlinkIssues || 0;
  const coverageGaps = results.testCoverage?.summary?.patternsWithGaps || 0;
  const stubValidators = results.validatorStructure?.summary?.stubValidators || 0;
  const internalIssues = results.internalConsistency?.summary?.totalDivergentPairs || 0;
  const bleedOverIssues = results.domainBleedOver?.summary?.totalBleedOverTerms || 0;
  const signatureMismatches = results.functionSignatures?.summary?.signatureMismatches || 0;
  const urlIssues = results.urlSelfReference?.summary?.totalURLIssues || 0;
  const scoringIssues = results.inlineScoring?.summary?.projectsWithoutScoring || 0;
  const templateIssues = results.templateCustomization?.summary?.totalIssues || 0;
  const namingIssues = results.sharedLibraryNaming?.summary?.antiPatternsFound || 0;
  const scoringAlignmentIssues = results.validatorScoringAlignment?.summary?.totalIssues || 0;
  const fitAndFinishIssues = results.fitAndFinish?.summary?.totalIssues || 0;

  const allGreen = results.summary.divergent === 0 && symlinkCount === 0 && coverageGaps === 0 && stubValidators === 0 && internalIssues === 0 && bleedOverIssues === 0 && signatureMismatches === 0 && urlIssues === 0 && scoringIssues === 0 && templateIssues === 0 && namingIssues === 0 && scoringAlignmentIssues === 0 && fitAndFinishIssues === 0;

  if (allGreen) {
    lines.push(green(bold('  ✓ ALL MUST-MATCH FILES ARE IDENTICAL')));
    lines.push(green(bold('  ✓ NO INTERNAL CONSISTENCY ISSUES')));
    lines.push(green(bold('  ✓ NO DOMAIN BLEED-OVER DETECTED')));
    lines.push(green(bold('  ✓ NO URL SELF-REFERENCE ISSUES')));
    lines.push(green(bold('  ✓ ALL PROJECTS HAVE INLINE SCORING')));
    lines.push(green(bold('  ✓ NO TEMPLATE CUSTOMIZATION ISSUES')));
    lines.push(green(bold('  ✓ NO SHARED LIBRARY NAMING ISSUES')));
    lines.push(green(bold('  ✓ NO TEST COVERAGE GAPS DETECTED')));
    lines.push(green(bold('  ✓ NO STUB VALIDATORS DETECTED')));
    lines.push(green(bold('  ✓ NO FUNCTION SIGNATURE MISMATCHES')));
    lines.push(green(bold('  ✓ VALIDATOR SCORING ALIGNED (inline = full)')));
    lines.push(green(bold('  ✓ FIT-AND-FINISH CONSISTENT (nav, footer, import)')));
  } else {
    if (results.summary.divergent > 0) {
      lines.push(red(bold(`  ✗ ${results.summary.divergent} FILES HAVE DIVERGED - FIX REQUIRED`)));
    }
    if (internalIssues > 0) {
      lines.push(red(bold(`  🔀 ${internalIssues} INTERNAL CONSISTENCY ISSUES - js/ vs assistant/js/ DIVERGED`)));
    }
    if (bleedOverIssues > 0) {
      lines.push(red(bold(`  🩸 ${bleedOverIssues} DOMAIN BLEED-OVER TERMS - CUSTOMIZE TEMPLATE CONTENT`)));
    }
    if (urlIssues > 0) {
      lines.push(red(bold(`  🔗 ${urlIssues} URL SELF-REFERENCE ISSUES - FIX VALIDATOR LINKS`)));
    }
    if (scoringIssues > 0) {
      lines.push(red(bold(`  📊 ${scoringIssues} PROJECTS MISSING INLINE SCORING - ADD VALIDATOR-INLINE.JS`)));
    }
    if (templateIssues > 0) {
      lines.push(red(bold(`  📝 ${templateIssues} TEMPLATE CUSTOMIZATION ISSUES - FIX HELLO-WORLD TEMPLATE PROBLEMS`)));
    }
    if (namingIssues > 0) {
      lines.push(red(bold(`  🏷️ ${namingIssues} SHARED LIBRARY NAMING ISSUES - USE GENERIC FUNCTION NAMES`)));
    }
    if (signatureMismatches > 0) {
      lines.push(red(bold(`  🔧 ${signatureMismatches} FUNCTION SIGNATURE MISMATCHES - STANDARDIZE APIs`)));
    }
    if (scoringAlignmentIssues > 0) {
      lines.push(red(bold(`  ⚖️ ${scoringAlignmentIssues} VALIDATOR SCORING MISALIGNED - SYNC SLOP FORMULAS`)));
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
    if (fitAndFinishIssues > 0) {
      lines.push(red(bold(`  ✨ ${fitAndFinishIssues} FIT-AND-FINISH ISSUES - FIX NAV/FOOTER/IMPORT CONSISTENCY`)));
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

  // CI mode: exit 1 if any critical issues exist
  const coverageGapsCount = results.testCoverage?.summary?.patternsWithGaps || 0;
  const stubValidatorsCount = results.validatorStructure?.summary?.stubValidators || 0;
  const internalIssuesCount = results.internalConsistency?.summary?.totalDivergentPairs || 0;
  const bleedOverCount = results.domainBleedOver?.summary?.totalBleedOverTerms || 0;
  const urlIssuesCount = results.urlSelfReference?.summary?.totalURLIssues || 0;
  const scoringIssuesCount = results.inlineScoring?.summary?.projectsWithoutScoring || 0;
  const templateIssuesCount = results.templateCustomization?.summary?.totalIssues || 0;
  const namingIssuesCount = results.sharedLibraryNaming?.summary?.antiPatternsFound || 0;
  const scoringAlignmentCount = results.validatorScoringAlignment?.summary?.totalIssues || 0;
  const fitAndFinishCount = results.fitAndFinish?.summary?.totalIssues || 0;

  if (ciMode && (
    results.summary.divergent > 0 ||
    results.summary.symlinkIssues > 0 ||
    coverageGapsCount > 0 ||
    stubValidatorsCount > 0 ||
    internalIssuesCount > 0 ||
    bleedOverCount > 0 ||
    urlIssuesCount > 0 ||
    scoringIssuesCount > 0 ||
    templateIssuesCount > 0 ||
    namingIssuesCount > 0 ||
    scoringAlignmentCount > 0 ||
    fitAndFinishCount > 0
  )) {
    process.exit(1);
  }
}

// Run if executed directly
if (process.argv[1] === __filename) {
  main();
}

export { diffProjects, PROJECTS, INTENTIONAL_DIFF_PATTERNS, formatConsoleReport, analyzeSharedLibraryNaming };

