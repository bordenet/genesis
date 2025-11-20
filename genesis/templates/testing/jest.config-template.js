/**
 * Jest Configuration for {{PROJECT_TITLE}}
 * 
 * This configuration sets up Jest for testing JavaScript modules
 * with coverage reporting and threshold enforcement.
 */

export default {
  // Test environment
  testEnvironment: 'jsdom',

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],

  // Coverage collection
  collectCoverage: true,
  collectCoverageFrom: [
    '{{DEPLOY_FOLDER}}/js/**/*.js',
    '!{{DEPLOY_FOLDER}}/js/**/*.test.js',
    '!{{DEPLOY_FOLDER}}/js/**/*.spec.js',
    '!{{DEPLOY_FOLDER}}/js/__tests__/**',
    '!{{DEPLOY_FOLDER}}/js/mock/**'
  ],

  // Coverage thresholds (ENFORCED)
  coverageThresholds: {
    global: {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85
    }
  },

  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json'
  ],

  // Coverage directory
  coverageDirectory: 'coverage',

  // Module paths
  moduleDirectories: [
    'node_modules',
    '{{DEPLOY_FOLDER}}/js'
  ],

  // Transform files (if using TypeScript or JSX)
  transform: {},

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true,

  // Reset mocks between tests
  resetMocks: true,

  // Timeout for tests (milliseconds)
  testTimeout: 10000,

  // Bail after first test failure (set to false for CI)
  bail: false,

  // Maximum number of workers
  maxWorkers: '50%',

  // Notify on completion (useful for watch mode)
  notify: false,

  // Error on deprecated APIs
  errorOnDeprecated: true
};

