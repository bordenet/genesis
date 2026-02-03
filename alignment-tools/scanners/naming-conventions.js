/**
 * Naming Conventions Scanner
 * Measures variance in naming patterns for files, functions, and variables.
 *
 * @module scanners/naming-conventions
 */

import path from 'path';
import { getAllFiles, readTextFile, detectProjectStructure, fileExists } from '../lib/config-parser.js';
import { calculateEntropy } from '../lib/entropy.js';

const DIMENSION_NAME = 'Naming Conventions';

/**
 * Analyze naming patterns in JavaScript files.
 *
 * @param {string} content - JavaScript file content
 * @returns {object} Naming pattern analysis
 */
function analyzeNamingPatterns(content) {
  const patterns = {
    usesNamedExports: /export\s+(const|function|class)\s+\w+/.test(content),
    usesDefaultExport: /export\s+default/.test(content),
    functionNaming: 'camelCase',
    hasTypeAnnotations: false,
  };

  // Check function naming (camelCase vs other)
  const functionMatches = content.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g) || [];
  const arrowFunctions = content.match(/(?:const|let)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g) || [];

  // Detect if using camelCase
  const allNames = [...functionMatches, ...arrowFunctions];
  const camelCasePattern = /^[a-z][a-zA-Z0-9]*$/;
  const camelCaseCount = allNames.filter((n) => {
    const name = n.replace(/^(function\s+|const\s+|let\s+)/, '').replace(/\s*=$/, '');
    return camelCasePattern.test(name);
  }).length;

  patterns.camelCaseRatio = allNames.length > 0 ? camelCaseCount / allNames.length : 1;

  return patterns;
}

/**
 * Scan naming conventions across repos.
 *
 * @param {string[]} repoPaths - Array of absolute paths to repos
 * @returns {object} Scan results for this dimension
 */
export async function scan(repoPaths) {
  const findings = [];
  const repoData = [];

  for (const repoPath of repoPaths) {
    const repoName = path.basename(repoPath);
    const structure = detectProjectStructure(repoPath);

    // Analyze JS files across all JS directories (handles paired projects)
    let totalNamedExports = 0;
    let totalDefaultExports = 0;
    let totalCamelCaseRatio = 0;
    let jsFileCount = 0;

    for (const jsDir of structure.jsDirs) {
      if (fileExists(jsDir)) {
        const jsFiles = getAllFiles(jsDir).filter((f) => f.endsWith('.js'));
        for (const file of jsFiles) {
          const content = readTextFile(file);
          if (content) {
            const patterns = analyzeNamingPatterns(content);
            if (patterns.usesNamedExports) totalNamedExports++;
            if (patterns.usesDefaultExport) totalDefaultExports++;
            totalCamelCaseRatio += patterns.camelCaseRatio;
            jsFileCount++;
          }
        }
      }
    }

    // Check test file naming across all test directories
    const testFilePattern = /\.test\.js$/;
    let testFilesFollowPattern = true;
    for (const testsDir of structure.testDirs) {
      if (fileExists(testsDir)) {
        const testFiles = getAllFiles(testsDir).filter((f) => f.endsWith('.js'));
        const allFollow = testFiles.every((f) => testFilePattern.test(f));
        if (!allFollow) testFilesFollowPattern = false;
      }
    }

    repoData.push({
      repo: repoName,
      path: repoPath,
      jsFileCount,
      namedExportRatio: jsFileCount > 0 ? totalNamedExports / jsFileCount : 0,
      defaultExportRatio: jsFileCount > 0 ? totalDefaultExports / jsFileCount : 0,
      avgCamelCaseRatio: jsFileCount > 0 ? totalCamelCaseRatio / jsFileCount : 1,
      testFilesFollowPattern,
    });
  }

  // Calculate entropy
  const uniformity = {
    exportStyle: {
      values: repoData.map((r) => r.namedExportRatio > 0.5 ? 'named' : 'default'),
      entropy: calculateEntropy(repoData.map((r) => r.namedExportRatio > 0.5 ? 'named' : 'default')),
    },
    camelCase: {
      values: repoData.map((r) => r.avgCamelCaseRatio > 0.8),
      entropy: calculateEntropy(repoData.map((r) => r.avgCamelCaseRatio > 0.8)),
    },
    testNaming: {
      values: repoData.map((r) => r.testFilesFollowPattern),
      entropy: calculateEntropy(repoData.map((r) => r.testFilesFollowPattern)),
    },
  };

  // Generate findings
  for (const data of repoData) {
    if (data.avgCamelCaseRatio < 0.8) {
      findings.push({
        repo: data.repo,
        severity: 'low',
        summary: `Low camelCase usage: ${Math.round(data.avgCamelCaseRatio * 100)}%`,
        details: 'Functions and variables should use camelCase naming',
      });
    }

    if (!data.testFilesFollowPattern) {
      findings.push({
        repo: data.repo,
        severity: 'medium',
        summary: 'Test files do not follow *.test.js pattern',
        details: 'All test files should end with .test.js',
      });
    }
  }

  const entropies = Object.values(uniformity).map((u) => u.entropy);
  const overallEntropy = entropies.reduce((a, b) => a + b, 0) / entropies.length;

  return {
    name: DIMENSION_NAME,
    entropy: Math.round(overallEntropy * 10) / 10,
    repoData,
    uniformity,
    findings: findings.sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
    }),
  };
}

