/**
 * Test Coverage Scanner
 * Measures variance in Jest configuration, actual test coverage, and test implementation across repos.
 *
 * @module scanners/test-coverage
 */

import path from 'path';
import {
  parseJestConfig,
  fileExists,
  detectProjectStructure,
  parseLcovCoverage,
  countTestCases,
  getAllFiles,
  readTextFile,
} from '../lib/config-parser.js';
import { calculateEntropy, calculateNumericVariance } from '../lib/entropy.js';
import { loadExpectedValues } from '../lib/baseline-manager.js';

const DIMENSION_NAME = 'Test Coverage';

// Files that don't need dedicated test files:
// - *.min.js: Third-party minified libraries
// - index.js: Barrel files (just re-exports)
// - app.js: Entry points (tested via integration)
// - types.js: Type definitions (no logic)
const FILES_EXCLUDED_FROM_TEST_PARITY = new Set([
  'marked.min',
  'index',
  'app',
  'types',
]);

/**
 * Check if a source file should be excluded from test parity checks.
 *
 * @param {string} basename - File basename without extension
 * @returns {boolean} True if file should be excluded
 */
function shouldExcludeFromTestParity(basename) {
  return FILES_EXCLUDED_FROM_TEST_PARITY.has(basename) || basename.endsWith('.min');
}

/**
 * Get source files and their expected test file counterparts.
 *
 * @param {string[]} jsDirs - JS source directories
 * @param {string[]} testDirs - Test directories
 * @returns {object} Source-to-test mapping info
 */
function analyzeTestParity(jsDirs, testDirs) {
  const sourceFiles = [];
  const testFiles = [];

  for (const jsDir of jsDirs) {
    if (!fileExists(jsDir)) continue;
    const files = getAllFiles(jsDir).filter((f) => f.endsWith('.js'));
    // Filter out files that don't need dedicated tests
    const basenames = files
      .map((f) => path.basename(f, '.js'))
      .filter((b) => !shouldExcludeFromTestParity(b));
    sourceFiles.push(...basenames);
  }

  for (const testDir of testDirs) {
    if (!fileExists(testDir)) continue;
    const files = getAllFiles(testDir).filter((f) => f.endsWith('.test.js'));
    testFiles.push(...files.map((f) => path.basename(f, '.test.js')));
  }

  const missingTests = sourceFiles.filter((src) => !testFiles.includes(src));
  const orphanedTests = testFiles.filter((test) => !sourceFiles.includes(test));

  return {
    sourceCount: sourceFiles.length,
    testFileCount: testFiles.length,
    missingTests,
    orphanedTests,
    parityRatio: sourceFiles.length > 0 ? testFiles.length / sourceFiles.length : 1,
  };
}

/**
 * Count total test cases across all test files.
 *
 * @param {string[]} testDirs - Test directories
 * @returns {number} Total test case count
 */
