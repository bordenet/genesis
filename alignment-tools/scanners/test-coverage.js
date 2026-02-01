/**
 * Test Coverage Scanner
 * Measures variance in Jest configuration and actual test coverage across repos.
 *
 * @module scanners/test-coverage
 */

import path from 'path';
import { parseJestConfig, fileExists } from '../lib/config-parser.js';
import { calculateEntropy, calculateNumericVariance } from '../lib/entropy.js';
import { loadExpectedValues } from '../lib/baseline-manager.js';

const DIMENSION_NAME = 'Test Coverage';

/**
 * Scan test coverage configuration and thresholds across repos.
 *
 * @param {string[]} repoPaths - Array of absolute paths to repos
 * @returns {object} Scan results for this dimension
 */
export async function scan(repoPaths) {
  const expected = loadExpectedValues();
  const findings = [];
  const repoData = [];

  // Collect data from all repos
  for (const repoPath of repoPaths) {
    const repoName = path.basename(repoPath);
    const jestConfigPath = path.join(repoPath, 'jest.config.js');

    const config = parseJestConfig(jestConfigPath);
    const thresholds = config?.coverageThreshold?.global || {};

    repoData.push({
      repo: repoName,
      path: repoPath,
      hasJestConfig: fileExists(jestConfigPath),
      statements: thresholds.statements ?? null,
      branches: thresholds.branches ?? null,
      functions: thresholds.functions ?? null,
      lines: thresholds.lines ?? null,
      testEnvironment: config?.testEnvironment ?? null,
    });
  }

  // Calculate entropy for each threshold type
  const statementsValues = repoData.map((r) => r.statements).filter((v) => v !== null);
  const branchesValues = repoData.map((r) => r.branches).filter((v) => v !== null);
  const functionsValues = repoData.map((r) => r.functions).filter((v) => v !== null);
  const linesValues = repoData.map((r) => r.lines).filter((v) => v !== null);

  const uniformity = {
    statements: {
      values: statementsValues,
      entropy: calculateEntropy(statementsValues),
      stats: calculateNumericVariance(statementsValues),
    },
    branches: {
      values: branchesValues,
      entropy: calculateEntropy(branchesValues),
      stats: calculateNumericVariance(branchesValues),
    },
    functions: {
      values: functionsValues,
      entropy: calculateEntropy(functionsValues),
      stats: calculateNumericVariance(functionsValues),
    },
    lines: {
      values: linesValues,
      entropy: calculateEntropy(linesValues),
      stats: calculateNumericVariance(linesValues),
    },
  };

  // Generate findings for deviations from expected values
  const expectedThresholds = expected.jestConfig?.coverageThreshold || {};
  for (const data of repoData) {
    if (!data.hasJestConfig) {
      findings.push({
        repo: data.repo,
        severity: 'critical',
        summary: 'Missing jest.config.js',
        details: 'Repository does not have a Jest configuration file',
      });
      continue;
    }

    // Check each threshold
    for (const key of ['statements', 'branches', 'functions', 'lines']) {
      const actual = data[key];
      const expectedVal = expectedThresholds[key];
      if (actual !== null && expectedVal !== undefined && actual !== expectedVal) {
        const deviation = actual - expectedVal;
        findings.push({
          repo: data.repo,
          severity: Math.abs(deviation) >= 10 ? 'high' : 'medium',
          summary: `${key} threshold is ${actual}, expected ${expectedVal}`,
          details: `Deviation of ${deviation > 0 ? '+' : ''}${deviation} from baseline`,
          metric: key,
          actual,
          expected: expectedVal,
          deviation,
        });
      }
    }
  }

  // Calculate overall entropy for this dimension
  const allEntropies = [
    uniformity.statements.entropy,
    uniformity.branches.entropy,
    uniformity.functions.entropy,
    uniformity.lines.entropy,
  ].filter((e) => !isNaN(e));
  const overallEntropy = allEntropies.length > 0
    ? allEntropies.reduce((a, b) => a + b, 0) / allEntropies.length
    : 0;

  return {
    name: DIMENSION_NAME,
    entropy: Math.round(overallEntropy * 10) / 10,
    repoData,
    uniformity,
    findings: findings.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const aOrder = severityOrder[a.severity] ?? 4;
      const bOrder = severityOrder[b.severity] ?? 4;
      return aOrder - bOrder;
    }),
  };
}

