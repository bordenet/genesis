/**
 * Tests for scanners/naming-conventions.js
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { scan } from '../scanners/naming-conventions.js';

const tmpDir = path.join(os.tmpdir(), 'genesis-naming-scanner-tests-' + Date.now());

beforeAll(() => {
  fs.mkdirSync(tmpDir, { recursive: true });

  // Create repo with proper naming conventions
  const goodRepo = path.join(tmpDir, 'repo-good-naming');
  fs.mkdirSync(path.join(goodRepo, 'js'), { recursive: true });
  fs.mkdirSync(path.join(goodRepo, 'tests'), { recursive: true });
  fs.writeFileSync(path.join(goodRepo, 'js', 'app.js'), `
export function handleClick() {}
export function processData() {}
const myVariable = 'test';
`);
  fs.writeFileSync(path.join(goodRepo, 'tests', 'app.test.js'), 'test("works", () => {});');
  fs.writeFileSync(path.join(goodRepo, 'tests', 'utils.test.js'), 'test("works", () => {});');

  // Create repo with bad naming conventions
  const badRepo = path.join(tmpDir, 'repo-bad-naming');
  fs.mkdirSync(path.join(badRepo, 'js'), { recursive: true });
  fs.mkdirSync(path.join(badRepo, 'tests'), { recursive: true });
  fs.writeFileSync(path.join(badRepo, 'js', 'app.js'), `
function Handle_Click() {}
function Process_Data() {}
const My_Variable = 'test';
`);
  fs.writeFileSync(path.join(badRepo, 'tests', 'app-spec.js'), 'test("works", () => {});');

  // Create repo without js directory
  const noJs = path.join(tmpDir, 'repo-no-js');
  fs.mkdirSync(noJs, { recursive: true });
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('Naming Conventions Scanner', () => {
  test('scans repos and extracts naming patterns', async () => {
    const repoPaths = [path.join(tmpDir, 'repo-good-naming')];
    const result = await scan(repoPaths);

    expect(result.name).toBe('Naming Conventions');
    expect(result.repoData).toHaveLength(1);
    expect(result.repoData[0].jsFileCount).toBeGreaterThan(0);
    expect(result.repoData[0].testFilesFollowPattern).toBe(true);
  });

  test('detects test files not following *.test.js pattern', async () => {
    const repoPaths = [path.join(tmpDir, 'repo-bad-naming')];
    const result = await scan(repoPaths);

    expect(result.repoData[0].testFilesFollowPattern).toBe(false);

    const finding = result.findings.find(
      (f) => f.repo === 'repo-bad-naming' && f.summary.includes('Test files')
    );
    expect(finding).toBeDefined();
    expect(finding.severity).toBe('medium');
  });

  test('calculates entropy for naming patterns', async () => {
    const repoPaths = [
      path.join(tmpDir, 'repo-good-naming'),
      path.join(tmpDir, 'repo-bad-naming'),
    ];
    const result = await scan(repoPaths);

    // Should have non-zero entropy due to different test naming patterns
    expect(result.uniformity.testNaming.entropy).toBeGreaterThan(0);
  });

  test('calculates 0 entropy for repos with identical patterns', async () => {
    const repoPaths = [
      path.join(tmpDir, 'repo-good-naming'),
      path.join(tmpDir, 'repo-good-naming'),
    ];
    const result = await scan(repoPaths);

    expect(result.uniformity.testNaming.entropy).toBe(0);
  });

  test('handles repos without js directory gracefully', async () => {
    const repoPaths = [path.join(tmpDir, 'repo-no-js')];
    const result = await scan(repoPaths);

    expect(result.repoData[0].jsFileCount).toBe(0);
    expect(result.repoData[0].avgCamelCaseRatio).toBe(1);
  });

  test('detects export style patterns', async () => {
    const repoPaths = [path.join(tmpDir, 'repo-good-naming')];
    const result = await scan(repoPaths);

    expect(result.repoData[0].namedExportRatio).toBeGreaterThan(0);
    expect(result.uniformity.exportStyle).toBeDefined();
  });

  test('sorts findings by severity', async () => {
    const repoPaths = [
      path.join(tmpDir, 'repo-good-naming'),
      path.join(tmpDir, 'repo-bad-naming'),
    ];
    const result = await scan(repoPaths);

    const severities = result.findings.map((f) => f.severity);
    const mediumIndex = severities.indexOf('medium');
    const lowIndex = severities.indexOf('low');

    if (mediumIndex !== -1 && lowIndex !== -1) {
      expect(mediumIndex).toBeLessThan(lowIndex);
    }
  });
});

