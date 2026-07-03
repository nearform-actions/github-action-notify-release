'use strict'

const { describe, test, mock } = require('node:test')

mock.module('@actions/core', {
  namedExports: {
    debug: mock.fn(),
    error: mock.fn(),
    info: mock.fn(),
    warning: mock.fn(),
  },
})

const log = require('../src/log')

describe('log', () => {
  for (const method of ['logDebug', 'logInfo', 'logWarning', 'logError']) {
    test(`it should log with ${method}`, () => log[method]())
  }
})
