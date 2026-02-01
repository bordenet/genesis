/**
 * Config Parity Scanner
 * Measures variance in package.json, ESLint, and other config files.
 *
 * @module scanners/config-parity
 */

import path from 'path';
import { readJsonFile, parseEslintConfig, fileExists } from '../lib/config-parser.js';
import { calculateEntropy } from '../lib/entropy.js';
import { loadExpectedValues } from '../lib/baseline-manager.js';

const DIMENSION_NAME = 'Config Parity';

/**
 * Scan configuration parity across repos.
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
    const pkgPath = path.join(repoPath, 'package.json');
    const eslintPath = path.join(repoPath, 'eslint.config.js');

    const pkg = readJsonFile(pkgPath);
    const eslint = parseEslintConfig(eslintPath);

    repoData.push({
      repo: repoName,
      path: repoPath,
      hasPackageJson: pkg !== null,
      hasEslintConfig: fileExists(eslintPath),
      moduleType: pkg?.type ?? null,
      scripts: pkg?.scripts ?? {},
      eslintRules: eslint?.rules ?? {},
      engineNode: pkg?.engines?.node ?? null,
    });
  }

  // Calculate entropy for key config values
  const uniformity = {
    moduleType: {
      values: repoData.map((r) => r.moduleType),
      entropy: calculateEntropy(repoData.map((r) => r.moduleType)),
    },
    testScript: {
      values: repoData.map((r) => r.scripts.test || null),
      entropy: calculateEntropy(repoData.map((r) => r.scripts.test || null)),
    },
    lintScript: {
      values: repoData.map((r) => r.scripts.lint || null),
      entropy: calculateEntropy(repoData.map((r) => r.scripts.lint || null)),
    },
    eslintQuotes: {
      values: repoData.map((r) => r.eslintRules.quotes || null),
      entropy: calculateEntropy(repoData.map((r) => r.eslintRules.quotes || null)),
    },
  };

  // Generate findings
  const expectedPkg = expected.packageJson || {};
  const expectedEslint = expected.eslintConfig || {};

  for (const data of repoData) {
    if (!data.hasPackageJson) {
      findings.push({
        repo: data.repo,
        severity: 'critical',
        summary: 'Missing package.json',
        details: 'Repository does not have a package.json file',
      });
      continue;
    }

    // Check module type
    if (expectedPkg.type && data.moduleType !== expectedPkg.type) {
      findings.push({
        repo: data.repo,
        severity: 'high',
        summary: `Module type is "${data.moduleType}", expected "${expectedPkg.type}"`,
        details: 'ESM module type is required for consistency',
      });
    }

    // Check scripts
    if (expectedPkg.scripts) {
      for (const [scriptName, expectedScript] of Object.entries(expectedPkg.scripts)) {
        const actualScript = data.scripts[scriptName];
        if (!actualScript) {
          findings.push({
            repo: data.repo,
            severity: 'medium',
            summary: `Missing script: ${scriptName}`,
            details: `Expected: ${expectedScript}`,
          });
        } else if (actualScript !== expectedScript) {
          // Check if functionally equivalent (ignore minor differences)
          const normalized1 = actualScript.replace(/\s+/g, ' ').trim();
          const normalized2 = expectedScript.replace(/\s+/g, ' ').trim();
          if (normalized1 !== normalized2) {
            findings.push({
              repo: data.repo,
              severity: 'low',
              summary: `Script "${scriptName}" differs from baseline`,
              details: `Actual: ${actualScript}\nExpected: ${expectedScript}`,
            });
          }
        }
      }
    }

    // Check ESLint config
    if (!data.hasEslintConfig) {
      findings.push({
        repo: data.repo,
        severity: 'high',
        summary: 'Missing eslint.config.js',
        details: 'ESLint configuration is required',
      });
    } else if (expectedEslint.quotes && data.eslintRules.quotes !== expectedEslint.quotes) {
      findings.push({
        repo: data.repo,
        severity: 'medium',
        summary: `ESLint quotes rule: "${data.eslintRules.quotes}", expected "${expectedEslint.quotes}"`,
        details: 'Quote style should be consistent across repos',
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

