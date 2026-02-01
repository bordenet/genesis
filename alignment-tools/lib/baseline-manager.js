/**
 * Baseline management for expected values and historical comparisons.
 *
 * @module lib/baseline-manager
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASELINE_DIR = path.join(__dirname, '..', 'baseline');
const EXPECTED_VALUES_FILE = path.join(BASELINE_DIR, 'expected-values.json');
const SCAN_HISTORY_FILE = path.join(BASELINE_DIR, 'scan-history.json');

/**
 * Load expected values baseline.
 *
 * @returns {object} Expected values configuration
 */
export function loadExpectedValues() {
  try {
    if (!fs.existsSync(EXPECTED_VALUES_FILE)) {
      return getDefaultExpectedValues();
    }
    return JSON.parse(fs.readFileSync(EXPECTED_VALUES_FILE, 'utf8'));
  } catch {
    return getDefaultExpectedValues();
  }
}

/**
 * Save expected values baseline.
 *
 * @param {object} values - Expected values to save
 */
export function saveExpectedValues(values) {
  fs.mkdirSync(BASELINE_DIR, { recursive: true });
  fs.writeFileSync(EXPECTED_VALUES_FILE, JSON.stringify(values, null, 2));
}

/**
 * Load scan history for trend analysis.
 *
 * @returns {object[]} Array of historical scan results
 */
export function loadScanHistory() {
  try {
    if (!fs.existsSync(SCAN_HISTORY_FILE)) return [];
    return JSON.parse(fs.readFileSync(SCAN_HISTORY_FILE, 'utf8'));
  } catch {
    return [];
  }
}

/**
 * Save a scan result to history.
 *
 * @param {object} scanResult - Scan result to save
 */
export function saveScanToHistory(scanResult) {
  const history = loadScanHistory();
  history.push({
    timestamp: new Date().toISOString(),
    ...scanResult,
  });
  // Keep last 100 scans
  const trimmed = history.slice(-100);
  fs.mkdirSync(BASELINE_DIR, { recursive: true });
  fs.writeFileSync(SCAN_HISTORY_FILE, JSON.stringify(trimmed, null, 2));
}

/**
 * Get default expected values for Genesis-derived repos.
 *
 * @returns {object} Default expected values
 */
function getDefaultExpectedValues() {
  return {
    _meta: {
      description: 'Canonical expected values for all Genesis-derived repos',
      lastUpdated: new Date().toISOString().split('T')[0],
      maintainer: 'bordenet',
    },
    jestConfig: {
      coverageThreshold: {
        statements: 50,
        branches: 40,
        functions: 50,
        lines: 50,
      },
      testEnvironment: 'jsdom',
    },
    packageJson: {
      type: 'module',
      scripts: {
        test: "NODE_OPTIONS='--experimental-vm-modules' jest",
        'test:coverage': "NODE_OPTIONS='--experimental-vm-modules' jest --coverage",
        lint: 'eslint js/**/*.js',
        'lint:fix': 'eslint js/**/*.js --fix',
      },
    },
    eslintConfig: {
      quotes: 'single',
      semi: true,
    },
    ciWorkflow: {
      nodeVersions: ['18', '20', '22'],
      hasLint: true,
      hasTest: true,
      hasCoverage: true,
    },
    requiredFiles: [
      'index.html',
      'js/app.js',
      'js/storage.js',
      'js/ui.js',
      'js/workflow.js',
      'js/router.js',
      'js/views.js',
      'js/projects.js',
      'js/project-view.js',
      'js/types.js',
      'js/error-handler.js',
      'tests/storage.test.js',
      'tests/workflow.test.js',
      'tests/ui.test.js',
      'README.md',
      'LICENSE',
      'docs/CLAUDE.md',
    ],
    uxPatterns: {
      darkModeSupport: true,
      fontSizeBase: 'text-base',
      primaryColor: 'blue-600',
    },
  };
}

/**
 * Compare current scan to last scan in history.
 *
 * @param {object} currentScan - Current scan results
 * @returns {object|null} Comparison with previous scan
 */
export function compareToLastScan(currentScan) {
  const history = loadScanHistory();
  if (history.length === 0) return null;

  const lastScan = history[history.length - 1];
  return {
    previous: lastScan,
    current: currentScan,
    entropyChange: currentScan.overallEntropy - (lastScan.overallEntropy || 0),
    timestamp: lastScan.timestamp,
  };
}

