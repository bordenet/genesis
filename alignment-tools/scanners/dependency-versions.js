/**
 * Dependency Versions Scanner
 * Measures variance in dependency versions across repos.
 *
 * @module scanners/dependency-versions
 */

import path from 'path';
import { readJsonFile } from '../lib/config-parser.js';
import { calculateEntropy } from '../lib/entropy.js';

const DIMENSION_NAME = 'Dependency Versions';

// Critical dependencies that should be aligned
const CRITICAL_DEPS = ['jest', 'eslint', 'tailwindcss', '@testing-library/dom'];

/**
 * Extract major version from a semver string.
 *
 * @param {string} version - Version string (e.g., "^29.7.0")
 * @returns {number|null} Major version number
 */
function extractMajorVersion(version) {
  if (!version) return null;
  const match = version.replace(/^[\^~]/, '').match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Scan dependency versions across repos.
 *
 * @param {string[]} repoPaths - Array of absolute paths to repos
 * @returns {object} Scan results for this dimension
 */
export async function scan(repoPaths) {
  const findings = [];
  const repoData = [];
  const depVersions = {};

  for (const repoPath of repoPaths) {
    const repoName = path.basename(repoPath);
    const pkgPath = path.join(repoPath, 'package.json');
    const pkg = readJsonFile(pkgPath);

    const allDeps = {
      ...(pkg?.dependencies || {}),
      ...(pkg?.devDependencies || {}),
    };

    const criticalVersions = {};
    for (const dep of CRITICAL_DEPS) {
      if (allDeps[dep]) {
        criticalVersions[dep] = allDeps[dep];
        if (!depVersions[dep]) depVersions[dep] = [];
        depVersions[dep].push({
          repo: repoName,
          version: allDeps[dep],
          major: extractMajorVersion(allDeps[dep]),
        });
      }
    }

    repoData.push({
      repo: repoName,
      path: repoPath,
      hasPackageJson: pkg !== null,
      dependencyCount: Object.keys(allDeps).length,
      criticalVersions,
    });
  }

  // Calculate entropy for each critical dependency
  const uniformity = {};
  for (const dep of CRITICAL_DEPS) {
    const versions = depVersions[dep] || [];
    uniformity[dep] = {
      values: versions.map((v) => v.version),
      majorVersions: versions.map((v) => v.major),
      entropy: calculateEntropy(versions.map((v) => v.major)),
    };
  }

  // Generate findings for version mismatches
  for (const dep of CRITICAL_DEPS) {
    const versions = depVersions[dep] || [];
    if (versions.length < 2) continue;

    const majorVersions = [...new Set(versions.map((v) => v.major))].filter((v) => v !== null);
    if (majorVersions.length > 1) {
      // Find the most common major version
      const versionCounts = {};
      for (const v of versions) {
        if (v.major !== null) {
          versionCounts[v.major] = (versionCounts[v.major] || 0) + 1;
        }
      }
      const expectedMajor = Object.entries(versionCounts)
        .sort((a, b) => b[1] - a[1])[0][0];

      for (const v of versions) {
        if (v.major !== null && v.major !== parseInt(expectedMajor, 10)) {
          findings.push({
            repo: v.repo,
            severity: 'high',
            summary: `${dep} major version is ${v.major}, expected ${expectedMajor}`,
            details: `Actual: ${v.version}, most common major: ${expectedMajor}`,
            dependency: dep,
            actualVersion: v.version,
            expectedMajor: parseInt(expectedMajor, 10),
          });
        }
      }
    }
  }

  // Check for missing critical dependencies
  for (const data of repoData) {
    if (!data.hasPackageJson) continue;
    for (const dep of CRITICAL_DEPS) {
      if (!data.criticalVersions[dep]) {
        findings.push({
          repo: data.repo,
          severity: 'medium',
          summary: `Missing critical dependency: ${dep}`,
          details: `Expected ${dep} to be present in package.json`,
        });
      }
    }
  }

  const entropies = Object.values(uniformity).map((u) => u.entropy).filter((e) => !isNaN(e));
  const overallEntropy = entropies.length > 0
    ? entropies.reduce((a, b) => a + b, 0) / entropies.length
    : 0;

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

