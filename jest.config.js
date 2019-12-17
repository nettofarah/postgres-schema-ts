module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  globalSetup: '<rootDir>/jest-setup.ts',
  clearMocks: true,
  resetMocks: true,
  globals: {
    'ts-jest': {
      diagnostics: false
    }
  }
}
