/**
 * Import Health Scanner
 * Detects broken imports, project-specific import leaks, and missing required imports.
 *
 * @module scanners/import-health
 */

import path from 'path';
import { fileExists, readTextFile, getAllFiles, detectProjectStructure } from '../lib/config-parser.js';
import { calculateEntropy } from '../lib/entropy.js';

const DIMENSION_NAME = 'Import Health';

// Files that ONLY exist in specific projects
const PROJECT_SPECIFIC_IMPORTS = {
  'product-requirements-assistant': ['validator-inline.js'],
};

// Required imports when certain functions are used
const CONDITIONAL_IMPORTS = {
  getPhaseMetadata: {
    source: 'workflow.js',
    pattern: /getPhaseMetadata\s*\(/,
    importPattern: /import\s*\{[^}]*getPhaseMetadata[^}]*\}\s*from\s*['"]\.\/workflow\.js['"]/,
  },
};

// Core JS files to scan for imports
const CORE_FILES = ['project-view.js', 'app.js', 'workflow.js', 'projects.js'];

/**
 * Extract all local imports from a file.
 *
 * @param {string} content - File content
 * @returns {string[]} Array of imported file paths
 */
function extractLocalImports(content) {
  if (!content) return [];
  const importRegex = /from\s*['"]\.\/([^'"]+)['"]/g;
  const imports = [];
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

/**
 * Scan a single repository for import health.
 *
 * @param {string} repoPath - Absolute path to repository root
 * @returns {object} Import health data for the repository
 */
export async function scanRepo(repoPath) {
  const structure = detectProjectStructure(repoPath);
  const jsDir = path.join(repoPath, structure.jsDir || 'js');
  const repoName = path.basename(repoPath);

  const data = {
    repo: repoName,
    totalImports: 0,
    brokenImports: [],
    projectSpecificLeaks: [],
    missingConditionalImports: [],
    healthScore: 100,
  };

  // Scan each core file
  for (const coreFile of CORE_FILES) {
    const filePath = path.join(jsDir, coreFile);
    if (!fileExists(filePath)) continue;

    const content = readTextFile(filePath);
    if (!content) continue;

    const imports = extractLocalImports(content);
    data.totalImports += imports.length;

    // Check for broken imports
    for (const imp of imports) {
      const importPath = path.join(jsDir, imp);
      if (!fileExists(importPath)) {
        data.brokenImports.push({ file: coreFile, import: imp });
      }
    }

    // Check for project-specific import leaks
    for (const [project, specificFiles] of Object.entries(PROJECT_SPECIFIC_IMPORTS)) {
      if (repoName === project) continue; // Skip the project itself
      for (const specificFile of specificFiles) {
        if (imports.includes(specificFile)) {
          data.projectSpecificLeaks.push({
            file: coreFile,
            import: specificFile,
            ownerProject: project,
          });
        }
      }
    }

    // Check conditional imports (skip checking in the source file itself)
    for (const [funcName, config] of Object.entries(CONDITIONAL_IMPORTS)) {
      // Skip if this is the source file (e.g., don't check if workflow.js imports from itself)
      if (coreFile === config.source) continue;
      if (config.pattern.test(content) && !config.importPattern.test(content)) {
        data.missingConditionalImports.push({
          file: coreFile,
          function: funcName,
          requiredSource: config.source,
        });
      }
    }
  }

  // Calculate health score (100 = perfect, 0 = critical issues)
  const brokenPenalty = data.brokenImports.length * 25;
  const leakPenalty = data.projectSpecificLeaks.length * 30;
  const missingPenalty = data.missingConditionalImports.length * 15;
  data.healthScore = Math.max(0, 100 - brokenPenalty - leakPenalty - missingPenalty);

  return data;
}

/**
 * Main scan function that scans all repos and aggregates results.
 *
 * @param {string[]} repoPaths - Array of absolute paths to repos
 * @returns {Promise<object>} Scan results for this dimension
 */
export async function scan(repoPaths) {
  const repoResults = [];
  for (const repoPath of repoPaths) {
    const result = await scanRepo(repoPath);
    repoResults.push(result);
  }
  return aggregate(repoResults);
}

/**
 * Aggregate results from all repositories.
 *
 * @param {object[]} repoResults - Array of per-repo scan results
 * @returns {object} Aggregated scan result with entropy
 */
export function aggregate(repoResults) {
  const repoData = repoResults;
  const findings = [];

  // Calculate health score variance
  const healthScores = repoData.map((r) => r.healthScore);
  const uniformity = {
    healthScore: calculateEntropy(healthScores),
  };

  // Generate findings
  for (const data of repoData) {
    for (const broken of data.brokenImports) {
      findings.push({
        repo: data.repo,
        severity: 'critical',
        summary: `Broken import: ${broken.file} → ${broken.import}`,
        details: `File ${broken.file} imports '${broken.import}' but file does NOT exist`,
      });
    }

    for (const leak of data.projectSpecificLeaks) {
      findings.push({
        repo: data.repo,
        severity: 'critical',
        summary: `Project-specific import leak: ${leak.import}`,
        details: `${leak.file} imports '${leak.import}' which only exists in ${leak.ownerProject}. THIS WILL BREAK THE APP!`,
      });
    }

    for (const missing of data.missingConditionalImports) {
      findings.push({
        repo: data.repo,
        severity: 'high',
        summary: `Missing import for ${missing.function}`,
        details: `${missing.file} uses ${missing.function}() but doesn't import it from ${missing.requiredSource}`,
      });
    }
  }

  // Calculate overall entropy based on health scores
  const avgHealth = healthScores.reduce((a, b) => a + b, 0) / healthScores.length;
  const entropy = 100 - avgHealth; // Lower health = higher entropy

  return {
    name: DIMENSION_NAME,
    entropy: Math.round(entropy * 10) / 10,
    repoData,
    uniformity,
    findings: findings.sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
    }),
  };
}

