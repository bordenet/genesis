/**
 * Tests for scanners/documentation.js
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { scan } from '../scanners/documentation.js';

const tmpDir = path.join(os.tmpdir(), 'genesis-doc-scanner-tests-' + Date.now());

beforeAll(() => {
  fs.mkdirSync(tmpDir, { recursive: true });

  // Create fully documented repo
  const fullDocs = path.join(tmpDir, 'repo-full-docs');
  fs.mkdirSync(path.join(fullDocs, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(fullDocs, 'README.md'), `
# My Project

## Installation
npm install

## Usage
Run the app

## Testing
npm test

## Development
How to contribute
`);
  fs.writeFileSync(path.join(fullDocs, 'LICENSE'), 'MIT License');
  fs.writeFileSync(path.join(fullDocs, 'docs', 'CLAUDE.md'), 'AI instructions');
  fs.writeFileSync(path.join(fullDocs, 'CHANGELOG.md'), '# Changelog');

  // Create minimal docs repo
  const minDocs = path.join(tmpDir, 'repo-min-docs');
  fs.mkdirSync(minDocs, { recursive: true });
  fs.writeFileSync(path.join(minDocs, 'README.md'), '# Just a title');

  // Create repo with no docs
  const noDocs = path.join(tmpDir, 'repo-no-docs');
  fs.mkdirSync(noDocs, { recursive: true });
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('Documentation Scanner', () => {
  test('scans repos and extracts documentation', async () => {
    const repoPaths = [path.join(tmpDir, 'repo-full-docs')];
    const result = await scan(repoPaths);

    expect(result.name).toBe('Documentation');
    expect(result.repoData).toHaveLength(1);
    expect(result.repoData[0].readme).toBe(true);
    expect(result.repoData[0].license).toBe(true);
    expect(result.repoData[0].claudeMd).toBe(true);
    expect(result.repoData[0].changelog).toBe(true);
  });

  test('analyzes README structure', async () => {
    const repoPaths = [path.join(tmpDir, 'repo-full-docs')];
    const result = await scan(repoPaths);

    const structure = result.repoData[0].readmeStructure;
    expect(structure.hasUsage).toBe(true);
    expect(structure.hasInstallation).toBe(true);
    expect(structure.hasTesting).toBe(true);
  });

  test('detects missing README.md', async () => {
    const repoPaths = [path.join(tmpDir, 'repo-no-docs')];
    const result = await scan(repoPaths);

    expect(result.repoData[0].readme).toBe(false);

    const finding = result.findings.find(
      (f) => f.repo === 'repo-no-docs' && f.summary.includes('README')
    );
    expect(finding).toBeDefined();
    expect(finding.severity).toBe('critical');
  });

  test('detects missing LICENSE file', async () => {
    const repoPaths = [path.join(tmpDir, 'repo-min-docs')];
    const result = await scan(repoPaths);

    const finding = result.findings.find(
      (f) => f.repo === 'repo-min-docs' && f.summary.includes('LICENSE')
    );
    expect(finding).toBeDefined();
    expect(finding.severity).toBe('high');
  });

  test('calculates entropy for documentation patterns', async () => {
    const repoPaths = [
      path.join(tmpDir, 'repo-full-docs'),
      path.join(tmpDir, 'repo-no-docs'),
    ];
    const result = await scan(repoPaths);

    expect(result.uniformity.hasReadme.entropy).toBeGreaterThan(0);
    expect(result.uniformity.hasClaudeMd.entropy).toBeGreaterThan(0);
  });

  test('calculates 0 entropy for identical doc patterns', async () => {
    const repoPaths = [
      path.join(tmpDir, 'repo-full-docs'),
      path.join(tmpDir, 'repo-full-docs'),
    ];
    const result = await scan(repoPaths);

    expect(result.uniformity.hasReadme.entropy).toBe(0);
    expect(result.uniformity.hasClaudeMd.entropy).toBe(0);
  });

  test('detects missing README sections', async () => {
    const repoPaths = [path.join(tmpDir, 'repo-min-docs')];
    const result = await scan(repoPaths);

    const usageFinding = result.findings.find((f) => f.summary.includes('Usage section'));
    expect(usageFinding).toBeDefined();
    expect(usageFinding.severity).toBe('medium');
  });

  test('sorts findings by severity', async () => {
    const repoPaths = [
      path.join(tmpDir, 'repo-full-docs'),
      path.join(tmpDir, 'repo-no-docs'),
    ];
    const result = await scan(repoPaths);

    const criticalIdx = result.findings.findIndex((f) => f.severity === 'critical');
    const lowIdx = result.findings.findIndex((f) => f.severity === 'low');

    if (criticalIdx !== -1 && lowIdx !== -1) {
      expect(criticalIdx).toBeLessThan(lowIdx);
    }
  });
});

