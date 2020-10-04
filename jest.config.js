module.exports = {
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.(spec|test).+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    'context-kit': '<rootDir>/src/index',
  },
};
