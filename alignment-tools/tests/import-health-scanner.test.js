/**
 * Tests for scanners/import-health.js
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { scanRepo, aggregate } from '../scanners/import-health.js';

const tmpDir = path.join(os.tmpdir(), 'genesis-import-health-tests-' + Date.now());

beforeAll(() => {
  fs.mkdirSync(tmpDir, { recursive: true });

  // Create healthy repo with valid imports
  const healthyRepo = path.join(tmpDir, 'repo-healthy');
  fs.mkdirSync(path.join(healthyRepo, 'js'), { recursive: true });
  fs.writeFileSync(path.join(healthyRepo, 'js', 'project-view.js'), `
import { Workflow, getPhaseMetadata } from './workflow.js';
import { showToast } from './toast.js';
export function init() {}
`);
  fs.writeFileSync(path.join(healthyRepo, 'js', 'workflow.js'), `
export class Workflow {}
export function getPhaseMetadata(p) { return {}; }
`);
  fs.writeFileSync(path.join(healthyRepo, 'js', 'toast.js'), `
export function showToast(msg) {}
`);

  // Create repo with broken import
  const brokenRepo = path.join(tmpDir, 'repo-broken');
  fs.mkdirSync(path.join(brokenRepo, 'js'), { recursive: true });
  fs.writeFileSync(path.join(brokenRepo, 'js', 'project-view.js'), `
import { something } from './nonexistent.js';
export function init() {}
`);

  // Create repo with PRD-specific import leak
  const leakRepo = path.join(tmpDir, 'one-pager');
  fs.mkdirSync(path.join(leakRepo, 'js'), { recursive: true });
  fs.writeFileSync(path.join(leakRepo, 'js', 'project-view.js'), `
import { validateInline } from './validator-inline.js';
export function init() {}
`);

  // Create repo with missing conditional import
  const missingImportRepo = path.join(tmpDir, 'repo-missing-import');
  fs.mkdirSync(path.join(missingImportRepo, 'js'), { recursive: true });
  fs.writeFileSync(path.join(missingImportRepo, 'js', 'project-view.js'), `
import { Workflow } from './workflow.js';
// Uses getPhaseMetadata but doesn't import it!
const meta = getPhaseMetadata(1);
export function init() {}
`);
  fs.writeFileSync(path.join(missingImportRepo, 'js', 'workflow.js'), `
export class Workflow {}
export function getPhaseMetadata(p) { return {}; }
`);
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('Import Health Scanner', () => {
  test('detects healthy imports', async () => {
    const result = await scanRepo(path.join(tmpDir, 'repo-healthy'));
    expect(result.repo).toBe('repo-healthy');
    expect(result.brokenImports).toHaveLength(0);
    expect(result.projectSpecificLeaks).toHaveLength(0);
    expect(result.missingConditionalImports).toHaveLength(0);
    expect(result.healthScore).toBe(100);
  });

  test('detects broken imports', async () => {
    const result = await scanRepo(path.join(tmpDir, 'repo-broken'));
    expect(result.brokenImports).toHaveLength(1);
    expect(result.brokenImports[0].import).toBe('nonexistent.js');
    expect(result.healthScore).toBeLessThan(100);
  });

  test('detects PRD-specific import leaks', async () => {
    const result = await scanRepo(path.join(tmpDir, 'one-pager'));
    expect(result.projectSpecificLeaks).toHaveLength(1);
    expect(result.projectSpecificLeaks[0].import).toBe('validator-inline.js');
    expect(result.projectSpecificLeaks[0].ownerProject).toBe('product-requirements-assistant');
    expect(result.healthScore).toBeLessThan(100);
  });

  test('detects missing conditional imports', async () => {
    const result = await scanRepo(path.join(tmpDir, 'repo-missing-import'));
    expect(result.missingConditionalImports).toHaveLength(1);
    expect(result.missingConditionalImports[0].function).toBe('getPhaseMetadata');
    expect(result.healthScore).toBeLessThan(100);
  });

  test('aggregate generates findings with correct severity', async () => {
    const results = [
      await scanRepo(path.join(tmpDir, 'repo-healthy')),
      await scanRepo(path.join(tmpDir, 'repo-broken')),
      await scanRepo(path.join(tmpDir, 'one-pager')),
    ];
    const aggregated = aggregate(results);

    expect(aggregated.name).toBe('Import Health');
    expect(aggregated.findings.length).toBeGreaterThan(0);
    
    // Critical findings should be first
    const criticalFindings = aggregated.findings.filter(f => f.severity === 'critical');
    expect(criticalFindings.length).toBeGreaterThanOrEqual(2);
    
    // Check entropy is > 0 because some repos have issues
    expect(aggregated.entropy).toBeGreaterThan(0);
  });
});

