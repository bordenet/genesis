/**
 * Tests for scanners/code-patterns.js
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { scan } from '../scanners/code-patterns.js';

const tmpDir = path.join(os.tmpdir(), 'genesis-code-scanner-tests-' + Date.now());

beforeAll(() => {
  fs.mkdirSync(tmpDir, { recursive: true });

  // Create repo with all patterns
  const fullPatterns = path.join(tmpDir, 'repo-full-patterns');
  fs.mkdirSync(path.join(fullPatterns, 'js'), { recursive: true });
  fs.writeFileSync(path.join(fullPatterns, 'js', 'storage.js'), `
export function openDatabase() {
  const request = indexedDB.open('mydb', 1);
  const store = request.result.objectStore('data');
}
`);
  fs.writeFileSync(path.join(fullPatterns, 'js', 'workflow.js'), `
export function getCurrentPhase() {}
export function setPhase(phase) {}
export const phases = [1, 2, 3];
`);
  fs.writeFileSync(path.join(fullPatterns, 'js', 'router.js'), `
window.addEventListener('hashchange', navigate);
function navigate() { window.location.hash = '#home'; }
`);
  fs.writeFileSync(path.join(fullPatterns, 'js', 'error-handler.js'), `
try { } catch (e) { handleError(e); }
function showError(msg) { toast(msg); }
`);

  // Create repo missing patterns
  const noPatterns = path.join(tmpDir, 'repo-no-patterns');
  fs.mkdirSync(path.join(noPatterns, 'js'), { recursive: true });
  fs.writeFileSync(path.join(noPatterns, 'js', 'app.js'), 'console.log("hello");');

  // Create empty repo
  const emptyRepo = path.join(tmpDir, 'repo-empty');
  fs.mkdirSync(emptyRepo, { recursive: true });
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('Code Patterns Scanner', () => {
  test('scans repos and detects code patterns', async () => {
    const repoPaths = [path.join(tmpDir, 'repo-full-patterns')];
    const result = await scan(repoPaths);

    expect(result.name).toBe('Code Patterns');
    expect(result.repoData).toHaveLength(1);
    expect(result.repoData[0].hasStorage).toBe(true);
    expect(result.repoData[0].hasWorkflow).toBe(true);
    expect(result.repoData[0].hasRouter).toBe(true);
    expect(result.repoData[0].hasErrorHandler).toBe(true);
  });

  test('detects missing storage pattern', async () => {
    const repoPaths = [path.join(tmpDir, 'repo-no-patterns')];
    const result = await scan(repoPaths);

    expect(result.repoData[0].hasStorage).toBe(false);
    const finding = result.findings.find(
      (f) => f.summary.includes('storage')
    );
    expect(finding).toBeDefined();
    expect(finding.severity).toBe('high');
  });

  test('detects missing workflow pattern', async () => {
    const repoPaths = [path.join(tmpDir, 'repo-no-patterns')];
    const result = await scan(repoPaths);

    expect(result.repoData[0].hasWorkflow).toBe(false);
    const finding = result.findings.find(
      (f) => f.summary.includes('workflow')
    );
    expect(finding).toBeDefined();
  });

  test('calculates entropy for pattern presence', async () => {
    const repoPaths = [
      path.join(tmpDir, 'repo-full-patterns'),
      path.join(tmpDir, 'repo-no-patterns'),
    ];
    const result = await scan(repoPaths);

    expect(result.uniformity.storagePattern.entropy).toBeGreaterThan(0);
    expect(result.uniformity.workflowPattern.entropy).toBeGreaterThan(0);
  });

  test('calculates 0 entropy for identical patterns', async () => {
    const repoPaths = [
      path.join(tmpDir, 'repo-full-patterns'),
      path.join(tmpDir, 'repo-full-patterns'),
    ];
    const result = await scan(repoPaths);

    expect(result.uniformity.storagePattern.entropy).toBe(0);
    expect(result.uniformity.workflowPattern.entropy).toBe(0);
  });

  test('detects ESM export usage', async () => {
    const repoPaths = [path.join(tmpDir, 'repo-full-patterns')];
    const result = await scan(repoPaths);

    expect(result.repoData[0].esmExportRatio).toBeGreaterThan(0);
  });

  test('handles repos without js directory', async () => {
    const repoPaths = [path.join(tmpDir, 'repo-empty')];
    const result = await scan(repoPaths);

    expect(result.repoData[0].hasStorage).toBe(false);
    expect(result.repoData[0].esmExportRatio).toBe(0);
  });

  test('sorts findings by severity', async () => {
    const repoPaths = [path.join(tmpDir, 'repo-no-patterns')];
    const result = await scan(repoPaths);

    const highIdx = result.findings.findIndex((f) => f.severity === 'high');
    const mediumIdx = result.findings.findIndex((f) => f.severity === 'medium');

    if (highIdx !== -1 && mediumIdx !== -1) {
      expect(highIdx).toBeLessThan(mediumIdx);
    }
  });
});

