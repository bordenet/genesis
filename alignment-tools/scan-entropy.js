#!/usr/bin/env node
/**
 * Genesis Alignment Scanner - Entropy and Variance Detection
 *
 * Scans Genesis-derived repositories for configuration drift, semantic variance,
 * and inconsistencies that the original fingerprint.js tool missed.
 *
 * Key Difference: This tool PARSES config files and compares SPECIFIC VALUES,
 * rather than just checking file presence or computing hashes.
 *
 * Usage:
 *   node scan-entropy.js                    # Basic scan
 *   node scan-entropy.js --report           # Generate JSON report
 *   node scan-entropy.js --ci --threshold 20  # CI mode with threshold
 *
 * @module alignment-tools/scan-entropy
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  repos: [
    'architecture-decision-record',
    'one-pager',
    'power-statement-assistant',
    'pr-faq-assistant',
    'product-requirements-assistant',
    'strategic-proposal',
  ],
  weights: {
    testThresholds: 0.25,
    configParity: 0.15,
    uxConsistency: 0.15,
    namingConventions: 0.10,
    dependencyVersions: 0.10,
    ciPipeline: 0.10,
    documentation: 0.05,
    actualCoverage: 0.10,
  },
};

// Color output
const colors = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  gray: (s) => `\x1b[90m${s}\x1b[0m`,
};

/**
 * Calculate Shannon entropy for a set of values
 * @param {Array} values - Array of values from each repo
 * @returns {number} Entropy score (0 = uniform, higher = more variance)
 */
function calculateEntropy(values) {
  const counts = {};
  for (const v of values) {
    const key = JSON.stringify(v);
    counts[key] = (counts[key] || 0) + 1;
  }

  const total = values.length;
  let entropy = 0;
  for (const count of Object.values(counts)) {
    const p = count / total;
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }

  // Normalize to 0-100 scale (max entropy = log2(n) where n = number of repos)
  const maxEntropy = Math.log2(total);
  return maxEntropy > 0 ? (entropy / maxEntropy) * 100 : 0;
}

/**
 * Safely read and parse a JavaScript config file
 * @param {string} filePath - Path to the config file
 * @returns {object|null} Parsed config or null if failed
 */
async function readJsConfig(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract coverage thresholds using regex (safer than eval)
    const thresholds = {};
    const statementsMatch = content.match(/statements:\s*(\d+)/);
    const branchesMatch = content.match(/branches:\s*(\d+)/);
    const functionsMatch = content.match(/functions:\s*(\d+)/);
    const linesMatch = content.match(/lines:\s*(\d+)/);

    if (statementsMatch) thresholds.statements = parseInt(statementsMatch[1], 10);
    if (branchesMatch) thresholds.branches = parseInt(branchesMatch[1], 10);
    if (functionsMatch) thresholds.functions = parseInt(functionsMatch[1], 10);
    if (linesMatch) thresholds.lines = parseInt(linesMatch[1], 10);

    return { coverageThreshold: { global: thresholds } };
  } catch {
    return null;
  }
}

/**
 * Read and parse package.json
 * @param {string} filePath - Path to package.json
 * @returns {object|null} Parsed package.json or null
 */
function readPackageJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Extract test coverage thresholds from all repos
 * @param {string} baseDir - Workspace root directory
 * @returns {object} Threshold data by repo
 */
async function extractTestThresholds(baseDir) {
  const data = { byRepo: {}, variance: {} };

  for (const repo of CONFIG.repos) {
    const configPath = path.join(baseDir, repo, 'jest.config.js');
    const config = await readJsConfig(configPath);
    data.byRepo[repo] = config?.coverageThreshold?.global || null;
  }

  // Calculate variance for each threshold type
  const thresholdTypes = ['statements', 'branches', 'functions', 'lines'];
  for (const type of thresholdTypes) {
    const values = Object.values(data.byRepo)
      .filter(Boolean)
      .map((t) => t[type])
      .filter((v) => v !== undefined);

    const uniqueValues = [...new Set(values)];
    data.variance[type] = {
      values: uniqueValues,
      count: uniqueValues.length,
      entropy: calculateEntropy(values),
      isUniform: uniqueValues.length === 1,
    };
  }

  return data;
}

