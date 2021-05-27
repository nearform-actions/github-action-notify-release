'use strict'
const { getOctokit } = require('@actions/github')
const { getLatestRelease, getUnreleasedCommits } = require('../src/release')

const {
  allCommitsData: allCommits,
  allReleasesData: allReleases,
  unreleasedCommitsData0,
  unreleasedCommitsData1,
  allReleasesNoData,
} = require('./testData')

const token = 'dummytoken'

jest.mock('@actions/github', () => ({
  getOctokit: jest.fn(),
  context: { repo: { owner: 'sameer', repo: 'testrepo' } },
}))

test('Gets the latest release of the repository', async () => {
  getOctokit.mockReturnValue({
    request: async () => ({ data: allReleases.data[0] }),
  })
  const latestReleaseResponse = await getLatestRelease(token)
  expect(latestReleaseResponse).toStrictEqual(allReleases.data[0])
})

test('Retuns null if no releases found', async () => {
  getOctokit.mockReturnValue({
    request: async () => ({ data: allReleasesNoData.data[0] }),
  })
  const latestReleaseResponse = await getLatestRelease(token)
  expect(latestReleaseResponse).toBeUndefined()
})

test('Gets the unreleased commits with stale-days as 0', async () => {
  getOctokit.mockReturnValue({ request: async () => allCommits })
  const daysToIgnore = 0
  const latestReleaseDate = allReleases.data[0].created_at
  const allCommitsResponse = await getUnreleasedCommits(
    token,
    latestReleaseDate,
    daysToIgnore
  )
  expect(allCommitsResponse).toStrictEqual(unreleasedCommitsData1)
})

test('Gets the unreleased commits with stale-days as non zero', async () => {
  getOctokit.mockReturnValue({ request: async () => allCommits })
  const daysToIgnore = 3
  const latestReleaseDate = allReleases.data[0].created_at
  const allCommitsResponse = await getUnreleasedCommits(
    token,
    latestReleaseDate,
    daysToIgnore
  )
  expect(allCommitsResponse).toStrictEqual(unreleasedCommitsData1)
})

test('Gets the unreleased commits and uses default value of stale-days', async () => {
  getOctokit.mockReturnValue({ request: async () => allCommits })
  const daysToIgnore = undefined
  const latestReleaseDate = allReleases.data[0].created_at
  const allCommitsResponse = await getUnreleasedCommits(
    token,
    latestReleaseDate,
    daysToIgnore
  )
  expect(allCommitsResponse).toStrictEqual(unreleasedCommitsData0)
})
