export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['js'],
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: [
    'js/**/*.js',
    '!js/**/*.test.js',
    '!js/app.js',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 50,
      functions: 75,
      lines: 70
    }
  },
  coverageReporters: ['text', 'lcov', 'html'],
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};

