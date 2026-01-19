export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@bizflow/types$': '<rootDir>/../../../packages/types/src/index.ts',
    '^@bizflow/database$': '<rootDir>/../../../packages/database/src/index.ts',
  },
};
