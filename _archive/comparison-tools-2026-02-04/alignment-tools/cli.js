#!/usr/bin/env node

/**
 * Genesis Alignment Tools v2 - CLI Entry Point
 *
 * Comprehensive entropy and variance scanner for Genesis-derived repositories.
 *
 * @example
 * node cli.js scan                              # Full scan with console output
 * node cli.js scan --only test-coverage         # Scan specific dimensions
 * node cli.js scan --format json                # Output as JSON
 * node cli.js scan --ci --threshold 15          # CI mode, exit 1 if entropy > 15%
 * node cli.js baseline save                     # Save current state as baseline
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateConsoleReport, generateJsonReport, generateMarkdownReport } from './lib/report-generator.js';
import { saveScanToHistory, saveExpectedValues, loadExpectedValues } from './lib/baseline-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import all scanners - organized by type
const coreScanners = {
  'test-coverage': () => import('./scanners/test-coverage.js'),
  'config-parity': () => import('./scanners/config-parity.js'),
  'ux-consistency': () => import('./scanners/ux-consistency.js'),
  'naming-conventions': () => import('./scanners/naming-conventions.js'),
  'dependency-versions': () => import('./scanners/dependency-versions.js'),
  'ci-pipeline': () => import('./scanners/ci-pipeline.js'),
  'documentation': () => import('./scanners/documentation.js'),
  'code-patterns': () => import('./scanners/code-patterns.js'),
  'import-health': () => import('./scanners/import-health.js'),
};

const insideOutScanners = {
  'function-coverage': () => import('./scanners/inside-out/function-coverage.js'),
};

const outsideInScanners = {
  'ui-inventory': () => import('./scanners/outside-in/ui-inventory.js'),
  'workflow-consistency': () => import('./scanners/outside-in/workflow-consistency.js'),
};

// Legacy alias for backward compatibility
const scanners = coreScanners;

// Default repo paths (relative to genesis-tools parent)
const DEFAULT_REPOS = [
  'architecture-decision-record',
  'one-pager',
  'pr-faq-assistant',
  'product-requirements-assistant',
  'strategic-proposal',
  'power-statement-assistant',
  'genesis/genesis/examples/hello-world',
];

/**
 * Parse command line arguments.
 */
function parseArgs(args) {
  const options = {
    command: 'scan',
    only: null,
    format: 'console',
    output: null,
    ci: false,
    threshold: 10,
    baseline: false,
    repos: null,
    insideOut: false,
    outsideIn: false,
    project: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === 'scan' || arg === 'baseline') {
      options.command = arg;
      if (arg === 'baseline' && args[i + 1] === 'save') {
        options.command = 'baseline-save';
        i++;
      }
    } else if (arg === '--only' && args[i + 1]) {
      options.only = args[++i].split(',');
    } else if (arg === '--format' && args[i + 1]) {
      options.format = args[++i];
    } else if (arg === '--output' && args[i + 1]) {
      options.output = args[++i];
    } else if (arg === '--ci') {
      options.ci = true;
    } else if (arg === '--threshold' && args[i + 1]) {
      options.threshold = parseFloat(args[++i]);
    } else if (arg === '--baseline') {
      options.baseline = true;
    } else if (arg === '--repos' && args[i + 1]) {
      options.repos = args[++i].split(',');
    } else if (arg === '--inside-out') {
      options.insideOut = true;
    } else if (arg === '--outside-in') {
      options.outsideIn = true;
    } else if (arg === '--project' && args[i + 1]) {
      options.project = args[++i];
    }
  }

  return options;
}

/**
 * Resolve repo paths.
 */
function resolveRepoPaths(repos) {
  const genesisToolsDir = path.resolve(__dirname, '..', '..');
  return repos.map((repo) => path.resolve(genesisToolsDir, repo));
}

/**
 * Run the scan.
 */
async function runScan(options) {
  // Handle --project flag to scan single project
  let repoNames;
  if (options.project) {
    repoNames = [options.project];
  } else {
    repoNames = options.repos || DEFAULT_REPOS;
  }
  const repoPaths = resolveRepoPaths(repoNames).filter((p) => fs.existsSync(p));

  if (repoPaths.length === 0) {
    console.error('Error: No valid repo paths found');
    process.exit(1);
  }

  // Determine which scanners to run
  let scannersToRun = {};

  if (options.insideOut) {
    // Run only inside-out scanners
    scannersToRun = { ...insideOutScanners };
  } else if (options.outsideIn) {
    // Run only outside-in scanners
    scannersToRun = { ...outsideInScanners };
  } else {
    // Run core scanners (default)
    scannersToRun = { ...coreScanners };
  }

  const scannerNames = options.only || Object.keys(scannersToRun);
  const dimensions = [];

  for (const name of scannerNames) {
    if (!scannersToRun[name]) {
      console.error(`Unknown scanner: ${name}`);
      continue;
    }
    const scanner = await scannersToRun[name]();
    const result = await scanner.scan(repoPaths);
    dimensions.push(result);
  }

  const overallEntropy = dimensions.length > 0
    ? dimensions.reduce((sum, d) => sum + d.entropy, 0) / dimensions.length
    : 0;

  const scanResults = {
    timestamp: new Date().toISOString(),
    repos: repoPaths.map((p) => path.basename(p)),
    dimensions,
    overallEntropy: Math.round(overallEntropy * 10) / 10,
  };

  // Save to history
  saveScanToHistory({ overallEntropy: scanResults.overallEntropy, dimensionCount: dimensions.length });

  // Generate output
  let output;
  switch (options.format) {
    case 'json':
      output = generateJsonReport(scanResults);
      break;
    case 'markdown':
      output = generateMarkdownReport(scanResults);
      break;
    default:
      output = generateConsoleReport(scanResults);
  }

  if (options.output) {
    fs.writeFileSync(options.output, output);
    console.log(`Report written to ${options.output}`);
  } else {
    console.log(output);
  }

  // CI mode: exit with error if entropy exceeds threshold
  if (options.ci && scanResults.overallEntropy > options.threshold) {
    console.error(`\nCI FAILURE: Overall entropy ${scanResults.overallEntropy}% exceeds threshold ${options.threshold}%`);
    process.exit(1);
  }
}

// Main execution
const args = process.argv.slice(2);
const options = parseArgs(args);

if (options.command === 'baseline-save') {
  const current = loadExpectedValues();
  current._meta.lastUpdated = new Date().toISOString().split('T')[0];
  saveExpectedValues(current);
  console.log('Baseline saved.');
} else {
  runScan(options).catch((err) => {
    console.error('Scan failed:', err);
    process.exit(1);
  });
}

