/**
 * Tests for scanners/ux-consistency.js
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { scan } from '../scanners/ux-consistency.js';

const tmpDir = path.join(os.tmpdir(), 'genesis-ux-scanner-tests-' + Date.now());

beforeAll(() => {
  fs.mkdirSync(tmpDir, { recursive: true });

  // Create repo with full UX patterns
  const fullUx = path.join(tmpDir, 'repo-full-ux');
  fs.mkdirSync(fullUx, { recursive: true });
  fs.writeFileSync(path.join(fullUx, 'index.html'), `
<!DOCTYPE html>
<html>
<body>
  <div class="max-w-4xl mx-auto dark:bg-gray-900">
    <h1 class="text-2xl dark:text-white">Title</h1>
    <p class="text-base text-gray-600 dark:text-gray-300">Content</p>
    <button class="btn bg-blue-500 dark:bg-blue-600">Click</button>
  </div>
</body>
</html>
`);

  // Create repo with minimal UX
  const minUx = path.join(tmpDir, 'repo-min-ux');
  fs.mkdirSync(minUx, { recursive: true });
  fs.writeFileSync(path.join(minUx, 'index.html'), `
<!DOCTYPE html>
<html>
<body>
  <h1 class="text-lg">Title</h1>
</body>
</html>
`);

  // Create repo without index.html
  const noHtml = path.join(tmpDir, 'repo-no-html');
  fs.mkdirSync(noHtml, { recursive: true });
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('UX Consistency Scanner', () => {
  test('scans repos and extracts UX patterns', async () => {
    const repoPaths = [path.join(tmpDir, 'repo-full-ux')];
    const result = await scan(repoPaths);

    expect(result.name).toBe('UX Consistency');
    expect(result.repoData).toHaveLength(1);
    expect(result.repoData[0].hasIndexHtml).toBe(true);
    expect(result.repoData[0].hasDarkMode).toBe(true);
    expect(result.repoData[0].hasMaxWContainer).toBe(true);
    expect(result.repoData[0].hasMxAuto).toBe(true);
  });

  test('detects text sizes in HTML', async () => {
    const repoPaths = [path.join(tmpDir, 'repo-full-ux')];
    const result = await scan(repoPaths);

    expect(result.repoData[0].textSizes.length).toBeGreaterThan(0);
    expect(result.repoData[0].textSizes).toContain('text-2xl');
  });

  test('detects missing index.html', async () => {
    const repoPaths = [path.join(tmpDir, 'repo-no-html')];
    const result = await scan(repoPaths);

    expect(result.repoData[0].hasIndexHtml).toBe(false);
    const finding = result.findings.find(
      (f) => f.summary.includes('index.html')
    );
    expect(finding).toBeDefined();
    expect(finding.severity).toBe('critical');
  });

  test('detects missing container patterns', async () => {
    const repoPaths = [path.join(tmpDir, 'repo-min-ux')];
    const result = await scan(repoPaths);

    expect(result.repoData[0].hasMaxWContainer).toBe(false);
    const finding = result.findings.find(
      (f) => f.summary.includes('container')
    );
    expect(finding).toBeDefined();
    expect(finding.severity).toBe('low');
  });

  test('calculates entropy for dark mode', async () => {
    const repoPaths = [
      path.join(tmpDir, 'repo-full-ux'),
      path.join(tmpDir, 'repo-min-ux'),
    ];
    const result = await scan(repoPaths);

    expect(result.uniformity.darkMode.entropy).toBeGreaterThan(0);
  });

  test('calculates 0 entropy for identical UX patterns', async () => {
    const repoPaths = [
      path.join(tmpDir, 'repo-full-ux'),
      path.join(tmpDir, 'repo-full-ux'),
    ];
    const result = await scan(repoPaths);

    expect(result.uniformity.darkMode.entropy).toBe(0);
    expect(result.uniformity.containerPattern.entropy).toBe(0);
  });

  test('extracts color classes', async () => {
    const repoPaths = [path.join(tmpDir, 'repo-full-ux')];
    const result = await scan(repoPaths);

    expect(result.repoData[0].colors.length).toBeGreaterThan(0);
    expect(result.repoData[0].colors).toContain('text-gray-600');
  });

  test('sorts findings by severity', async () => {
    const repoPaths = [
      path.join(tmpDir, 'repo-full-ux'),
      path.join(tmpDir, 'repo-no-html'),
    ];
    const result = await scan(repoPaths);

    const criticalIdx = result.findings.findIndex((f) => f.severity === 'critical');
    const lowIdx = result.findings.findIndex((f) => f.severity === 'low');

    if (criticalIdx !== -1 && lowIdx !== -1) {
      expect(criticalIdx).toBeLessThan(lowIdx);
    }
  });
});

