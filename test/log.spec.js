'use strict'

jest.mock('@actions/core')

const log = require('../src/log')

describe('log', () => {
  it.each([['logDebug'], ['logInfo'], ['logWarning'], ['logError']])(
    'it should log with %s',
    (method) => log[method]()
  )
})
