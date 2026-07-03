import { describe, test, mock } from 'node:test'

mock.module('@actions/core', {
  namedExports: {
    debug: mock.fn(),
    error: mock.fn(),
    info: mock.fn(),
    warning: mock.fn(),
  },
})

const log = await import('../src/log.js')

describe('log', () => {
  for (const method of ['logDebug', 'logInfo', 'logWarning', 'logError']) {
    test(`it should log with ${method}`, () => log[method]())
  }
})
