/**
 * Code Patterns Scanner
 * Measures variance in architectural and coding patterns.
 *
 * @module scanners/code-patterns
 */

import path from 'path';
import { fileExists, readTextFile, getAllFiles, detectProjectStructure } from '../lib/config-parser.js';
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

// CRITICAL: Architectural patterns that MUST match the genesis template
// These detect CLASS-based vs FUNCTION-based architecture divergence
// Note: The genesis template has BOTH the Workflow class AND helper functions.
// The issue is repos that have helper functions WITHOUT the class.
const ARCHITECTURAL_PATTERNS = {
  workflowClass: {
    file: 'js/workflow.js',
    name: 'Workflow Class Architecture',
    required: [
      { pattern: /export\s+class\s+Workflow/, description: 'Must export Workflow class' },
      { pattern: /advancePhase\s*\(/, description: 'Must have advancePhase() method' },
      { pattern: /isComplete\s*\(/, description: 'Must have isComplete() method' },
      { pattern: /getCurrentPhase\s*\(/, description: 'Must have getCurrentPhase() method' },
      { pattern: /previousPhase\s*\(/, description: 'Must have previousPhase() method' },
      { pattern: /constructor\s*\(\s*project/, description: 'Must have constructor(project)' },
    ],
    // No forbidden patterns - helper functions are allowed alongside the class
    forbidden: [],
  },
};

/**
 * Check architectural conformity for a file.
 *
 * @param {string} content - File content
 * @param {object} archConfig - Architectural pattern config
 * @returns {object} Conformity result
 */
function checkArchitecturalConformity(content, archConfig) {
  const result = {
    conformant: true,
    score: 0,
    requiredMatches: [],
    requiredMissing: [],
    forbiddenViolations: [],
  };

  if (!content) {
    result.conformant = false;
    result.requiredMissing.push('File not readable');
    return result;
  }

  // Check required patterns
  for (const req of archConfig.required || []) {
    if (req.pattern.test(content)) {
      result.requiredMatches.push(req.description);
    } else {
      result.requiredMissing.push(req.description);
      result.conformant = false;
    }
  }

  // Check forbidden patterns
  for (const forbid of archConfig.forbidden || []) {
    if (forbid.pattern.test(content)) {
      result.forbiddenViolations.push(forbid.description);
      result.conformant = false;
    }
  }

  // Calculate score
  const requiredTotal = (archConfig.required || []).length;
  const requiredMatched = result.requiredMatches.length;
  const forbiddenCount = result.forbiddenViolations.length;

  if (requiredTotal > 0) {
    result.score = Math.max(0, (requiredMatched / requiredTotal) * 100 - forbiddenCount * 20);
  }

  return result;
}

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

    // Check ARCHITECTURAL patterns (CLASS-based vs FUNCTION-based)
    const architectureResults = {};
    for (const [archName, archConfig] of Object.entries(ARCHITECTURAL_PATTERNS)) {
      const filePath = path.join(repoPath, archConfig.file);
      const content = readTextFile(filePath);
      architectureResults[archName] = {
        name: archConfig.name,
        ...checkArchitecturalConformity(content, archConfig),
      };
    }

    // Check for ESM exports - handle both simple and paired project structures
    const structure = detectProjectStructure(repoPath);
    let esmExportCount = 0;
    let totalJsFiles = 0;

    // Files to exclude from ESM export check:
    // - *.min.js: Third-party minified libraries
    // - app.js: Entry points that import/run but don't export
    // - index.js in lib/: Library barrel files
    const shouldExcludeFromEsmCheck = (filePath) => {
      const basename = path.basename(filePath);
      const dirname = path.dirname(filePath);
      return (
        basename.endsWith('.min.js') ||
        (basename === 'app.js') ||
        (basename === 'index.js' && dirname.endsWith('/lib'))
      );
    };

    for (const jsDir of structure.jsDirs) {
      if (fileExists(jsDir)) {
        const jsFiles = getAllFiles(jsDir)
          .filter((f) => f.endsWith('.js'))
          .filter((f) => !shouldExcludeFromEsmCheck(f));
        totalJsFiles += jsFiles.length;

        for (const file of jsFiles) {
          const content = readTextFile(file);
          // Match ALL ESM export patterns:
          // - export const/function/class/default
          // - export { ... }
          // - export * from ...
          if (content && /^export\s+(const|function|class|default|\{|\*)/m.test(content)) {
            esmExportCount++;
          }
        }
      }
    }

    // Check if workflow uses the correct CLASS architecture
    const hasWorkflowClass = architectureResults.workflowClass?.conformant === true;

    repoData.push({
      repo: repoName,
      path: repoPath,
      patterns: patternResults,
      architecture: architectureResults,
      esmExportRatio: totalJsFiles > 0 ? esmExportCount / totalJsFiles : 0,
      hasStorage: patternResults.storage?.fileExists && patternResults.storage.ratio > 0.5,
      hasWorkflow: patternResults.workflow?.fileExists && patternResults.workflow.ratio > 0.5,
      hasWorkflowClass, // NEW: Does it use the Workflow CLASS pattern?
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
    // NEW: Track Workflow CLASS architecture conformity
    workflowClassArchitecture: {
      values: repoData.map((r) => r.hasWorkflowClass),
      entropy: calculateEntropy(repoData.map((r) => r.hasWorkflowClass)),
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
    // CRITICAL: Check for Workflow CLASS architecture FIRST
    if (!data.hasWorkflowClass) {
      const archResult = data.architecture?.workflowClass;
      const missingDetails = archResult?.requiredMissing?.join('; ') || 'Unknown';
      const violations = archResult?.forbiddenViolations?.join('; ') || '';

      findings.push({
        repo: data.repo,
        severity: 'critical', // HIGHEST severity - architectural divergence
        summary: '🚨 ARCHITECTURAL DIVERGENCE: Missing Workflow class pattern',
        details: `js/workflow.js must use genesis Workflow class architecture. Missing: ${missingDetails}${violations ? `. Violations: ${violations}` : ''}`,
      });
    }

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

