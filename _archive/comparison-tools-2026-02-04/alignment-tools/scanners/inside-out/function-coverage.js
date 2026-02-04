/**
 * Function Coverage Scanner (Inside-Out)
 * Analyzes which exported functions lack test coverage.
 *
 * @module scanners/inside-out/function-coverage
 */

import path from 'path';
import { fileExists, getAllFiles, readTextFile, detectProjectStructure } from '../../lib/config-parser.js';
import { calculateEntropy, calculateNumericVariance } from '../../lib/entropy.js';

const DIMENSION_NAME = 'Function Coverage';

// Regex to match exported functions
const EXPORT_FUNCTION_REGEX = /export\s+(?:async\s+)?function\s+(\w+)/g;
const EXPORT_CONST_ARROW_REGEX = /export\s+const\s+(\w+)\s*=\s*(?:async\s*)?\(/g;
const EXPORT_DEFAULT_REGEX = /export\s+default\s+(?:async\s+)?function\s+(\w+)?/g;

/**
 * Extract exported function names from source content.
 */
export function extractExportedFunctions(content) {
  const functions = new Set();

  // Named function exports
  for (const match of content.matchAll(EXPORT_FUNCTION_REGEX)) {
    functions.add(match[1]);
  }

  // Arrow function exports
  for (const match of content.matchAll(EXPORT_CONST_ARROW_REGEX)) {
    functions.add(match[1]);
  }

  // Default function exports
  for (const match of content.matchAll(EXPORT_DEFAULT_REGEX)) {
    if (match[1]) functions.add(match[1]);
  }

  return Array.from(functions);
}

/**
 * Extract tested function names from test content.
 */
export function extractTestedFunctions(content) {
  const tested = new Set();

  // Match import statements to find imported functions
  const importRegex = /import\s*\{([^}]+)\}\s*from/g;
  for (const match of content.matchAll(importRegex)) {
    const imports = match[1].split(',').map((s) => s.trim().split(' as ')[0].trim());
    imports.forEach((fn) => tested.add(fn));
  }

  // Match function calls in test bodies
  const callRegex = /\b([\w]+)\s*\(/g;
  for (const match of content.matchAll(callRegex)) {
    tested.add(match[1]);
  }

  return tested;
}

/**
 * Analyze function coverage for a repo.
 */
function analyzeRepo(repoPath) {
  const structure = detectProjectStructure(repoPath);
  const repoName = path.basename(repoPath);
  const allFunctions = [];
  const testedFunctions = new Set();
  const untestedFunctions = [];

  // Extract all exported functions
  for (const jsDir of structure.jsDirs) {
    if (!fileExists(jsDir)) continue;
    const files = getAllFiles(jsDir).filter((f) => f.endsWith('.js') && !f.endsWith('.test.js'));
    for (const file of files) {
      const content = readTextFile(file);
      const functions = extractExportedFunctions(content);
      const fileName = path.basename(file, '.js');
      functions.forEach((fn) => allFunctions.push({ file: fileName, function: fn }));
    }
  }

  // Find which functions are tested
  for (const testDir of structure.testDirs) {
    if (!fileExists(testDir)) continue;
    const files = getAllFiles(testDir).filter((f) => f.endsWith('.test.js'));
    for (const file of files) {
      const content = readTextFile(file);
      const tested = extractTestedFunctions(content);
      tested.forEach((fn) => testedFunctions.add(fn));
    }
  }

  // Find untested functions
  for (const { file, function: fn } of allFunctions) {
    if (!testedFunctions.has(fn)) {
      untestedFunctions.push({ file, function: fn });
    }
  }

  return {
    repo: repoName,
    totalFunctions: allFunctions.length,
    testedCount: allFunctions.length - untestedFunctions.length,
    untestedFunctions,
    coverageRatio: allFunctions.length > 0 ? (allFunctions.length - untestedFunctions.length) / allFunctions.length : 1,
  };
}

/**
 * Scan function coverage across repos.
 */
export async function scan(repoPaths) {
  const repoData = repoPaths.map(analyzeRepo);

  const coverageRatios = repoData.map((r) => r.coverageRatio);
  const untestedCounts = repoData.map((r) => r.untestedFunctions.length);

  const findings = repoData
    .filter((r) => r.untestedFunctions.length > 0)
    .map((r) => ({
      repo: r.repo,
      severity: r.untestedFunctions.length > 10 ? 'high' : 'medium',
      summary: `${r.untestedFunctions.length} untested functions`,
      details: r.untestedFunctions.slice(0, 5).map((f) => `${f.file}.${f.function}`).join(', ') +
        (r.untestedFunctions.length > 5 ? '...' : ''),
    }));

  const overallEntropy = calculateEntropy(coverageRatios);

  return {
    name: DIMENSION_NAME,
    entropy: Math.round(overallEntropy * 10) / 10,
    repoData,
    uniformity: {
      coverageRatio: { values: coverageRatios, entropy: overallEntropy, stats: calculateNumericVariance(coverageRatios) },
      untestedCounts: { values: untestedCounts, stats: calculateNumericVariance(untestedCounts) },
    },
    findings,
  };
}

