'use strict'
const { getOctokit } = require('@actions/github')
const { getLatestRelease, getUnreleasedCommits } = require('../src/release')

const {
  allCommitsData: allCommits,
  allReleasesData: allReleases,
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

test('Throws if no releases found', async () => {
  getOctokit.mockReturnValue({
    rest: {
      repos: { getLatestRelease: () => Promise.reject(new Error()) },
    },
  })

  await expect(getLatestRelease(token)).rejects.toBeDefined()
})

test('Gets the unreleased commits', async () => {
  getOctokit.mockReturnValue({ request: async () => allCommits })
  const latestReleaseDate = allReleases[0].created_at
  const allCommitsResponse = await getUnreleasedCommits(
    token,
    latestReleaseDate
  )
  expect(allCommitsResponse).toStrictEqual(allCommits.data)
})
