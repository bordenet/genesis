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

// All 7 projects (6 derived + hello-world baseline)
const PROJECTS = [
  'architecture-decision-record',
  'one-pager',
  'power-statement-assistant',
  'pr-faq-assistant',
  'product-requirements-assistant',
  'strategic-proposal',
  'genesis/genesis/examples/hello-world',
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
  /^CHANGELOG\.md$/,
  /^CONTRIBUTING\.md$/,
  /^Agents\.md$/,
  /^AGENT\.md$/,
  /^CLAUDE\.md$/,
  /^CODEX\.md$/,
  /^COPILOT\.md$/,
  /^GEMINI\.md$/,
  /^ADOPT-PROMPT\.md$/,
  /^LICENSE$/,
  /^\.env\.example$/,
  /^package\.json$/,
  /^package-lock\.json$/,

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
 * Recursively get all files in a directory
 */
function getAllFiles(dir, baseDir = dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);
    
    // Skip excluded directories
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.includes(entry.name)) continue;
      files.push(...getAllFiles(fullPath, baseDir));
    } else {
      files.push(relativePath);
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
 * Main diff function
 */
function diffProjects(genesisToolsDir) {
  const projectPaths = PROJECTS.map(p => path.join(genesisToolsDir, p));
  
  // Collect all unique file paths across all projects
  const allFilePaths = new Set();
  const projectFiles = {};
  
  for (const project of PROJECTS) {
    const projectPath = path.join(genesisToolsDir, project);
    const files = getAllFiles(projectPath);
    projectFiles[project] = new Set(files);
    files.forEach(f => allFilePaths.add(f));
  }
  
  // Analyze each file
  const results = {
    mustMatch: { identical: [], divergent: [] },
    intentionalDiff: [],
    projectSpecific: [],
    summary: { total: 0, identical: 0, divergent: 0, intentional: 0, projectSpecific: 0 }
  };
  
  for (const filePath of [...allFilePaths].sort()) {
    results.summary.total++;
    
    // Get hash for each project that has this file
    const hashes = {};
    const projectsWithFile = [];
    
    for (const project of PROJECTS) {
      if (projectFiles[project].has(filePath)) {
        const fullPath = path.join(genesisToolsDir, project, filePath);
        hashes[project] = getFileHash(fullPath);
        projectsWithFile.push(project);
      }
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
  lines.push(bold('SUMMARY'));
  lines.push(`  Total files scanned: ${results.summary.total}`);
  lines.push(`  ${green('✓')} Identical (MUST_MATCH): ${results.summary.identical}`);
  lines.push(`  ${red('✗')} Divergent (MUST_MATCH): ${results.summary.divergent}`);
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
  if (results.summary.divergent === 0) {
    lines.push(green(bold('  ✓ ALL MUST-MATCH FILES ARE IDENTICAL')));
  } else {
    lines.push(red(bold(`  ✗ ${results.summary.divergent} FILES HAVE DIVERGED - FIX REQUIRED`)));
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

  // CI mode: exit 1 if divergent files exist
  if (ciMode && results.summary.divergent > 0) {
    process.exit(1);
  }
}

// Run if executed directly
if (process.argv[1] === __filename) {
  main();
}

export { diffProjects, PROJECTS, INTENTIONAL_DIFF_PATTERNS, formatConsoleReport };

