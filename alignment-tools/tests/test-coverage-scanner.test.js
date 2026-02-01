/**
 * Tests for scanners/test-coverage.js
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { scan } from '../scanners/test-coverage.js';

// Create temp directories for test repos
const tmpDir = path.join(os.tmpdir(), 'genesis-alignment-scanner-tests-' + Date.now());

beforeAll(() => {
  fs.mkdirSync(tmpDir, { recursive: true });
  
  // Create mock repos with different jest configs
  const repos = ['repo-a', 'repo-b', 'repo-c', 'repo-outlier'];
  
  for (const repo of repos) {
    const repoPath = path.join(tmpDir, repo);
    fs.mkdirSync(repoPath, { recursive: true });
    
    // Different thresholds for outlier
    const thresholds = repo === 'repo-outlier' 
      ? { statements: 85, branches: 80, functions: 85, lines: 85 }
      : { statements: 50, branches: 40, functions: 50, lines: 50 };
    
    const jestConfig = `export default {
      testEnvironment: 'jsdom',
      coverageThreshold: {
        global: {
          statements: ${thresholds.statements},
          branches: ${thresholds.branches},
          functions: ${thresholds.functions},
          lines: ${thresholds.lines},
        },
      },
    };`;
    
    fs.writeFileSync(path.join(repoPath, 'jest.config.js'), jestConfig);
  }
  
  // Create one repo without jest config
  const noJestRepo = path.join(tmpDir, 'no-jest');
  fs.mkdirSync(noJestRepo, { recursive: true });
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('Test Coverage Scanner', () => {
  test('scans repos and extracts coverage thresholds', async () => {
    const repoPaths = [
      path.join(tmpDir, 'repo-a'),
      path.join(tmpDir, 'repo-b'),
    ];
    
    const result = await scan(repoPaths);
    
    expect(result.name).toBe('Test Coverage');
    expect(result.repoData).toHaveLength(2);
    expect(result.repoData[0].statements).toBe(50);
    expect(result.repoData[0].hasJestConfig).toBe(true);
  });

  test('calculates 0 entropy for identical repos', async () => {
    const repoPaths = [
      path.join(tmpDir, 'repo-a'),
      path.join(tmpDir, 'repo-b'),
      path.join(tmpDir, 'repo-c'),
    ];
    
    const result = await scan(repoPaths);
    
    // All repos have same thresholds, so entropy should be 0
    expect(result.entropy).toBe(0);
    expect(result.uniformity.statements.entropy).toBe(0);
    expect(result.uniformity.branches.entropy).toBe(0);
  });

  test('calculates non-zero entropy when outlier present', async () => {
    const repoPaths = [
      path.join(tmpDir, 'repo-a'),
      path.join(tmpDir, 'repo-b'),
      path.join(tmpDir, 'repo-c'),
      path.join(tmpDir, 'repo-outlier'),
    ];
    
    const result = await scan(repoPaths);
    
    // Should have entropy > 0 due to outlier
    expect(result.entropy).toBeGreaterThan(0);
    expect(result.uniformity.statements.entropy).toBeGreaterThan(0);
  });

  test('generates findings for threshold deviations', async () => {
    const repoPaths = [
      path.join(tmpDir, 'repo-a'),
      path.join(tmpDir, 'repo-outlier'),
    ];
    
    const result = await scan(repoPaths);
    
    // Should have findings for the outlier repo
    const outlierFindings = result.findings.filter(f => f.repo === 'repo-outlier');
    expect(outlierFindings.length).toBeGreaterThan(0);
    
    // Should flag the statements threshold deviation
    const statementsFindings = outlierFindings.find(f => f.metric === 'statements');
    expect(statementsFindings).toBeDefined();
    expect(statementsFindings.actual).toBe(85);
    expect(statementsFindings.expected).toBe(50);
    expect(statementsFindings.deviation).toBe(35);
  });

  test('detects missing jest.config.js', async () => {
    const repoPaths = [
      path.join(tmpDir, 'repo-a'),
      path.join(tmpDir, 'no-jest'),
    ];
    
    const result = await scan(repoPaths);
    
    const noJestData = result.repoData.find(r => r.repo === 'no-jest');
    expect(noJestData.hasJestConfig).toBe(false);
    
    const missingConfigFinding = result.findings.find(
      f => f.repo === 'no-jest' && f.severity === 'critical'
    );
    expect(missingConfigFinding).toBeDefined();
    expect(missingConfigFinding.summary).toBe('Missing jest.config.js');
  });

  test('calculates numeric variance stats correctly', async () => {
    const repoPaths = [
      path.join(tmpDir, 'repo-a'),
      path.join(tmpDir, 'repo-b'),
      path.join(tmpDir, 'repo-outlier'),
    ];
    
    const result = await scan(repoPaths);
    
    const stats = result.uniformity.statements.stats;
    expect(stats.min).toBe(50);
    expect(stats.max).toBe(85);
    expect(stats.range).toBe(35);
    expect(stats.mean).toBeGreaterThan(50);
  });

  test('sorts findings by severity', async () => {
    const repoPaths = [
      path.join(tmpDir, 'repo-a'),
      path.join(tmpDir, 'repo-outlier'),
      path.join(tmpDir, 'no-jest'),
    ];

    const result = await scan(repoPaths);

    // Critical findings should come first (no-jest has critical severity)
    const criticalFindings = result.findings.filter(f => f.severity === 'critical');
    const highFindings = result.findings.filter(f => f.severity === 'high');

    expect(criticalFindings.length).toBeGreaterThan(0);

    // Verify ordering: all critical before any high
    const firstHighIndex = result.findings.findIndex(f => f.severity === 'high');
    const lastCriticalIndex = result.findings.findLastIndex(f => f.severity === 'critical');

    if (criticalFindings.length > 0 && highFindings.length > 0) {
      expect(lastCriticalIndex).toBeLessThan(firstHighIndex);
    }
  });
});

