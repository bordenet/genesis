/**
 * CI Pipeline Scanner
 * Measures variance in GitHub Actions workflows across repos.
 *
 * @module scanners/ci-pipeline
 */

import path from 'path';
import fs from 'fs';
import { parseWorkflowFile, fileExists } from '../lib/config-parser.js';
import { calculateEntropy } from '../lib/entropy.js';
import { loadExpectedValues } from '../lib/baseline-manager.js';

const DIMENSION_NAME = 'CI Pipeline';

/**
 * Scan CI pipeline configuration across repos.
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
    const workflowDir = path.join(repoPath, '.github', 'workflows');

    let ciWorkflow = null;
    if (fs.existsSync(workflowDir)) {
      // Look for common CI workflow names
      const workflowFiles = ['ci.yml', 'test.yml', 'build.yml', 'main.yml'];
      for (const wf of workflowFiles) {
        const wfPath = path.join(workflowDir, wf);
        if (fileExists(wfPath)) {
          ciWorkflow = parseWorkflowFile(wfPath);
          ciWorkflow.fileName = wf;
          break;
        }
      }
    }

    repoData.push({
      repo: repoName,
      path: repoPath,
      hasWorkflowDir: fs.existsSync(workflowDir),
      hasCiWorkflow: ciWorkflow !== null,
      workflowName: ciWorkflow?.fileName ?? null,
      nodeVersions: ciWorkflow?.nodeVersions ?? [],
      hasLint: ciWorkflow?.hasLint ?? false,
      hasTest: ciWorkflow?.hasTest ?? false,
      hasCoverage: ciWorkflow?.hasCoverage ?? false,
      hasSecurity: ciWorkflow?.hasSecurity ?? false,
    });
  }

  // Calculate entropy
  const uniformity = {
    nodeVersions: {
      values: repoData.map((r) => JSON.stringify(r.nodeVersions.sort())),
      entropy: calculateEntropy(repoData.map((r) => JSON.stringify(r.nodeVersions.sort()))),
    },
    hasLint: {
      values: repoData.map((r) => r.hasLint),
      entropy: calculateEntropy(repoData.map((r) => r.hasLint)),
    },
    hasTest: {
      values: repoData.map((r) => r.hasTest),
      entropy: calculateEntropy(repoData.map((r) => r.hasTest)),
    },
    hasCoverage: {
      values: repoData.map((r) => r.hasCoverage),
      entropy: calculateEntropy(repoData.map((r) => r.hasCoverage)),
    },
  };

  // Generate findings
  const expectedCi = expected.ciWorkflow || {};

  for (const data of repoData) {
    if (!data.hasWorkflowDir) {
      findings.push({
        repo: data.repo,
        severity: 'critical',
        summary: 'Missing .github/workflows directory',
        details: 'No CI pipeline configured',
      });
      continue;
    }

    if (!data.hasCiWorkflow) {
      findings.push({
        repo: data.repo,
        severity: 'critical',
        summary: 'No CI workflow file found',
        details: 'Expected ci.yml, test.yml, build.yml, or main.yml',
      });
      continue;
    }

    // Check for required steps
    if (expectedCi.hasLint && !data.hasLint) {
      findings.push({
        repo: data.repo,
        severity: 'high',
        summary: 'Missing lint step in CI',
        details: 'CI workflow should include linting',
      });
    }

    if (expectedCi.hasTest && !data.hasTest) {
      findings.push({
        repo: data.repo,
        severity: 'high',
        summary: 'Missing test step in CI',
        details: 'CI workflow should include testing',
      });
    }

    if (expectedCi.hasCoverage && !data.hasCoverage) {
      findings.push({
        repo: data.repo,
        severity: 'medium',
        summary: 'Missing coverage upload in CI',
        details: 'CI workflow should upload coverage to Codecov',
      });
    }

    // Check Node versions
    if (expectedCi.nodeVersions) {
      const expectedVersions = new Set(expectedCi.nodeVersions);
      const missingVersions = [...expectedVersions].filter((v) => !data.nodeVersions.includes(v));
      if (missingVersions.length > 0) {
        findings.push({
          repo: data.repo,
          severity: 'low',
          summary: `Missing Node versions: ${missingVersions.join(', ')}`,
          details: `Expected: ${expectedCi.nodeVersions.join(', ')}, Actual: ${data.nodeVersions.join(', ') || 'none'}`,
        });
      }
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