function countTotalTestCases(testDirs) {
  let total = 0;
  for (const testDir of testDirs) {
    if (!fileExists(testDir)) continue;
    const files = getAllFiles(testDir).filter((f) => f.endsWith('.test.js'));
    for (const file of files) {
      const content = readTextFile(file);
      total += countTestCases(content);
    }
  }
  return total;
}

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
    const structure = detectProjectStructure(repoPath);

    const config = parseJestConfig(jestConfigPath);
    const thresholds = config?.coverageThreshold?.global || {};

    // Get actual coverage from lcov.info
    let actualCoverage = null;
    for (const coverageDir of structure.coverageDirs) {
      const lcovPath = path.join(coverageDir, 'lcov.info');
      if (fileExists(lcovPath)) {
        actualCoverage = parseLcovCoverage(lcovPath);
        break;
      }
    }

    // Analyze test-to-source parity
    const testParity = analyzeTestParity(structure.jsDirs, structure.testDirs);

    // Count test cases
    const testCaseCount = countTotalTestCases(structure.testDirs);

    repoData.push({
      repo: repoName,
      path: repoPath,
      structureType: structure.type,
      hasJestConfig: fileExists(jestConfigPath),
      // Config thresholds
      statements: thresholds.statements ?? null,
      branches: thresholds.branches ?? null,
      functions: thresholds.functions ?? null,
      lines: thresholds.lines ?? null,
      testEnvironment: config?.testEnvironment ?? null,
      // Actual coverage (from lcov.info)
      actualCoverage,
      // Test implementation metrics
      testParity,
      testCaseCount,
    });
  }

  // Calculate entropy for each threshold type (config values)
  const statementsValues = repoData.map((r) => r.statements).filter((v) => v !== null);
  const branchesValues = repoData.map((r) => r.branches).filter((v) => v !== null);
  const functionsValues = repoData.map((r) => r.functions).filter((v) => v !== null);
  const linesValues = repoData.map((r) => r.lines).filter((v) => v !== null);

  // Calculate entropy for actual coverage values
  const actualLinesValues = repoData
    .map((r) => r.actualCoverage?.lines)
    .filter((v) => v !== null && v !== undefined);
  const actualBranchesValues = repoData
    .map((r) => r.actualCoverage?.branches)
    .filter((v) => v !== null && v !== undefined);

  // Calculate entropy for test implementation metrics
  const testCaseCounts = repoData.map((r) => r.testCaseCount);
  const parityRatios = repoData.map((r) => r.testParity?.parityRatio ?? 0);

  const uniformity = {
    // Config thresholds
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
    // Actual coverage values
    actualLines: {
      values: actualLinesValues,
      entropy: calculateEntropy(actualLinesValues),
      stats: calculateNumericVariance(actualLinesValues),
    },
    actualBranches: {
      values: actualBranchesValues,
      entropy: calculateEntropy(actualBranchesValues),
      stats: calculateNumericVariance(actualBranchesValues),
    },
    // Test implementation metrics
    testCaseCount: {
      values: testCaseCounts,
      entropy: calculateEntropy(testCaseCounts),
      stats: calculateNumericVariance(testCaseCounts),
    },
    testParity: {
      values: parityRatios,
      entropy: calculateEntropy(parityRatios.map((r) => r >= 0.8)),
      stats: calculateNumericVariance(parityRatios),
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

    // Check actual coverage vs thresholds (if coverage data exists)
    if (data.actualCoverage) {
      for (const key of ['statements', 'branches', 'functions', 'lines']) {
        const threshold = data[key];
        const actual = data.actualCoverage[key];
        if (threshold !== null && actual !== null && actual < threshold) {
          findings.push({
            repo: data.repo,
            severity: 'high',
            summary: `Actual ${key} coverage (${actual}%) below threshold (${threshold}%)`,
            details: `Coverage is ${threshold - actual}% below the configured threshold`,
            metric: `actual_${key}`,
            actual,
            threshold,
          });
        }
      }
    }

    // Check test-to-source parity
    if (data.testParity) {
      if (data.testParity.parityRatio < 0.5) {
        findings.push({
          repo: data.repo,
          severity: 'high',
          summary: `Low test file coverage: ${Math.round(data.testParity.parityRatio * 100)}%`,
          details: `Only ${data.testParity.testFileCount} test files for ${data.testParity.sourceCount} source files`,
        });
      }
      if (data.testParity.missingTests.length > 0 && data.testParity.missingTests.length <= 5) {
        findings.push({
          repo: data.repo,
          severity: 'medium',
          summary: `Missing test files: ${data.testParity.missingTests.join(', ')}`,
          details: `Source files without corresponding .test.js files`,
        });
      } else if (data.testParity.missingTests.length > 5) {
        findings.push({
          repo: data.repo,
          severity: 'medium',
          summary: `Missing ${data.testParity.missingTests.length} test files`,
          details: `Source files without corresponding .test.js files: ${data.testParity.missingTests.slice(0, 5).join(', ')}...`,
        });
      }
    }

    // Check test case count variance (flag if significantly lower than average)
    const avgTestCases = testCaseCounts.reduce((a, b) => a + b, 0) / testCaseCounts.length;
    if (data.testCaseCount < avgTestCases * 0.5 && data.testCaseCount > 0) {
      findings.push({
        repo: data.repo,
        severity: 'medium',
        summary: `Low test case count: ${data.testCaseCount} (avg: ${Math.round(avgTestCases)})`,
        details: `Test case count is significantly below average`,
      });
    }
  }

  // Calculate overall entropy for this dimension
  const allEntropies = [
    uniformity.statements.entropy,
    uniformity.branches.entropy,
    uniformity.functions.entropy,
    uniformity.lines.entropy,
    uniformity.actualLines.entropy,
    uniformity.testCaseCount.entropy,
    uniformity.testParity.entropy,
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

