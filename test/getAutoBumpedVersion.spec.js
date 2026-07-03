'use strict'

const { test, mock } = require('node:test')
const assert = require('node:assert/strict')

const exec = mock.fn()
const conventionalRecommendedBump = mock.fn((_, cb) =>
  cb(null, { releaseType: 'minor' })
)

mock.module('@actions/github', {
  namedExports: {
    getOctokit: mock.fn(),
    context: { repo: {} },
  },
})

mock.module('@actions/exec', {
  namedExports: {
    exec,
  },
})

mock.module('conventional-changelog-monorepo/conventional-recommended-bump', {
  defaultExport: conventionalRecommendedBump,
})

const { getAutoBumpedVersion } = require('../src/issue')

test('getAutoBumpedVersion', async () => {
  const baseTag = 'v1.0.0'

  exec.mock.mockImplementation(() => {
    return 0
  })

  const result = await getAutoBumpedVersion(baseTag)

  assert.ok(conventionalRecommendedBump.mock.callCount() > 0)
  assert.strictEqual(result, 'minor')
})
