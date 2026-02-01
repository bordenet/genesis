/**
 * Code Patterns Scanner
 * Measures variance in architectural and coding patterns.
 *
 * @module scanners/code-patterns
 */

import path from 'path';
import { fileExists, readTextFile, getAllFiles } from '../lib/config-parser.js';
import { calculateEntropy } from '../lib/entropy.js';

const DIMENSION_NAME = 'Code Patterns';

// Core patterns to check
const CORE_PATTERNS = {
  storage: {
    file: 'js/storage.js',
    patterns: [/IndexedDB|indexedDB/, /openDatabase|openDB/, /objectStore/],
  },
  workflow: {
    file: 'js/workflow.js',
    patterns: [/phases?|steps?|stages?/i, /getCurrentPhase|getPhase/, /setPhase|nextPhase/],
  },
  router: {
    file: 'js/router.js',
    patterns: [/hashchange|popstate/, /navigate|route/, /window\.location\.hash/],
  },
  errorHandler: {
    file: 'js/error-handler.js',
    patterns: [/try\s*{|catch\s*\(/, /handleError|showError/, /toast|notification/i],
  },
};

/**
 * Analyze code patterns in a file.
 *
 * @param {string} content - File content
 * @param {RegExp[]} patterns - Patterns to look for
 * @returns {object} Pattern matches
 */
function analyzePatterns(content, patterns) {
  if (!content) return { matches: 0, total: patterns.length, ratio: 0 };

  const matches = patterns.filter((p) => p.test(content)).length;
  return {
    matches,
    total: patterns.length,
    ratio: matches / patterns.length,
  };
}

/**
 * Scan code patterns across repos.
 *
 * @param {string[]} repoPaths - Array of absolute paths to repos
 * @returns {object} Scan results for this dimension
 */
export async function scan(repoPaths) {
  const findings = [];
  const repoData = [];

  for (const repoPath of repoPaths) {
    const repoName = path.basename(repoPath);
    const patternResults = {};

    for (const [patternName, config] of Object.entries(CORE_PATTERNS)) {
      const filePath = path.join(repoPath, config.file);
      const content = readTextFile(filePath);

      patternResults[patternName] = {
        fileExists: fileExists(filePath),
        ...analyzePatterns(content, config.patterns),
      };
    }

    // Check for ESM exports
    const jsDir = path.join(repoPath, 'js');
    let esmExportCount = 0;
    let totalJsFiles = 0;

    if (fileExists(jsDir)) {
      const jsFiles = getAllFiles(jsDir).filter((f) => f.endsWith('.js'));
      totalJsFiles = jsFiles.length;

      for (const file of jsFiles) {
        const content = readTextFile(file);
        if (content && /^export\s+(const|function|class|default)/m.test(content)) {
          esmExportCount++;
        }
      }
    }

    repoData.push({
      repo: repoName,
      path: repoPath,
      patterns: patternResults,
      esmExportRatio: totalJsFiles > 0 ? esmExportCount / totalJsFiles : 0,
      hasStorage: patternResults.storage?.fileExists && patternResults.storage.ratio > 0.5,
      hasWorkflow: patternResults.workflow?.fileExists && patternResults.workflow.ratio > 0.5,
      hasRouter: patternResults.router?.fileExists && patternResults.router.ratio > 0.5,
      hasErrorHandler: patternResults.errorHandler?.fileExists,
    });
  }

  // Calculate entropy
  const uniformity = {
    storagePattern: {
      values: repoData.map((r) => r.hasStorage),
      entropy: calculateEntropy(repoData.map((r) => r.hasStorage)),
    },
    workflowPattern: {
      values: repoData.map((r) => r.hasWorkflow),
      entropy: calculateEntropy(repoData.map((r) => r.hasWorkflow)),
    },
    routerPattern: {
      values: repoData.map((r) => r.hasRouter),
      entropy: calculateEntropy(repoData.map((r) => r.hasRouter)),
    },
    esmExports: {
      values: repoData.map((r) => r.esmExportRatio > 0.8),
      entropy: calculateEntropy(repoData.map((r) => r.esmExportRatio > 0.8)),
    },
  };

  // Generate findings
  for (const data of repoData) {
    if (!data.hasStorage) {
      findings.push({
        repo: data.repo,
        severity: 'high',
        summary: 'Missing or non-conformant storage pattern',
        details: 'js/storage.js should use IndexedDB pattern',
      });
    }

    if (!data.hasWorkflow) {
      findings.push({
        repo: data.repo,
        severity: 'high',
        summary: 'Missing or non-conformant workflow pattern',
        details: 'js/workflow.js should implement phase-based workflow',
      });
    }

    if (!data.hasRouter) {
      findings.push({
        repo: data.repo,
        severity: 'medium',
        summary: 'Missing or non-conformant router pattern',
        details: 'js/router.js should use hash-based routing',
      });
    }

    if (!data.hasErrorHandler) {
      findings.push({
        repo: data.repo,
        severity: 'medium',
        summary: 'Missing error handler',
        details: 'js/error-handler.js should be present',
      });
    }

    if (data.esmExportRatio < 0.8) {
      findings.push({
        repo: data.repo,
        severity: 'low',
        summary: `Low ESM export usage: ${Math.round(data.esmExportRatio * 100)}%`,
        details: 'All JS files should use ES module exports',
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