/**
 * Extract package.json scripts from all repos
 * @param {string} baseDir - Workspace root directory
 * @returns {object} Script data by repo
 */
function extractPackageScripts(baseDir) {
  const data = { byRepo: {}, variance: {} };
  const scriptNames = ['test', 'test:coverage', 'test:e2e', 'lint', 'lint:fix'];

  for (const repo of CONFIG.repos) {
    const pkgPath = path.join(baseDir, repo, 'package.json');
    const pkg = readPackageJson(pkgPath);
    data.byRepo[repo] = pkg?.scripts || null;
  }

  for (const script of scriptNames) {
    const values = Object.entries(data.byRepo)
      .filter(([_, scripts]) => scripts !== null)
      .map(([repo, scripts]) => ({ repo, value: scripts[script] || null }));

    const presentIn = values.filter((v) => v.value !== null).map((v) => v.repo);
    const missingFrom = values.filter((v) => v.value === null).map((v) => v.repo);

    data.variance[script] = {
      presentIn,
      missingFrom,
      entropy: calculateEntropy(values.map((v) => v.value)),
      isUniform: missingFrom.length === 0,
    };
  }

  return data;
}

/**
 * Check for required core files across repos
 * @param {string} baseDir - Workspace root directory
 * @returns {object} File presence data
 */
function checkCoreFiles(baseDir) {
  const expectedPath = path.join(__dirname, 'baseline', 'expected-values.json');
  let expected;
  try {
    expected = JSON.parse(fs.readFileSync(expectedPath, 'utf8'));
  } catch {
    console.error('Failed to read expected-values.json');
    return { byRepo: {}, variance: {} };
  }

  const requiredFiles = expected.coreFiles?.required || [];
  const data = { byRepo: {}, variance: {} };

  for (const repo of CONFIG.repos) {
    const repoPath = path.join(baseDir, repo);
    const fileStatus = {};
    for (const file of requiredFiles) {
      fileStatus[file] = fs.existsSync(path.join(repoPath, file));
    }
    data.byRepo[repo] = fileStatus;
  }

  for (const file of requiredFiles) {
    const presentIn = [];
    const missingFrom = [];
    for (const repo of CONFIG.repos) {
      if (data.byRepo[repo]?.[file]) {
        presentIn.push(repo);
      } else {
        missingFrom.push(repo);
      }
    }
    data.variance[file] = {
      presentIn,
      missingFrom,
      isUniform: missingFrom.length === 0,
    };
  }

  return data;
}

/**
 * Extract and compare dependency versions across repos
 * @param {string} baseDir - Workspace root directory
 * @returns {object} Dependency version data
 */
function extractDependencyVersions(baseDir) {
  const data = { byRepo: {}, variance: {} };
  const criticalDeps = ['jest', 'eslint', '@jest/globals', 'jest-environment-jsdom', 'tailwindcss'];

  for (const repo of CONFIG.repos) {
    const pkgPath = path.join(baseDir, repo, 'package.json');
    const pkg = readPackageJson(pkgPath);
    if (pkg) {
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      data.byRepo[repo] = allDeps;
    } else {
      data.byRepo[repo] = null;
    }
  }

  // Analyze critical dependencies
  for (const dep of criticalDeps) {
    const versions = [];
    const byVersion = {};

    for (const repo of CONFIG.repos) {
      const deps = data.byRepo[repo];
      if (deps && deps[dep]) {
        const version = deps[dep].replace(/[\^~>=<]/g, '').split('.')[0]; // Major version
        versions.push(version);
        if (!byVersion[version]) byVersion[version] = [];
        byVersion[version].push(repo);
      }
    }

    const uniqueVersions = [...new Set(versions)];
    data.variance[dep] = {
      versions: uniqueVersions,
      byVersion,
      count: uniqueVersions.length,
      entropy: calculateEntropy(versions),
      isUniform: uniqueVersions.length <= 1,
      presentIn: versions.length,
      totalRepos: CONFIG.repos.length,
    };
  }

  return data;
}

