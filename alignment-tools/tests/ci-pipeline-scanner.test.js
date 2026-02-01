/**
 * Tests for scanners/ci-pipeline.js
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { scan } from '../scanners/ci-pipeline.js';

const tmpDir = path.join(os.tmpdir(), 'genesis-ci-scanner-tests-' + Date.now());

beforeAll(() => {
  fs.mkdirSync(tmpDir, { recursive: true });

  // Create repo with full CI
  const fullCi = path.join(tmpDir, 'repo-full-ci');
  fs.mkdirSync(path.join(fullCi, '.github', 'workflows'), { recursive: true });
  fs.writeFileSync(path.join(fullCi, '.github', 'workflows', 'ci.yml'), `
name: CI
jobs:
  lint:
    steps:
      - run: npm run lint
  test:
    strategy:
      matrix:
        node-version: ['18.x', '20.x', '22.x']
    steps:
      - run: npm test
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v5
`);

  // Create repo missing Node 18
  const missingNode18 = path.join(tmpDir, 'repo-missing-node18');
  fs.mkdirSync(path.join(missingNode18, '.github', 'workflows'), { recursive: true });
  fs.writeFileSync(path.join(missingNode18, '.github', 'workflows', 'ci.yml'), `
name: CI
jobs:
  test:
    strategy:
      matrix:
        node-version: ['20.x', '22.x']
    steps:
      - run: npm test
`);

  // Create repo without CI
  const noCi = path.join(tmpDir, 'repo-no-ci');
  fs.mkdirSync(noCi, { recursive: true });

  // Create repo with .github but no workflows
  const noWorkflow = path.join(tmpDir, 'repo-no-workflow');
  fs.mkdirSync(path.join(noWorkflow, '.github'), { recursive: true });
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('CI Pipeline Scanner', () => {
  test('scans repos and extracts CI configuration', async () => {
    const repoPaths = [path.join(tmpDir, 'repo-full-ci')];
    const result = await scan(repoPaths);

    expect(result.name).toBe('CI Pipeline');
    expect(result.repoData).toHaveLength(1);
    expect(result.repoData[0].hasWorkflowDir).toBe(true);
    expect(result.repoData[0].hasCiWorkflow).toBe(true);
    expect(result.repoData[0].hasLint).toBe(true);
    expect(result.repoData[0].hasTest).toBe(true);
    expect(result.repoData[0].hasCoverage).toBe(true);
  });

  test('detects missing Node versions', async () => {
    const repoPaths = [
      path.join(tmpDir, 'repo-full-ci'),
      path.join(tmpDir, 'repo-missing-node18'),
    ];
    const result = await scan(repoPaths);

    const missingNodeRepo = result.repoData.find((r) => r.repo === 'repo-missing-node18');
    expect(missingNodeRepo.nodeVersions).toEqual(['20.x', '22.x']);
    expect(missingNodeRepo.nodeVersions).not.toContain('18.x');
  });

  test('detects missing workflow directory', async () => {
    const repoPaths = [path.join(tmpDir, 'repo-no-ci')];
    const result = await scan(repoPaths);

    expect(result.repoData[0].hasWorkflowDir).toBe(false);
    expect(result.repoData[0].hasCiWorkflow).toBe(false);

    const finding = result.findings.find((f) => f.repo === 'repo-no-ci');
    expect(finding).toBeDefined();
    expect(finding.severity).toBe('critical');
    expect(finding.summary).toContain('Missing .github/workflows');
  });

  test('calculates entropy for CI configurations', async () => {
    const repoPaths = [
      path.join(tmpDir, 'repo-full-ci'),
      path.join(tmpDir, 'repo-missing-node18'),
    ];
    const result = await scan(repoPaths);

    // Should have non-zero entropy due to differing Node versions
    expect(result.uniformity.nodeVersions.entropy).toBeGreaterThan(0);
  });

  test('calculates 0 entropy for identical CI configs', async () => {
    // Use two repos with same config
    const repoPaths = [
      path.join(tmpDir, 'repo-full-ci'),
      path.join(tmpDir, 'repo-full-ci'), // Same repo twice simulates identical configs
    ];
    const result = await scan(repoPaths);

    expect(result.uniformity.hasLint.entropy).toBe(0);
    expect(result.uniformity.hasTest.entropy).toBe(0);
  });

  test('sorts findings by severity', async () => {
    const repoPaths = [
      path.join(tmpDir, 'repo-full-ci'),
      path.join(tmpDir, 'repo-no-ci'),
      path.join(tmpDir, 'repo-missing-node18'),
    ];
    const result = await scan(repoPaths);

    const severities = result.findings.map((f) => f.severity);
    const criticalIndex = severities.indexOf('critical');
    const lowIndex = severities.indexOf('low');

    if (criticalIndex !== -1 && lowIndex !== -1) {
      expect(criticalIndex).toBeLessThan(lowIndex);
    }
  });
});

