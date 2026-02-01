/**
 * Configuration file parsers for semantic comparison.
 * Extracts specific values from config files rather than just hashing them.
 *
 * @module lib/config-parser
 */

import fs from 'fs';
import path from 'path';

/**
 * Safely read and parse a JSON file.
 *
 * @param {string} filePath - Path to the JSON file
 * @returns {object|null} Parsed JSON or null if failed
 */
export function readJsonFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Read a file as text.
 *
 * @param {string} filePath - Path to the file
 * @returns {string|null} File contents or null if failed
 */
export function readTextFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

/**
 * Parse Jest config file and extract coverage thresholds.
 * Uses regex to safely extract values without eval.
 *
 * @param {string} filePath - Path to jest.config.js
 * @returns {object|null} Parsed config with coverage thresholds
 */
export function parseJestConfig(filePath) {
  const content = readTextFile(filePath);
  if (!content) return null;

  const thresholds = {};
  const statementsMatch = content.match(/statements:\s*(\d+)/);
  const branchesMatch = content.match(/branches:\s*(\d+)/);
  const functionsMatch = content.match(/functions:\s*(\d+)/);
  const linesMatch = content.match(/lines:\s*(\d+)/);
  const envMatch = content.match(/testEnvironment:\s*['"]([^'"]+)['"]/);

  if (statementsMatch) thresholds.statements = parseInt(statementsMatch[1], 10);
  if (branchesMatch) thresholds.branches = parseInt(branchesMatch[1], 10);
  if (functionsMatch) thresholds.functions = parseInt(functionsMatch[1], 10);
  if (linesMatch) thresholds.lines = parseInt(linesMatch[1], 10);

  return {
    coverageThreshold: { global: thresholds },
    testEnvironment: envMatch ? envMatch[1] : null,
  };
}

/**
 * Parse ESLint config file and extract key rules.
 *
 * @param {string} filePath - Path to eslint.config.js
 * @returns {object|null} Parsed config with key rules
 */
export function parseEslintConfig(filePath) {
  const content = readTextFile(filePath);
  if (!content) return null;

  const rules = {};
  const quotesMatch = content.match(/quotes:\s*\[['"]error['"],\s*['"]([^'"]+)['"]/);
  const semiMatch = content.match(/semi:\s*\[['"]error['"],\s*['"]([^'"]+)['"]/);

  if (quotesMatch) rules.quotes = quotesMatch[1];
  if (semiMatch) rules.semi = semiMatch[1] === 'always';

  return { rules };
}

/**
 * Parse GitHub Actions workflow file.
 *
 * @param {string} filePath - Path to workflow YAML file
 * @returns {object|null} Parsed workflow info
 */
export function parseWorkflowFile(filePath) {
  const content = readTextFile(filePath);
  if (!content) return null;

  const info = {
    nodeVersions: [],
    hasLint: false,
    hasTest: false,
    hasCoverage: false,
    hasSecurity: false,
  };

  // Extract Node versions from matrix
  const nodeMatch = content.match(/node-version:\s*\[([^\]]+)\]/);
  if (nodeMatch) {
    info.nodeVersions = nodeMatch[1]
      .split(',')
      .map((v) => v.trim().replace(/['"]/g, ''));
  }

  // Check for common steps
  info.hasLint = /npm run lint|eslint/i.test(content);
  info.hasTest = /npm test|jest|npm run test/i.test(content);
  info.hasCoverage = /codecov|coverage/i.test(content);
  info.hasSecurity = /trivy|snyk|security/i.test(content);

  return info;
}

/**
 * Check if a file exists.
 *
 * @param {string} filePath - Path to check
 * @returns {boolean} True if file exists
 */
export function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Get all files in a directory recursively.
 *
 * @param {string} dir - Directory to scan
 * @param {string[]} exclude - Patterns to exclude
 * @returns {string[]} Array of file paths
 */
export function getAllFiles(dir, exclude = ['node_modules', '.git', 'coverage', 'dist']) {
  const files = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (exclude.includes(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...getAllFiles(fullPath, exclude));
      } else {
        files.push(fullPath);
      }
    }
  } catch {
    /* ignore */
  }
  return files;
}

