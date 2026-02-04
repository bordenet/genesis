/**
 * Jest configuration for Genesis Alignment Tools v2
 */
export default {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['js', 'json'],
  testMatch: ['**/tests/**/*.test.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'lib/**/*.js',
    'scanners/**/*.js',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      statements: 20,
      branches: 15,
      functions: 15,
      lines: 20,
    },
  },
};

