'use strict'
const { getOctokit } = require('@actions/github')
const {
  tryGetLatestRelease,
  tryGetUnreleasedCommits,
} = require('../src/release')
const { daysToMs } = require('../src/time-utils.js')
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
  const latestReleaseResponse = await tryGetLatestRelease(token)
  expect(latestReleaseResponse).toStrictEqual(allReleases[0])
})

test('return null if no releases found', async () => {
  getOctokit.mockReturnValue({
    rest: {
      repos: { getLatestRelease: () => Promise.reject() },
    },
  })
  expect(await tryGetLatestRelease(token)).toBeFalsy()
})

test('Gets the unreleased commits', async () => {
  getOctokit.mockReturnValue({ request: async () => allCommits })
  const staleDate = Date.now()
  const latestReleaseDate = allReleases[0].created_at
  const allCommitsResponse = await tryGetUnreleasedCommits(
    token,
    latestReleaseDate,
    staleDate
  )
  expect(allCommitsResponse).toStrictEqual(unreleasedCommitsData1)
})

test('Gets the unreleased commits with stale-days as non zero', async () => {
  getOctokit.mockReturnValue({ request: async () => allCommits })
  const staleDate = Date.now() - daysToMs(3)
  const latestReleaseDate = allReleases[0].created_at
  const allCommitsResponse = await tryGetUnreleasedCommits(
    token,
    latestReleaseDate,
    staleDate
  )
  expect(allCommitsResponse).toStrictEqual(unreleasedCommitsData1)
})

test('Gets the unreleased commits and uses default value of stale-days', async () => {
  getOctokit.mockReturnValue({ request: async () => allCommits })
  const staleDate = new Date('2021-04-25T09:27:24Z').getTime()
  const latestReleaseDate = allReleases[0].created_at
  const allCommitsResponse = await tryGetUnreleasedCommits(
    token,
    latestReleaseDate,
    staleDate
  )
  expect(allCommitsResponse).toStrictEqual(unreleasedCommitsData0)
})
