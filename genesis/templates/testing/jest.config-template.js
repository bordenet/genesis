/**
 * Jest Configuration for {{PROJECT_TITLE}}
 */
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['js'],
  testMatch: ['**/*.test.js'],
  testPathIgnorePatterns: ['<rootDir>/tests/e2e/', '<rootDir>/genesis/', '<rootDir>/docs/'],
  collectCoverageFrom: [
    'js/**/*.js',
    '!js/**/*.test.js',
    '!js/app.js',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      statements: 50,
      branches: 40,
      functions: 50,
      lines: 50
    }
  },
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  }
};