/**
 * Analyze AI instruction files for consistency
 * @param {string} baseDir - Workspace root directory
 * @returns {object} AI instruction analysis data
 */
function analyzeAIInstructions(baseDir) {
  const data = { byRepo: {}, variance: {} };
  const instructionFiles = ['CLAUDE.md', 'Agents.md', 'AGENTS.md'];

  for (const repo of CONFIG.repos) {
    const repoPath = path.join(baseDir, repo);
    const instructions = {};

    for (const file of instructionFiles) {
      const filePath = path.join(repoPath, file);
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          instructions[file] = {
            exists: true,
            lineCount: content.split('\n').length,
            hasSuperpowers: content.includes('superpowers'),
            hasMandatorySection: content.includes('MANDATORY') || content.includes('CRITICAL'),
            hasDeploymentRules: content.includes('deploy') || content.includes('Deploy'),
          };
        } catch {
          instructions[file] = { exists: false };
        }
      } else {
        instructions[file] = { exists: false };
      }
    }
    data.byRepo[repo] = instructions;
  }

  // Analyze variance in instruction files
  for (const file of instructionFiles) {
    const presentIn = [];
    const missingFrom = [];
    const lineCounts = [];

    for (const repo of CONFIG.repos) {
      const info = data.byRepo[repo]?.[file];
      if (info?.exists) {
        presentIn.push(repo);
        lineCounts.push(info.lineCount);
      } else {
        missingFrom.push(repo);
      }
    }

    const avgLines = lineCounts.length > 0
      ? Math.round(lineCounts.reduce((a, b) => a + b, 0) / lineCounts.length)
      : 0;
    const maxLines = Math.max(...lineCounts, 0);
    const minLines = Math.min(...lineCounts, 0);

    data.variance[file] = {
      presentIn,
      missingFrom,
      avgLineCount: avgLines,
      lineCountRange: maxLines - minLines,
      isUniform: missingFrom.length === 0 && (maxLines - minLines) < 50,
    };
  }

  return data;
}

/**
 * Analyze naming conventions in JavaScript files
 * @param {string} baseDir - Workspace root directory
 * @returns {object} Naming convention analysis
 */
function analyzeNamingConventions(baseDir) {
  const data = { byRepo: {}, variance: {} };

  // Patterns to detect
  const patterns = {
    camelCase: /^[a-z][a-zA-Z0-9]*$/,
    PascalCase: /^[A-Z][a-zA-Z0-9]*$/,
    snake_case: /^[a-z][a-z0-9_]*$/,
    UPPER_SNAKE: /^[A-Z][A-Z0-9_]*$/,
  };

  for (const repo of CONFIG.repos) {
    const jsDir = path.join(baseDir, repo, 'js');
    const stats = { functions: { camelCase: 0, other: 0 }, exports: { named: 0, default: 0 } };

    if (fs.existsSync(jsDir)) {
      try {
        const files = fs.readdirSync(jsDir).filter((f) => f.endsWith('.js') && !f.includes('.test.'));

        for (const file of files) {
          const content = fs.readFileSync(path.join(jsDir, file), 'utf8');

          // Count function declarations
          const funcMatches = content.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g) || [];
          for (const match of funcMatches) {
            const name = match.replace('function ', '');
            if (patterns.camelCase.test(name)) {
              stats.functions.camelCase++;
            } else {
              stats.functions.other++;
            }
          }

          // Count export styles
          const namedExports = (content.match(/export\s+(const|let|function|class)\s+/g) || []).length;
          const defaultExports = (content.match(/export\s+default\s+/g) || []).length;
          stats.exports.named += namedExports;
          stats.exports.default += defaultExports;
        }
      } catch {
        // Skip if can't read
      }
    }

    const totalFuncs = stats.functions.camelCase + stats.functions.other;
    const totalExports = stats.exports.named + stats.exports.default;

    data.byRepo[repo] = {
      camelCasePercent: totalFuncs > 0 ? Math.round((stats.functions.camelCase / totalFuncs) * 100) : 100,
      namedExportPercent: totalExports > 0 ? Math.round((stats.exports.named / totalExports) * 100) : 0,
      ...stats,
    };
  }

  // Calculate variance
  const camelCasePercents = Object.values(data.byRepo).map((r) => r.camelCasePercent);
  const namedExportPercents = Object.values(data.byRepo).map((r) => r.namedExportPercent);

  data.variance = {
    camelCase: {
      min: Math.min(...camelCasePercents),
      max: Math.max(...camelCasePercents),
      avg: Math.round(camelCasePercents.reduce((a, b) => a + b, 0) / camelCasePercents.length),
      isUniform: Math.max(...camelCasePercents) - Math.min(...camelCasePercents) < 10,
    },
    namedExports: {
      min: Math.min(...namedExportPercents),
      max: Math.max(...namedExportPercents),
      avg: Math.round(namedExportPercents.reduce((a, b) => a + b, 0) / namedExportPercents.length),
      isUniform: Math.max(...namedExportPercents) - Math.min(...namedExportPercents) < 20,
    },
  };

  return data;
}

