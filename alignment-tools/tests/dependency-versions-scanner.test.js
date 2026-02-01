/**
 * Tests for scanners/dependency-versions.js
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { scan } from '../scanners/dependency-versions.js';

const tmpDir = path.join(os.tmpdir(), 'genesis-dep-scanner-tests-' + Date.now());

beforeAll(() => {
  fs.mkdirSync(tmpDir, { recursive: true });

  // Create repo with standard deps
  const standardDeps = path.join(tmpDir, 'repo-standard');
  fs.mkdirSync(standardDeps, { recursive: true });
  fs.writeFileSync(path.join(standardDeps, 'package.json'), JSON.stringify({
    name: 'repo-standard',
    devDependencies: {
      jest: '^29.7.0',
      eslint: '^9.0.0',
      tailwindcss: '^3.4.0',
      '@testing-library/dom': '^10.0.0',
    },
  }, null, 2));

  // Create repo with different jest major version
  const differentJest = path.join(tmpDir, 'repo-diff-jest');
  fs.mkdirSync(differentJest, { recursive: true });
  fs.writeFileSync(path.join(differentJest, 'package.json'), JSON.stringify({
    name: 'repo-diff-jest',
    devDependencies: {
      jest: '^30.0.0',
      eslint: '^9.0.0',
      tailwindcss: '^3.4.0',
    },
  }, null, 2));

  // Create repo without package.json
  const noPkg = path.join(tmpDir, 'repo-no-pkg');
  fs.mkdirSync(noPkg, { recursive: true });

  // Create repo with missing critical deps
  const missingDeps = path.join(tmpDir, 'repo-missing');
  fs.mkdirSync(missingDeps, { recursive: true });
  fs.writeFileSync(path.join(missingDeps, 'package.json'), JSON.stringify({
    name: 'repo-missing',
    dependencies: {},
  }, null, 2));
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('Dependency Versions Scanner', () => {
  test('scans repos and extracts dependency versions', async () => {
    const repoPaths = [path.join(tmpDir, 'repo-standard')];
    const result = await scan(repoPaths);

    expect(result.name).toBe('Dependency Versions');
    expect(result.repoData).toHaveLength(1);
    expect(result.repoData[0].hasPackageJson).toBe(true);
    expect(result.repoData[0].criticalVersions.jest).toBe('^29.7.0');
    expect(result.repoData[0].criticalVersions.eslint).toBe('^9.0.0');
  });

  test('detects major version mismatches', async () => {
    const repoPaths = [
      path.join(tmpDir, 'repo-standard'),
      path.join(tmpDir, 'repo-diff-jest'),
    ];
    const result = await scan(repoPaths);

    const jestFinding = result.findings.find(
      (f) => f.dependency === 'jest' && f.severity === 'high'
    );
    expect(jestFinding).toBeDefined();
    expect(jestFinding.summary).toContain('major version');
  });

  test('calculates entropy for dependency versions', async () => {
    const repoPaths = [
      path.join(tmpDir, 'repo-standard'),
      path.join(tmpDir, 'repo-diff-jest'),
    ];
    const result = await scan(repoPaths);

    expect(result.uniformity.jest.entropy).toBeGreaterThan(0);
    expect(result.uniformity.eslint.entropy).toBe(0);
  });

  test('calculates 0 entropy for identical versions', async () => {
    const repoPaths = [
      path.join(tmpDir, 'repo-standard'),
      path.join(tmpDir, 'repo-standard'),
    ];
    const result = await scan(repoPaths);

    expect(result.uniformity.jest.entropy).toBe(0);
    expect(result.uniformity.eslint.entropy).toBe(0);
  });

  test('handles repos without package.json', async () => {
    const repoPaths = [path.join(tmpDir, 'repo-no-pkg')];
    const result = await scan(repoPaths);

    expect(result.repoData[0].hasPackageJson).toBe(false);
    expect(result.repoData[0].dependencyCount).toBe(0);
  });

  test('detects missing critical dependencies', async () => {
    const repoPaths = [path.join(tmpDir, 'repo-missing')];
    const result = await scan(repoPaths);

    const missingFindings = result.findings.filter(
      (f) => f.repo === 'repo-missing' && f.summary.includes('Missing critical')
    );
    expect(missingFindings.length).toBeGreaterThan(0);
    expect(missingFindings[0].severity).toBe('medium');
  });

  test('sorts findings by severity', async () => {
    const repoPaths = [
      path.join(tmpDir, 'repo-standard'),
      path.join(tmpDir, 'repo-diff-jest'),
      path.join(tmpDir, 'repo-missing'),
    ];
    const result = await scan(repoPaths);

    const highIdx = result.findings.findIndex((f) => f.severity === 'high');
    const mediumIdx = result.findings.findIndex((f) => f.severity === 'medium');

    if (highIdx !== -1 && mediumIdx !== -1) {
      expect(highIdx).toBeLessThan(mediumIdx);
    }
  });
});

