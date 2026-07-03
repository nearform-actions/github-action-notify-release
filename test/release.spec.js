import { test, mock } from 'node:test'
import assert from 'node:assert/strict'

import {
  allCommitsData as allCommits,
  allReleasesData as allReleases,
  unreleasedCommitsData0,
  unreleasedCommitsData1,
} from './testData.js'

const getOctokit = mock.fn()

mock.module('@actions/github', {
  namedExports: {
    getOctokit,
    context: { repo: { owner: 'sameer', repo: 'testrepo' } },
  },
})

const { getLatestRelease, getUnreleasedCommits } =
  await import('../src/release.js')

const token = 'dummytoken'

test('Gets the latest release of the repository', async () => {
  getOctokit.mock.mockImplementation(() => ({
    rest: {
      repos: {
        getLatestRelease: async () => ({
          data: allReleases[0],
        }),
      },
    },
  }))
  const latestReleaseResponse = await getLatestRelease(token)
  assert.deepStrictEqual(latestReleaseResponse, allReleases[0])
})

test('throws if no releases found', async () => {
  getOctokit.mock.mockImplementation(() => ({
    rest: {
      repos: { getLatestRelease: () => Promise.reject(new Error()) },
    },
  }))
  assert.strictEqual(await getLatestRelease(token), undefined)
})

test('Gets the unreleased commits', async () => {
  getOctokit.mock.mockImplementation(() => ({
    request: async () => allCommits,
  }))
  const latestReleaseDate = allReleases[0].created_at
  const allCommitsResponse = await getUnreleasedCommits(
    token,
    latestReleaseDate,
    Date.now()
  )
  assert.deepStrictEqual(allCommitsResponse, unreleasedCommitsData1)
})

test('Gets the unreleased commits with stale-days as non zero', async () => {
  getOctokit.mock.mockImplementation(() => ({
    request: async () => allCommits,
  }))
  const notifyDate = Date.now() - 3 * 24 * 60 * 60 * 1000
  const latestReleaseDate = allReleases[0].created_at
  const allCommitsResponse = await getUnreleasedCommits(
    token,
    latestReleaseDate,
    notifyDate
  )
  assert.deepStrictEqual(allCommitsResponse, unreleasedCommitsData1)
})

test('Gets the unreleased commits and uses default value of stale-days', async () => {
  getOctokit.mock.mockImplementation(() => ({
    request: async () => allCommits,
  }))
  const notifyDate = new Date('2000').getTime()
  const latestReleaseDate = allReleases[0].created_at
  const allCommitsResponse = await getUnreleasedCommits(
    token,
    latestReleaseDate,
    notifyDate
  )
  assert.deepStrictEqual(allCommitsResponse, unreleasedCommitsData0)
})