/**
 * Generate variance findings
 * @param {object} thresholds - Test threshold data
 * @param {object} scripts - Package script data
 * @param {object} coreFiles - Core file presence data
 * @param {object} dependencies - Dependency version data
 * @param {object} aiInstructions - AI instruction analysis
 * @param {object} naming - Naming convention analysis
 * @returns {object} Findings categorized by severity
 */
function generateFindings(thresholds, scripts, coreFiles, dependencies, aiInstructions, naming) {
  const findings = { critical: [], warning: [], info: [] };

  // Check test thresholds
  for (const [type, data] of Object.entries(thresholds.variance)) {
    if (!data.isUniform) {
      findings.critical.push({
        dimension: 'testThresholds',
        field: `jest.config.js coverageThreshold.${type}`,
        message: `${data.count} distinct values found: ${data.values.join(', ')}`,
        entropy: data.entropy,
      });
    }
  }

  // Check package scripts
  for (const [script, data] of Object.entries(scripts.variance)) {
    if (data.missingFrom.length > 0) {
      findings.warning.push({
        dimension: 'configParity',
        field: `package.json scripts.${script}`,
        message: `Missing from: ${data.missingFrom.join(', ')}`,
        entropy: data.entropy,
      });
    }
  }

  // Check core files
  for (const [file, data] of Object.entries(coreFiles.variance)) {
    if (data.missingFrom.length > 0) {
      findings.warning.push({
        dimension: 'coreFiles',
        field: file,
        message: `Missing from: ${data.missingFrom.join(', ')}`,
      });
    }
  }

  // Check dependency versions
  if (dependencies?.variance) {
    for (const [dep, data] of Object.entries(dependencies.variance)) {
      if (!data.isUniform && data.count > 1) {
        findings.warning.push({
          dimension: 'dependencyVersions',
          field: `package.json ${dep}`,
          message: `${data.count} major versions: ${data.versions.join(', ')}`,
          entropy: data.entropy,
        });
      }
    }
  }

  // Check AI instruction files
  if (aiInstructions?.variance) {
    for (const [file, data] of Object.entries(aiInstructions.variance)) {
      if (data.missingFrom?.length > 0 && data.presentIn?.length > 0) {
        findings.info.push({
          dimension: 'aiInstructions',
          field: file,
          message: `Missing from: ${data.missingFrom.join(', ')}`,
        });
      }
      if (data.lineCountRange > 100) {
        findings.info.push({
          dimension: 'aiInstructions',
          field: `${file} length variance`,
          message: `Line count varies by ${data.lineCountRange} lines (avg: ${data.avgLineCount})`,
        });
      }
    }
  }

  // Check naming conventions
  if (naming?.variance) {
    if (!naming.variance.camelCase?.isUniform) {
      const range = naming.variance.camelCase;
      findings.info.push({
        dimension: 'namingConventions',
        field: 'camelCase function names',
        message: `Usage varies: ${range.min}% - ${range.max}% (avg: ${range.avg}%)`,
      });
    }
  }

  return findings;
}

