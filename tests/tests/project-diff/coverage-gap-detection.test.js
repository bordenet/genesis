/**
 * Tests for coverage gap detection in genesis projects.
 *
 * CONTEXT: All genesis child apps should maintain at least 80% test coverage.
 * The diff tool should detect when projects fall below this threshold.
 *
 * This test directly runs coverage analysis using execSync to avoid
 * ESM module import issues with Jest.
 */

import { describe, test, expect } from '@jest/globals';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to genesis-tools directory
// From tests/tests/project-diff/ → genesis/tests/tests/project-diff/
// Go up 4 levels to get to genesis-tools/
// __dirname is: genesis-tools/genesis/tests/tests/project-diff
// We want: genesis-tools/
const GENESIS_TOOLS_DIR = path.resolve(__dirname, '../../../..');

// All 8 derived projects (excluding hello-world template)
const DERIVED_PROJECTS = [
  'acceptance-criteria-assistant',
  'architecture-decision-record',
  'jd-assistant',
  'one-pager',
  'power-statement-assistant',
  'pr-faq-assistant',
  'product-requirements-assistant',
  'strategic-proposal',
];

// Coverage threshold - all projects should meet or exceed this
const COVERAGE_THRESHOLD = 80;

/**
 * Get coverage percentage for a project by running npm test with coverage
 */
function getCoverageForProject(projectPath) {
  try {
    const output = execSync(
      'npm test -- --coverage --coverageReporters=text-summary 2>&1',
      { cwd: projectPath, encoding: 'utf-8', timeout: 120000 }
    );

    // Parse coverage from output - look for "Statements   : XX.XX%"
    const match = output.match(/Statements\s*:\s*([\d.]+)%/);
    if (match) {
      return parseFloat(match[1]);
    }
    return null;
  } catch (error) {
    return null;
  }
}

describe('Coverage Gap Detection', () => {

  // Cache coverage results since running tests is slow
  const coverageResults = {};

  beforeAll(async () => {
    console.log('\n🔍 Running coverage analysis across all projects...');
    console.log(`📁 Genesis tools directory: ${GENESIS_TOOLS_DIR}`);

    for (const project of DERIVED_PROJECTS) {
      const projectPath = path.join(GENESIS_TOOLS_DIR, project);
      console.log(`  Checking ${project}...`);
      if (fs.existsSync(path.join(projectPath, 'package.json'))) {
        const coverage = getCoverageForProject(projectPath);
        coverageResults[project] = coverage;
        console.log(`    → ${coverage !== null ? coverage.toFixed(2) + '%' : 'failed'}`);
      } else {
        console.log(`    → package.json not found`);
      }
    }
    console.log('✅ Coverage analysis complete\n');
  }, 600000); // 10 minute timeout for all coverage runs

  test('should get coverage data for all derived projects', () => {
    // All derived projects should have coverage data
    for (const project of DERIVED_PROJECTS) {
      expect(coverageResults[project]).not.toBeNull();
      expect(typeof coverageResults[project]).toBe('number');
    }
  });

  test('hello-world template should be excluded from coverage analysis', () => {
    // Verify hello-world is not in our derived projects list
    expect(DERIVED_PROJECTS).not.toContain('genesis/genesis/examples/hello-world');
    expect(Object.keys(coverageResults)).not.toContain('genesis/genesis/examples/hello-world');
  });

  test('all genesis projects should have at least 80% coverage (the goal)', () => {
    const projectsBelowThreshold = Object.entries(coverageResults)
      .filter(([_, coverage]) => coverage !== null && coverage < COVERAGE_THRESHOLD)
      .map(([name, coverage]) => ({ name, coverage }));

    if (projectsBelowThreshold.length > 0) {
      console.log('\n📊 Projects below 80% threshold:');
      projectsBelowThreshold.forEach(p => {
        const gap = (COVERAGE_THRESHOLD - p.coverage).toFixed(2);
        console.log(`  ❌ ${p.name}: ${p.coverage.toFixed(2)}% (need +${gap}%)`);
      });

      const projectsAboveThreshold = Object.entries(coverageResults)
        .filter(([_, coverage]) => coverage !== null && coverage >= COVERAGE_THRESHOLD);
      if (projectsAboveThreshold.length > 0) {
        console.log('\n✅ Projects meeting 80% threshold:');
        projectsAboveThreshold.forEach(([name, coverage]) => {
          console.log(`  ✓ ${name}: ${coverage.toFixed(2)}%`);
        });
      }
    }

    // This assertion represents our goal - all projects >= 80%
    expect(projectsBelowThreshold.length).toBe(0);
  });
});

