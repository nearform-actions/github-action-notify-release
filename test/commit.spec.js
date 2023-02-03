'use strict'

const github = require('@actions/github')
const commit = require('../src/commit')
const {
  groupedUnreleasedCommitsData1,
  unreleasedCommitsData1,
} = require('./testData')

const token = 'dummytoken'
const owner = 'sameer'
const repo = 'testrepo'

jest.mock('@actions/github', () => ({
  getOctokit: jest.fn(),
  context: { repo: { owner, repo } },
}))

github.getOctokit.mockReturnValue({
  rest: {
    search: {
      issuesAndPullRequests: ({ q }) => {
        const sha = q.match(/SHA:(\w+)/)[1]
        const foundCommit = unreleasedCommitsData1.find(
          (commit) => commit.sha === sha
        )

        return Promise.resolve({
          data: {
            total_count: foundCommit && foundCommit.pr_number ? 1 : 0,
            items:
              foundCommit && foundCommit.pr_number
                ? [{ number: foundCommit.pr_number }]
                : [],
          },
        })
      },
    },
  },
})

test('should return an empty array if there are no commits', async () => {
  const commits = []

  const result = await commit.groupCommits(token, commits)

  expect(result).toEqual([])
})

test('should return grouped commits if the three kind of commits are present', async () => {
  const result = await commit.groupCommits(token, unreleasedCommitsData1)

  expect(result).toEqual(groupedUnreleasedCommitsData1)
})

test('should return grouped commits if singleCommitPRs are not present', async () => {
  const customCommitsData = unreleasedCommitsData1.filter(
    (item) =>
      !groupedUnreleasedCommitsData1.singleCommitPRs.some(
        (singleCommitItem) => singleCommitItem.sha === item.sha
      )
  )

  const result = await commit.groupCommits(token, customCommitsData)

  expect(result).toEqual({
    commitsWithoutPRs: groupedUnreleasedCommitsData1.commitsWithoutPRs,
    singleCommitPRs: [],
    multipleCommitPRs: groupedUnreleasedCommitsData1.multipleCommitPRs,
  })
})

test('should return grouped commits if commitsWithoutPRs are not present', async () => {
  const customCommitsData = unreleasedCommitsData1.filter(
    (item) =>
      !groupedUnreleasedCommitsData1.commitsWithoutPRs.some(
        (commitWithoutPrItem) => commitWithoutPrItem.sha === item.sha
      )
  )

  const result = await commit.groupCommits(token, customCommitsData)

  expect(result).toEqual({
    commitsWithoutPRs: [],
    singleCommitPRs: groupedUnreleasedCommitsData1.singleCommitPRs,
    multipleCommitPRs: groupedUnreleasedCommitsData1.multipleCommitPRs,
  })
})

test('should return grouped commits if multipleCommitPRs are not present', async () => {
  const multipleCommitPRsFlatten = [].concat(
    ...Object.values(groupedUnreleasedCommitsData1.multipleCommitPRs)
  )

  const customCommitsData = unreleasedCommitsData1.filter(
    (item) =>
      !multipleCommitPRsFlatten.some(
        (multipleCommitPrItem) => multipleCommitPrItem.sha === item.sha
      )
  )

  const result = await commit.groupCommits(token, customCommitsData)

  expect(result).toEqual({
    commitsWithoutPRs: groupedUnreleasedCommitsData1.commitsWithoutPRs,
    singleCommitPRs: groupedUnreleasedCommitsData1.singleCommitPRs,
    multipleCommitPRs: {},
  })
})