/**
 * Calculate composite entropy score
 * @param {object} thresholds - Test threshold data
 * @param {object} scripts - Package script data
 * @param {object} dependencies - Dependency version data
 * @param {object} naming - Naming convention data
 * @returns {number} Weighted composite entropy (0-100)
 */
function calculateCompositeEntropy(thresholds, scripts, dependencies, naming) {
  // Test thresholds (25% weight)
  const thresholdEntropies = Object.values(thresholds.variance).map((v) => v.entropy);
  const avgThresholdEntropy = thresholdEntropies.length > 0
    ? thresholdEntropies.reduce((a, b) => a + b, 0) / thresholdEntropies.length
    : 0;

  // Scripts (15% weight)
  const scriptEntropies = Object.values(scripts.variance).map((v) => v.entropy);
  const avgScriptEntropy = scriptEntropies.length > 0
    ? scriptEntropies.reduce((a, b) => a + b, 0) / scriptEntropies.length
    : 0;

  // Dependencies (10% weight)
  const depEntropies = dependencies?.variance
    ? Object.values(dependencies.variance).map((v) => v.entropy || 0)
    : [];
  const avgDepEntropy = depEntropies.length > 0
    ? depEntropies.reduce((a, b) => a + b, 0) / depEntropies.length
    : 0;

  // Naming conventions (10% weight) - convert range to entropy-like score
  const namingScore = naming?.variance?.camelCase
    ? (100 - naming.variance.camelCase.avg) // Lower camelCase usage = higher entropy
    : 0;

  const composite = (avgThresholdEntropy * CONFIG.weights.testThresholds)
    + (avgScriptEntropy * CONFIG.weights.configParity)
    + (avgDepEntropy * CONFIG.weights.dependencyVersions)
    + (namingScore * CONFIG.weights.namingConventions * 0.5);

  return Math.round(composite * 10) / 10;
}

/**
 * Print results to console
 */
