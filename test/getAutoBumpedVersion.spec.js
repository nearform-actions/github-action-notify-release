'use strict'

const { exec } = require('@actions/exec')

const issue = require('../src/issue')

jest.mock('@actions/exec', () => ({
  exec: jest.fn(),
}))

test('should return the recommended release type', async () => {
  exec.mockImplementation(() => {
    return 0
  })
  const result = await issue.getAutoBumpedVersion()
  expect(result).toBe('minor')
  expect(exec).toHaveBeenCalledTimes(3)
})
