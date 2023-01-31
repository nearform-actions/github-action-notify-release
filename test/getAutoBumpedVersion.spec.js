'use strict'
const { exec } = require('@actions/exec')

const {
  getAutoBumpedVersion,
  conventionalRecommendedBumpAsync,
} = require('../src/issue')

jest.mock('@actions/exec', () => ({
  exec: jest.fn(),
}))

jest.mock('conventional-changelog-monorepo/conventional-recommended-bump', () =>
  jest.fn((_, cb) => cb(null, { releaseType: 'minor' }))
)

test('getAutoBumpedVersion', async () => {
  const baseTag = 'v1.0.0'

  exec.mockImplementation(() => {
    return 0
  })

  const result = await getAutoBumpedVersion(baseTag)

  expect(conventionalRecommendedBumpAsync).toHaveBeenCalled()
  expect(result).toBe('minor')
})