function printResults(thresholds, scripts, coreFiles, dependencies, naming, findings, compositeEntropy) {
  console.log('\n' + colors.bold('═══════════════════════════════════════════════════════════════'));
  console.log(colors.bold('                    GENESIS ALIGNMENT SCAN'));
  console.log(colors.bold('═══════════════════════════════════════════════════════════════\n'));

  console.log(`Repos Analyzed: ${CONFIG.repos.length}`);

  // Color-code entropy score
  let entropyColor = colors.green;
  let statusText = 'ALIGNED';
  if (compositeEntropy > 40) {
    entropyColor = colors.red;
    statusText = 'CRITICAL';
  } else if (compositeEntropy > 20) {
    entropyColor = colors.yellow;
    statusText = 'NEEDS ATTENTION';
  } else if (compositeEntropy > 10) {
    entropyColor = colors.cyan;
    statusText = 'ACCEPTABLE';
  }

  console.log(`Composite Entropy Score: ${entropyColor(compositeEntropy)} / 100 (${statusText})\n`);

  // Print test threshold details
  console.log(colors.bold('TEST COVERAGE THRESHOLDS:'));
  console.log('─'.repeat(60));
  for (const repo of CONFIG.repos) {
    const t = thresholds.byRepo[repo];
    if (t) {
      console.log(`  ${repo.padEnd(30)} statements=${t.statements || '?'} branches=${t.branches || '?'}`);
    } else {
      console.log(`  ${repo.padEnd(30)} ${colors.gray('(no config)')}`);
    }
  }

  // Print dependency versions (key deps only)
  if (dependencies?.variance) {
    const nonUniform = Object.entries(dependencies.variance).filter(([_, d]) => !d.isUniform && d.count > 1);
    if (nonUniform.length > 0) {
      console.log('\n' + colors.bold('DEPENDENCY VERSION DRIFT:'));
      console.log('─'.repeat(60));
      for (const [dep, data] of nonUniform) {
        console.log(`  ${dep.padEnd(25)} ${colors.yellow(data.versions.join(' vs '))}`);
      }
    }
  }

  // Print naming conventions
  if (naming?.variance?.camelCase) {
    const cc = naming.variance.camelCase;
    if (cc.min !== cc.max) {
      console.log('\n' + colors.bold('NAMING CONVENTIONS:'));
      console.log('─'.repeat(60));
      console.log(`  camelCase usage: ${cc.min}% - ${cc.max}% (avg: ${cc.avg}%)`);
    }
  }

  // Print critical findings
  if (findings.critical.length > 0) {
    console.log('\n' + colors.red(colors.bold('CRITICAL VARIANCE:')));
    for (const f of findings.critical) {
      console.log(`  ${colors.red('●')} ${f.field}: ${f.message}`);
    }
  }

  // Print warnings
  if (findings.warning.length > 0) {
    console.log('\n' + colors.yellow(colors.bold('WARNING VARIANCE:')));
    for (const f of findings.warning) {
      console.log(`  ${colors.yellow('●')} ${f.field}: ${f.message}`);
    }
  }

  // Print info
  if (findings.info.length > 0) {
    console.log('\n' + colors.cyan(colors.bold('INFO:')));
    for (const f of findings.info) {
      console.log(`  ${colors.cyan('○')} ${f.field}: ${f.message}`);
    }
  }

  if (findings.critical.length === 0 && findings.warning.length === 0) {
    console.log('\n' + colors.green('✓ All repos aligned. No variance detected.'));
  }

  console.log('\n' + colors.bold('═══════════════════════════════════════════════════════════════\n'));
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);
  const generateReport = args.includes('--report');
  const ciMode = args.includes('--ci');
  const thresholdIdx = args.indexOf('--threshold');
  const threshold = thresholdIdx >= 0 ? parseFloat(args[thresholdIdx + 1]) : 20;

  // Determine workspace root (genesis-tools directory)
  // The tool repos are siblings to genesis/ inside genesis-tools/
  let baseDir = process.cwd();

  // If running from inside alignment-tools, go up to genesis-tools
  if (baseDir.endsWith('alignment-tools')) {
    baseDir = path.resolve(baseDir, '../..');
  } else if (baseDir.endsWith('genesis')) {
    // If running from inside genesis/, go up to genesis-tools
    baseDir = path.resolve(baseDir, '..');
  }
  // Otherwise assume we're already at genesis-tools root

  // Verify we can find at least one repo
  const testRepoPath = path.join(baseDir, 'architecture-decision-record');
  if (!fs.existsSync(testRepoPath)) {
    console.error(`Cannot find repos at ${baseDir}. Run from genesis-tools directory.`);
    process.exit(1);
  }

  // Run scans
  const thresholds = await extractTestThresholds(baseDir);
  const scripts = extractPackageScripts(baseDir);
  const coreFiles = checkCoreFiles(baseDir);
  const dependencies = extractDependencyVersions(baseDir);
  const aiInstructions = analyzeAIInstructions(baseDir);
  const naming = analyzeNamingConventions(baseDir);

  // Generate findings and composite score
  const findings = generateFindings(thresholds, scripts, coreFiles, dependencies, aiInstructions, naming);
  const compositeEntropy = calculateCompositeEntropy(thresholds, scripts, dependencies, naming);

  // Print results
  printResults(thresholds, scripts, coreFiles, dependencies, naming, findings, compositeEntropy);

  // Generate report if requested
  if (generateReport) {
    const report = {
      timestamp: new Date().toISOString(),
      compositeEntropy,
      thresholds,
      scripts,
      coreFiles,
      dependencies,
      aiInstructions,
      naming,
      findings,
    };
    const reportPath = path.join(baseDir, 'genesis', 'alignment-tools', 'alignment-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`Report saved to: ${reportPath}\n`);
  }

  // CI mode exit code
  if (ciMode && compositeEntropy > threshold) {
    console.log(colors.red(`CI FAILED: Entropy ${compositeEntropy} exceeds threshold ${threshold}`));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Scan failed:', err);
  process.exit(1);
});

