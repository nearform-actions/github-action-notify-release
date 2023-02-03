'use strict'
const { getOctokit } = require('@actions/github')
const { getLatestRelease } = require('../src/release')
const { getUnreleasedCommits } = require('../src/commit')
const {
  allCommitsData: allCommits,
  allReleasesData: allReleases,
  unreleasedCommitsData0,
  unreleasedCommitsData1,
} = require('./testData')

const token = 'dummytoken'

jest.mock('@actions/github', () => ({
  getOctokit: jest.fn(),
  context: { repo: { owner: 'sameer', repo: 'testrepo' } },
}))

test('Gets the latest release of the repository', async () => {
  getOctokit.mockReturnValue({
    rest: {
      repos: {
        getLatestRelease: async () => ({
          data: allReleases[0],
        }),
      },
    },
  })
  const latestReleaseResponse = await getLatestRelease(token)
  expect(latestReleaseResponse).toStrictEqual(allReleases[0])
})

test('throws if no releases found', async () => {
  getOctokit.mockReturnValue({
    rest: {
      repos: { getLatestRelease: () => Promise.reject(new Error()) },
    },
  })
  expect(await getLatestRelease(token)).toBeUndefined()
})

test('Gets the unreleased commits', async () => {
  getOctokit.mockReturnValue({ request: async () => allCommits })
  const latestReleaseDate = allReleases[0].created_at
  const allCommitsResponse = await getUnreleasedCommits(
    token,
    latestReleaseDate,
    Date.now()
  )
  expect(allCommitsResponse).toStrictEqual(unreleasedCommitsData1)
})

test('Gets the unreleased commits with stale-days as non zero', async () => {
  getOctokit.mockReturnValue({ request: async () => allCommits })
  const notifyDate = Date.now() - 3 * 24 * 60 * 60 * 1000
  const latestReleaseDate = allReleases[0].created_at
  const allCommitsResponse = await getUnreleasedCommits(
    token,
    latestReleaseDate,
    notifyDate
  )
  expect(allCommitsResponse).toStrictEqual(unreleasedCommitsData1)
})

test('Gets the unreleased commits and uses default value of stale-days', async () => {
  getOctokit.mockReturnValue({ request: async () => allCommits })
  const notifyDate = new Date('2000').getTime()
  const latestReleaseDate = allReleases[0].created_at
  const allCommitsResponse = await getUnreleasedCommits(
    token,
    latestReleaseDate,
    notifyDate
  )
  expect(allCommitsResponse).toStrictEqual(unreleasedCommitsData0)
})
