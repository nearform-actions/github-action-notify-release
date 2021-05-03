'use strict'

module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
    }
  },
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '/husky/']
}
