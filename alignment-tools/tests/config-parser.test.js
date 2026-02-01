/**
 * Tests for lib/config-parser.js
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  readJsonFile,
  readTextFile,
  parseJestConfig,
  parseEslintConfig,
  parseWorkflowFile,
  fileExists,
  getAllFiles,
} from '../lib/config-parser.js';

// Create a temp directory for test fixtures
const tmpDir = path.join(os.tmpdir(), 'genesis-alignment-tests-' + Date.now());

beforeAll(() => {
  fs.mkdirSync(tmpDir, { recursive: true });
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('readJsonFile', () => {
  test('returns null for non-existent file', () => {
    expect(readJsonFile('/non/existent/file.json')).toBe(null);
  });

  test('reads and parses valid JSON', () => {
    const testFile = path.join(tmpDir, 'test.json');
    fs.writeFileSync(testFile, JSON.stringify({ key: 'value' }));
    expect(readJsonFile(testFile)).toEqual({ key: 'value' });
  });

  test('returns null for invalid JSON', () => {
    const testFile = path.join(tmpDir, 'invalid.json');
    fs.writeFileSync(testFile, 'not valid json');
    expect(readJsonFile(testFile)).toBe(null);
  });
});

describe('readTextFile', () => {
  test('returns null for non-existent file', () => {
    expect(readTextFile('/non/existent/file.txt')).toBe(null);
  });

  test('reads text file contents', () => {
    const testFile = path.join(tmpDir, 'test.txt');
    fs.writeFileSync(testFile, 'hello world');
    expect(readTextFile(testFile)).toBe('hello world');
  });
});

describe('parseJestConfig', () => {
  test('returns null for non-existent file', () => {
    expect(parseJestConfig('/non/existent/jest.config.js')).toBe(null);
  });

  test('extracts coverage thresholds correctly', () => {
    const jestConfig = `export default {
      testEnvironment: 'jsdom',
      coverageThreshold: {
        global: {
          statements: 50,
          branches: 40,
          functions: 50,
          lines: 50,
        },
      },
    };`;
    const testFile = path.join(tmpDir, 'jest.config.js');
    fs.writeFileSync(testFile, jestConfig);

    const result = parseJestConfig(testFile);
    expect(result.coverageThreshold.global.statements).toBe(50);
    expect(result.coverageThreshold.global.branches).toBe(40);
    expect(result.coverageThreshold.global.functions).toBe(50);
    expect(result.coverageThreshold.global.lines).toBe(50);
    expect(result.testEnvironment).toBe('jsdom');
  });

  test('handles config with different threshold values', () => {
    const jestConfig = `export default {
      testEnvironment: 'node',
      coverageThreshold: {
        global: {
          statements: 85,
          branches: 80,
          functions: 85,
          lines: 85,
        },
      },
    };`;
    const testFile = path.join(tmpDir, 'jest-high.config.js');
    fs.writeFileSync(testFile, jestConfig);

    const result = parseJestConfig(testFile);
    expect(result.coverageThreshold.global.statements).toBe(85);
    expect(result.testEnvironment).toBe('node');
  });

  test('handles config without coverage thresholds', () => {
    const jestConfig = `export default {
      testEnvironment: 'jsdom',
    };`;
    const testFile = path.join(tmpDir, 'jest-no-coverage.config.js');
    fs.writeFileSync(testFile, jestConfig);

    const result = parseJestConfig(testFile);
    expect(result.coverageThreshold.global).toEqual({});
    expect(result.testEnvironment).toBe('jsdom');
  });
});

describe('parseEslintConfig', () => {
  test('returns null for non-existent file', () => {
    expect(parseEslintConfig('/non/existent/eslint.config.js')).toBe(null);
  });

  test('extracts quotes rule', () => {
    const eslintConfig = `export default [{
      rules: {
        quotes: ['error', 'single'],
        semi: ['error', 'always'],
      },
    }];`;
    const testFile = path.join(tmpDir, 'eslint.config.js');
    fs.writeFileSync(testFile, eslintConfig);

    const result = parseEslintConfig(testFile);
    expect(result.rules.quotes).toBe('single');
    expect(result.rules.semi).toBe(true);
  });
});

describe('parseWorkflowFile', () => {
  test('returns null for non-existent file', () => {
    expect(parseWorkflowFile('/non/existent/ci.yml')).toBe(null);
  });

  test('extracts node versions from matrix', () => {
    const workflow = `
name: CI
on: [push, pull_request]
jobs:
  test:
    strategy:
      matrix:
        node-version: [18.x, 20.x, 22.x]
    steps:
      - run: npm test
      - run: npm run lint
    `;
    const testFile = path.join(tmpDir, 'ci.yml');
    fs.writeFileSync(testFile, workflow);

    const result = parseWorkflowFile(testFile);
    expect(result.nodeVersions).toEqual(['18.x', '20.x', '22.x']);
    expect(result.hasLint).toBe(true);
    expect(result.hasTest).toBe(true);
  });
});

describe('fileExists', () => {
  test('returns true for existing file', () => {
    const testFile = path.join(tmpDir, 'exists.txt');
    fs.writeFileSync(testFile, 'hello');
    expect(fileExists(testFile)).toBe(true);
  });

  test('returns false for non-existent file', () => {
    expect(fileExists('/non/existent/file.txt')).toBe(false);
  });
});

