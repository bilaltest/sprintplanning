module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/'
  ],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.spec.ts',
    '!src/app/**/*.module.ts',
    '!src/main.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@models/(.*)$': '<rootDir>/src/app/models/$1',
    '^@services/(.*)$': '<rootDir>/src/app/services/$1',
    '^@components/(.*)$': '<rootDir>/src/app/components/$1',
    '^@directives/(.*)$': '<rootDir>/src/app/directives/$1',
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)']
};
