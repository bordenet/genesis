/**
 * Documentation Scanner
 * Measures variance in documentation files and structure.
 *
 * @module scanners/documentation
 */

import path from 'path';
import { fileExists, readTextFile } from '../lib/config-parser.js';
import { calculateEntropy } from '../lib/entropy.js';
import { loadExpectedValues } from '../lib/baseline-manager.js';

const DIMENSION_NAME = 'Documentation';

// Required README sections (case-insensitive)
const REQUIRED_SECTIONS = ['usage', 'installation', 'development', 'testing'];

/**
 * Analyze README structure.
 *
 * @param {string} content - README content
 * @returns {object} Sections found
 */
function analyzeReadmeStructure(content) {
  if (!content) return { sections: [], hasQuickStart: false };

  const headings = content.match(/^#+\s+(.+)$/gm) || [];
  const sections = headings.map((h) => h.replace(/^#+\s+/, '').toLowerCase());

  return {
    sections,
    hasQuickStart: sections.some((s) => s.includes('quick') || s.includes('start')),
    hasInstallation: sections.some((s) => s.includes('install')),
    hasUsage: sections.some((s) => s.includes('usage') || s.includes('how to')),
    hasDevelopment: sections.some((s) => s.includes('develop') || s.includes('contribut')),
    hasTesting: sections.some((s) => s.includes('test')),
  };
}

/**
 * Scan documentation across repos.
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

    // Check for required files
    const files = {
      readme: fileExists(path.join(repoPath, 'README.md')),
      license: fileExists(path.join(repoPath, 'LICENSE')),
      claudeMd: fileExists(path.join(repoPath, 'docs', 'CLAUDE.md')) ||
                fileExists(path.join(repoPath, 'CLAUDE.md')),
      changelog: fileExists(path.join(repoPath, 'CHANGELOG.md')),
      contributing: fileExists(path.join(repoPath, 'CONTRIBUTING.md')),
    };

    // Analyze README structure
    const readmeContent = readTextFile(path.join(repoPath, 'README.md'));
    const readmeStructure = analyzeReadmeStructure(readmeContent);

    repoData.push({
      repo: repoName,
      path: repoPath,
      ...files,
      readmeStructure,
      docCompleteness: Object.values(files).filter(Boolean).length / Object.keys(files).length,
    });
  }

  // Calculate entropy
  const uniformity = {
    hasReadme: {
      values: repoData.map((r) => r.readme),
      entropy: calculateEntropy(repoData.map((r) => r.readme)),
    },
    hasClaudeMd: {
      values: repoData.map((r) => r.claudeMd),
      entropy: calculateEntropy(repoData.map((r) => r.claudeMd)),
    },
    hasChangelog: {
      values: repoData.map((r) => r.changelog),
      entropy: calculateEntropy(repoData.map((r) => r.changelog)),
    },
    readmeHasUsage: {
      values: repoData.map((r) => r.readmeStructure.hasUsage),
      entropy: calculateEntropy(repoData.map((r) => r.readmeStructure.hasUsage)),
    },
  };

  // Generate findings
  const requiredFiles = expected.requiredFiles || [];
  const docFiles = requiredFiles.filter((f) =>
    f.endsWith('.md') || f.includes('LICENSE') || f.includes('CLAUDE')
  );

  for (const data of repoData) {
    if (!data.readme) {
      findings.push({
        repo: data.repo,
        severity: 'critical',
        summary: 'Missing README.md',
        details: 'Every repo must have a README.md',
      });
    } else {
      // Check README structure
      if (!data.readmeStructure.hasUsage) {
        findings.push({
          repo: data.repo,
          severity: 'medium',
          summary: 'README missing Usage section',
          details: 'README should include usage instructions',
        });
      }
      if (!data.readmeStructure.hasTesting) {
        findings.push({
          repo: data.repo,
          severity: 'low',
          summary: 'README missing Testing section',
          details: 'README should explain how to run tests',
        });
      }
    }

    if (!data.license) {
      findings.push({
        repo: data.repo,
        severity: 'high',
        summary: 'Missing LICENSE file',
        details: 'Every repo must have a LICENSE file',
      });
    }

    if (!data.claudeMd) {
      findings.push({
        repo: data.repo,
        severity: 'medium',
        summary: 'Missing CLAUDE.md',
        details: 'AI-assisted development requires docs/CLAUDE.md',
      });
    }

    if (!data.changelog) {
      findings.push({
        repo: data.repo,
        severity: 'low',
        summary: 'Missing CHANGELOG.md',
        details: 'Consider adding a changelog to track versions',
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

