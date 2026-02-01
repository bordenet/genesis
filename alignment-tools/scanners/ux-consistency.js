/**
 * UX Consistency Scanner
 * Measures variance in UI patterns, styles, and user experience elements.
 *
 * @module scanners/ux-consistency
 */

import path from 'path';
import { readTextFile, fileExists } from '../lib/config-parser.js';
import { calculateEntropy } from '../lib/entropy.js';
import { loadExpectedValues } from '../lib/baseline-manager.js';

const DIMENSION_NAME = 'UX Consistency';

/**
 * Extract Tailwind classes from HTML content.
 *
 * @param {string} content - HTML content
 * @returns {object} Extracted class patterns
 */
function extractTailwindPatterns(content) {
  const patterns = {
    hasDarkMode: /dark:/i.test(content),
    textSizes: [],
    colors: [],
    buttonClasses: [],
    containerPatterns: [],
  };

  // Extract text sizes
  const textSizeMatches = content.match(/text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)/g) || [];
  patterns.textSizes = [...new Set(textSizeMatches)];

  // Extract color classes
  const colorMatches = content.match(/(bg|text|border)-(blue|gray|green|red|yellow|indigo|purple|pink)-\d{2,3}/g) || [];
  patterns.colors = [...new Set(colorMatches)];

  // Extract button patterns
  const buttonMatches = content.match(/class="[^"]*btn[^"]*"/g) || [];
  patterns.buttonClasses = buttonMatches.slice(0, 5);

  // Check for container patterns
  patterns.hasMaxWContainer = /max-w-(sm|md|lg|xl|2xl|4xl|6xl)/.test(content);
  patterns.hasMxAuto = /mx-auto/.test(content);

  return patterns;
}

/**
 * Scan UX consistency across repos.
 *
 * @param {string[]} repoPaths - Array of absolute paths to repos
 * @returns {object} Scan results for this dimension
 */
export async function scan(repoPaths) {
  const expected = loadExpectedValues();
  const findings = [];
  const repoData = [];

  for (const repoPath of repoPaths) {
    const repoName = path.basename(repoPath);
    const indexPath = path.join(repoPath, 'index.html');

    const htmlContent = readTextFile(indexPath);
    const patterns = htmlContent ? extractTailwindPatterns(htmlContent) : null;

    repoData.push({
      repo: repoName,
      path: repoPath,
      hasIndexHtml: fileExists(indexPath),
      hasDarkMode: patterns?.hasDarkMode ?? false,
      textSizes: patterns?.textSizes ?? [],
      primaryTextSize: patterns?.textSizes?.[0] ?? null,
      colors: patterns?.colors ?? [],
      hasMaxWContainer: patterns?.hasMaxWContainer ?? false,
      hasMxAuto: patterns?.hasMxAuto ?? false,
    });
  }

  // Calculate entropy for UX elements
  const uniformity = {
    darkMode: {
      values: repoData.map((r) => r.hasDarkMode),
      entropy: calculateEntropy(repoData.map((r) => r.hasDarkMode)),
    },
    primaryTextSize: {
      values: repoData.map((r) => r.primaryTextSize),
      entropy: calculateEntropy(repoData.map((r) => r.primaryTextSize)),
    },
    containerPattern: {
      values: repoData.map((r) => r.hasMaxWContainer && r.hasMxAuto),
      entropy: calculateEntropy(repoData.map((r) => r.hasMaxWContainer && r.hasMxAuto)),
    },
  };

  // Generate findings
  const expectedUx = expected.uxPatterns || {};

  for (const data of repoData) {
    if (!data.hasIndexHtml) {
      findings.push({
        repo: data.repo,
        severity: 'critical',
        summary: 'Missing index.html',
        details: 'Repository does not have an index.html file',
      });
      continue;
    }

    // Check dark mode support
    if (expectedUx.darkModeSupport && !data.hasDarkMode) {
      findings.push({
        repo: data.repo,
        severity: 'medium',
        summary: 'Missing dark mode support',
        details: 'No dark: Tailwind classes found in HTML',
      });
    }

    // Check container patterns
    if (!data.hasMaxWContainer || !data.hasMxAuto) {
      findings.push({
        repo: data.repo,
        severity: 'low',
        summary: 'Non-standard container pattern',
        details: 'Missing max-w-* or mx-auto container classes',
      });
    }
  }

  // Calculate overall entropy
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

