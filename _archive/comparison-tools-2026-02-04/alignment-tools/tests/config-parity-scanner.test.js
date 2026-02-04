/**
 * Tests for scanners/config-parity.js
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { scan } from '../scanners/config-parity.js';

const tmpDir = path.join(os.tmpdir(), 'genesis-config-scanner-tests-' + Date.now());

beforeAll(() => {
  fs.mkdirSync(tmpDir, { recursive: true });

  // Create repo with full config
  const fullConfig = path.join(tmpDir, 'repo-full-config');
  fs.mkdirSync(fullConfig, { recursive: true });
  fs.writeFileSync(path.join(fullConfig, 'package.json'), JSON.stringify({
    name: 'repo-full-config',
    type: 'module',
    scripts: {
      test: 'jest',
      lint: 'eslint .',
    },
    engines: { node: '>=18' },
  }, null, 2));
  fs.writeFileSync(path.join(fullConfig, 'eslint.config.js'), `
export default [{ rules: { quotes: ['error', 'single'] } }];
`);

  // Create repo with different config
  const diffConfig = path.join(tmpDir, 'repo-diff-config');
  fs.mkdirSync(diffConfig, { recursive: true });
  fs.writeFileSync(path.join(diffConfig, 'package.json'), JSON.stringify({
    name: 'repo-diff-config',
    type: 'commonjs',
    scripts: {
      test: 'mocha',
    },
  }, null, 2));
  fs.writeFileSync(path.join(diffConfig, 'eslint.config.js'), `
export default [{ rules: { quotes: ['error', 'double'] } }];
`);

  // Create repo without config
  const noConfig = path.join(tmpDir, 'repo-no-config');
  fs.mkdirSync(noConfig, { recursive: true });
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('Config Parity Scanner', () => {
  test('scans repos and extracts config values', async () => {
    const repoPaths = [path.join(tmpDir, 'repo-full-config')];
    const result = await scan(repoPaths);

    expect(result.name).toBe('Config Parity');
    expect(result.repoData).toHaveLength(1);
    expect(result.repoData[0].hasPackageJson).toBe(true);
    expect(result.repoData[0].hasEslintConfig).toBe(true);
    expect(result.repoData[0].moduleType).toBe('module');
  });

  test('detects missing package.json', async () => {
    const repoPaths = [path.join(tmpDir, 'repo-no-config')];
    const result = await scan(repoPaths);

    expect(result.repoData[0].hasPackageJson).toBe(false);
    const finding = result.findings.find(
      (f) => f.summary.includes('package.json')
    );
    expect(finding).toBeDefined();
    expect(finding.severity).toBe('critical');
  });

  test('detects missing eslint config', async () => {
    const repoPaths = [path.join(tmpDir, 'repo-no-config')];
    const result = await scan(repoPaths);

    expect(result.repoData[0].hasEslintConfig).toBe(false);
  });

  test('calculates entropy for module types', async () => {
    const repoPaths = [
      path.join(tmpDir, 'repo-full-config'),
      path.join(tmpDir, 'repo-diff-config'),
    ];
    const result = await scan(repoPaths);

    expect(result.uniformity.moduleType.entropy).toBeGreaterThan(0);
  });

  test('calculates 0 entropy for identical configs', async () => {
    const repoPaths = [
      path.join(tmpDir, 'repo-full-config'),
      path.join(tmpDir, 'repo-full-config'),
    ];
    const result = await scan(repoPaths);

    expect(result.uniformity.moduleType.entropy).toBe(0);
    expect(result.uniformity.testScript.entropy).toBe(0);
  });

  test('extracts scripts from package.json', async () => {
    const repoPaths = [path.join(tmpDir, 'repo-full-config')];
    const result = await scan(repoPaths);

    expect(result.repoData[0].scripts.test).toBe('jest');
    expect(result.repoData[0].scripts.lint).toBe('eslint .');
  });

  test('sorts findings by severity', async () => {
    const repoPaths = [
      path.join(tmpDir, 'repo-full-config'),
      path.join(tmpDir, 'repo-no-config'),
    ];
    const result = await scan(repoPaths);

    const criticalIdx = result.findings.findIndex((f) => f.severity === 'critical');
    const highIdx = result.findings.findIndex((f) => f.severity === 'high');

    if (criticalIdx !== -1 && highIdx !== -1) {
      expect(criticalIdx).toBeLessThan(highIdx);
    }
  });
});

