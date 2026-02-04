#!/usr/bin/env node

/**
 * Genesis Orphan File Detector
 * 
 * Finds JS files that exist but are never imported by any other file.
 * Scans both assistant/ and validator/ directories in all projects.
 * 
 * Usage:
 *   node find-orphans.js              # Full report
 *   node find-orphans.js --ci         # Exit 1 if orphans found
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// All 7 projects
const PROJECTS = [
  'architecture-decision-record',
  'one-pager',
  'power-statement-assistant',
  'pr-faq-assistant',
  'product-requirements-assistant',
  'strategic-proposal',
  'genesis/genesis/examples/hello-world',
];

// Entry points that are loaded directly by HTML, not imported
const ENTRY_POINTS = ['app.js'];

// Files that are intentionally standalone (not imported)
const ALLOWED_ORPHANS = [
  'app.js',           // Entry point loaded by HTML
  'prompts.js',       // May be dynamically loaded
  'ai-mock.js',       // Conditionally loaded
  'types.js',         // Type definitions, may be unused
  'error-handler.js', // Infrastructure module (tested, not yet integrated)
  'same-llm-adversarial.js', // Infrastructure module (tested, not yet integrated)
  'ai-mock-ui.js',    // UI for mock mode (conditionally loaded)
  'phase2-review.js', // Phase-specific logic (loaded by workflow)
  'phase3-synthesis.js', // Phase-specific logic (loaded by workflow)
  'keyboard-shortcuts.js', // UI enhancement (conditionally loaded)
  'exporters.js',     // Export functionality (PRD-specific)
  'mutation-tracker.js', // PRD-specific tracking
  'prd-templates.js', // PRD-specific templates
  'validator.js',     // Validator entry point (loaded by HTML)
  'router.js',        // Client-side routing (tested, not yet integrated in hello-world)
];

// Directories to scan for JS files
const JS_DIRS = [
  'js',
  'assistant/js',
  'validator/js',
];

function getProjectPath(project) {
  if (project === 'genesis/genesis/examples/hello-world') {
    return path.join(__dirname, '..', 'genesis', 'examples', 'hello-world');
  }
  return path.join(__dirname, '..', '..', project);
}

function findJsFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && entry !== 'core' && entry !== 'lib') {
      files.push(...findJsFiles(fullPath));
    } else if (entry.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

function extractImports(content) {
  const imports = new Set();
  // Match: import ... from './file.js' or from './dir/file.js'
  const importRegex = /from\s*['"]\.\/([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.add(match[1]);
  }
  return imports;
}

function scanProject(projectPath, projectName) {
  const orphans = [];
  
  for (const jsDir of JS_DIRS) {
    const fullDir = path.join(projectPath, jsDir);
    if (!fs.existsSync(fullDir)) continue;
    
    const jsFiles = findJsFiles(fullDir);
    const allImports = new Set();
    
    // Collect all imports from all files
    for (const file of jsFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const imports = extractImports(content);
      imports.forEach(imp => allImports.add(imp));
    }
    
    // Check which files are never imported
    for (const file of jsFiles) {
      const fileName = path.basename(file);
      const relativePath = path.relative(fullDir, file);
      
      // Skip allowed orphans
      if (ALLOWED_ORPHANS.includes(fileName)) continue;
      
      // Check if this file is imported anywhere
      const isImported = allImports.has(relativePath) || 
                         allImports.has(fileName) ||
                         allImports.has(relativePath.replace('.js', ''));
      
      if (!isImported) {
        orphans.push({
          project: projectName,
          dir: jsDir,
          file: relativePath,
        });
      }
    }
  }
  
  return orphans;
}

// Main
const ciMode = process.argv.includes('--ci');
let allOrphans = [];

console.log('\n\x1b[1m═══════════════════════════════════════════════════════════════\x1b[0m');
console.log('\x1b[1m  GENESIS ORPHAN FILE DETECTOR\x1b[0m');
console.log('\x1b[1m═══════════════════════════════════════════════════════════════\x1b[0m\n');

for (const project of PROJECTS) {
  const projectPath = getProjectPath(project);
  if (!fs.existsSync(projectPath)) {
    console.log(`\x1b[33m⚠ Skipping ${project} (not found)\x1b[0m`);
    continue;
  }
  
  const orphans = scanProject(projectPath, project);
  allOrphans.push(...orphans);
}

if (allOrphans.length === 0) {
  console.log('\x1b[32m✓ No orphaned files found\x1b[0m\n');
  process.exit(0);
} else {
  console.log(`\x1b[31m✗ Found ${allOrphans.length} orphaned files:\x1b[0m\n`);
  
  for (const orphan of allOrphans) {
    console.log(`  ${orphan.project}/${orphan.dir}/${orphan.file}`);
  }
  
  console.log('\n\x1b[33mThese files exist but are never imported.\x1b[0m');
  console.log('\x1b[33mConsider removing them or adding them to ALLOWED_ORPHANS.\x1b[0m\n');
  
  process.exit(ciMode ? 1 : 0);
}

