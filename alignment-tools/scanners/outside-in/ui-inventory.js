/**
 * UI Inventory Scanner (Outside-In)
 * Analyzes UI components across projects for consistency.
 *
 * @module scanners/outside-in/ui-inventory
 */

import path from 'path';
import { fileExists, getAllFiles, readTextFile, detectProjectStructure } from '../../lib/config-parser.js';
import { calculateEntropy, calculateNumericVariance } from '../../lib/entropy.js';

const DIMENSION_NAME = 'UI Inventory';

// UI component patterns to detect
const PATTERNS = {
  buttons: /createElement\s*\(\s*['"]button['"]/gi,
  modals: /modal|dialog/gi,
  forms: /createElement\s*\(\s*['"]form['"]/gi,
  inputs: /createElement\s*\(\s*['"]input['"]/gi,
  textareas: /createElement\s*\(\s*['"]textarea['"]/gi,
  selects: /createElement\s*\(\s*['"]select['"]/gi,
  tabs: /tab(?:s|list|panel)/gi,
  cards: /card/gi,
  spinners: /spinner|loading/gi,
  toasts: /toast|notification|alert/gi,
  badges: /badge/gi,
  dropdowns: /dropdown|menu/gi,
};

/**
 * Count UI components in content.
 */
export function countComponents(content) {
  const counts = {};
  for (const [name, regex] of Object.entries(PATTERNS)) {
    const matches = content.match(regex) || [];
    counts[name] = matches.length;
  }
  return counts;
}

/**
 * Analyze UI inventory for a repo.
 */
function analyzeRepo(repoPath) {
  const structure = detectProjectStructure(repoPath);
  const repoName = path.basename(repoPath);
  const componentCounts = {};

  // Initialize counts
  for (const name of Object.keys(PATTERNS)) {
    componentCounts[name] = 0;
  }

  // Scan JS files
  for (const jsDir of structure.jsDirs) {
    if (!fileExists(jsDir)) continue;
    const files = getAllFiles(jsDir).filter((f) => f.endsWith('.js') && !f.endsWith('.test.js'));
    for (const file of files) {
      const content = readTextFile(file);
      const counts = countComponents(content);
      for (const [name, count] of Object.entries(counts)) {
        componentCounts[name] += count;
      }
    }
  }

  // Scan HTML files
  const htmlDirs = structure.type === 'paired'
    ? [path.join(repoPath, 'assistant'), path.join(repoPath, 'validator')]
    : [repoPath];

  for (const htmlDir of htmlDirs) {
    if (!fileExists(htmlDir)) continue;
    const htmlFiles = getAllFiles(htmlDir).filter((f) => f.endsWith('.html'));
    for (const file of htmlFiles) {
      const content = readTextFile(file);
      const counts = countComponents(content);
      for (const [name, count] of Object.entries(counts)) {
        componentCounts[name] += count;
      }
    }
  }

  return {
    repo: repoName,
    components: componentCounts,
    totalComponents: Object.values(componentCounts).reduce((a, b) => a + b, 0),
  };
}

/**
 * Scan UI inventory across repos.
 */
export async function scan(repoPaths) {
  const repoData = repoPaths.map(analyzeRepo);

  // Calculate per-component entropy
  const componentEntropies = {};
  for (const name of Object.keys(PATTERNS)) {
    const values = repoData.map((r) => r.components[name]);
    componentEntropies[name] = {
      values,
      entropy: calculateEntropy(values),
      stats: calculateNumericVariance(values),
    };
  }

  // Find missing components (present in some but not all)
  const findings = [];
  for (const [name, data] of Object.entries(componentEntropies)) {
    const hasComponent = data.values.filter((v) => v > 0).length;
    if (hasComponent > 0 && hasComponent < repoData.length) {
      const missing = repoData
        .filter((r) => r.components[name] === 0)
        .map((r) => r.repo);
      if (missing.length > 0 && missing.length < repoData.length) {
        findings.push({
          repo: missing.join(', '),
          severity: 'low',
          summary: `Missing ${name} component`,
          details: `Component '${name}' is present in other projects but missing here`,
        });
      }
    }
  }

  const allEntropies = Object.values(componentEntropies).map((e) => e.entropy);
  const overallEntropy = allEntropies.length > 0
    ? allEntropies.reduce((a, b) => a + b, 0) / allEntropies.length
    : 0;

  return {
    name: DIMENSION_NAME,
    entropy: Math.round(overallEntropy * 10) / 10,
    repoData,
    uniformity: componentEntropies,
    findings,
  };
}

