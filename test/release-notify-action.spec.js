'use strict'

const { runAction } = require('../src/release-notify-action')
const release = require('../src/release')
const commit = require('../src/commit')
const issue = require('../src/issue')

const {
  allReleasesData: allReleases,
  unreleasedCommitsData1,
  pendingIssues,
  groupedUnreleasedCommitsData1,
} = require('./testData')

jest.mock('../src/log')

jest.mock('../src/release', () => ({
  getLatestRelease: jest.fn(),
}))

jest.mock('../src/commit', () => ({
  groupCommits: jest.fn(),
  getUnreleasedCommits: jest.fn(),
}))

jest.mock('../src/issue', () => ({
  createOrUpdateIssue: jest.fn(),
  getLastOpenPendingIssue: jest.fn(),
  closeIssue: jest.fn(),
  createIssue: jest.fn(),
  isSnoozed: jest.fn(),
}))

beforeEach(() => {
  release.getLatestRelease.mockReset()
  commit.getUnreleasedCommits.mockReset()
  commit.groupCommits.mockReset()
  issue.createOrUpdateIssue.mockReset()
  issue.getLastOpenPendingIssue.mockReset()
  issue.closeIssue.mockReset()
  issue.isSnoozed.mockReset()
  issue.createIssue.mockReset()
})

const token = 'dummyToken'

test('Create issue for unreleased commits (no existing issues)', async () => {
  release.getLatestRelease.mockResolvedValue(allReleases[0])
  issue.getLastOpenPendingIssue.mockResolvedValue(null)
  commit.getUnreleasedCommits.mockResolvedValue(unreleasedCommitsData1)
  commit.groupCommits.mockResolvedValue(groupedUnreleasedCommitsData1)
  await runAction(token, '1 day', 1)
  expect(release.getLatestRelease).toBeCalledWith(token)
  expect(issue.getLastOpenPendingIssue).toBeCalledWith(token)
  expect(issue.createOrUpdateIssue).toBeCalledWith(
    token,
    groupedUnreleasedCommitsData1,
    null,
    allReleases[0],
    1,
    '1 day'
  )
  expect(issue.closeIssue).not.toHaveBeenCalled()
})

test('Update issue for unreleased commits (issue already exists)', async () => {
  release.getLatestRelease.mockResolvedValue(allReleases[0])
  issue.getLastOpenPendingIssue.mockResolvedValue(pendingIssues[0])
  commit.getUnreleasedCommits.mockResolvedValue(unreleasedCommitsData1)
  commit.groupCommits.mockResolvedValue(groupedUnreleasedCommitsData1)
  await runAction(token, '1 day', 1)

  expect(release.getLatestRelease).toBeCalledWith(token)
  expect(issue.getLastOpenPendingIssue).toBeCalledWith(token)
  expect(issue.createOrUpdateIssue).toBeCalledWith(
    token,
    groupedUnreleasedCommitsData1,
    pendingIssues[0],
    allReleases[0],
    1,
    '1 day'
  )
  expect(issue.closeIssue).not.toHaveBeenCalled()
})

test('Close issue when there is one pending and no unreleased commits', async () => {
  release.getLatestRelease.mockResolvedValue(allReleases[0])
  issue.getLastOpenPendingIssue.mockResolvedValue(pendingIssues[0])
  commit.getUnreleasedCommits.mockResolvedValue([])
  await runAction(token, '1 second', 1)

  expect(release.getLatestRelease).toBeCalledWith(token)
  expect(issue.getLastOpenPendingIssue).toBeCalledWith(token)
  expect(issue.createOrUpdateIssue).not.toHaveBeenCalled()
  expect(issue.closeIssue).toHaveBeenCalledWith(token, pendingIssues[0].number)
})

test('Do nothing when there is one issue pending and no new releases', async () => {
  release.getLatestRelease.mockResolvedValue(allReleases[1])
  issue.getLastOpenPendingIssue.mockResolvedValue(pendingIssues[0])
  commit.getUnreleasedCommits.mockResolvedValue([])
  await runAction(token, '1 second', 1)

  expect(release.getLatestRelease).toBeCalledWith(token)
  expect(issue.getLastOpenPendingIssue).toBeCalledWith(token)
  expect(issue.createOrUpdateIssue).not.toHaveBeenCalled()
  expect(issue.closeIssue).not.toHaveBeenCalled()
})

test('Do nothing when no releases found', async () => {
  release.getLatestRelease.mockResolvedValue()
  await runAction(token, '1 second', 1)

  expect(release.getLatestRelease).toBeCalledWith(token)
  expect(issue.getLastOpenPendingIssue).not.toHaveBeenCalled()
  expect(issue.createOrUpdateIssue).not.toHaveBeenCalled()
  expect(issue.closeIssue).not.toHaveBeenCalled()
})

test('Create snooze issue if notify was closed', async () => {
  release.getLatestRelease.mockResolvedValue(allReleases[0])
  commit.getUnreleasedCommits.mockResolvedValue(unreleasedCommitsData1)
  commit.groupCommits.mockResolvedValue(groupedUnreleasedCommitsData1)
  issue.getLastOpenPendingIssue.mockResolvedValue(null)

  await runAction(token, '20 years', 1)

  expect(issue.createOrUpdateIssue).toBeCalledWith(
    token,
    groupedUnreleasedCommitsData1,
    null,
    allReleases[0],
    1,
    '20 years'
  )
  expect(issue.closeIssue).not.toHaveBeenCalled()
})

test('Do not create or update issue if snoozed', async () => {
  release.getLatestRelease.mockResolvedValue(allReleases[0])
  commit.getUnreleasedCommits.mockResolvedValue(unreleasedCommitsData1)
  issue.getLastOpenPendingIssue.mockResolvedValue(null)
  issue.isSnoozed.mockResolvedValue(true)
  await runAction(token, '1 second', 1)
  expect(issue.createOrUpdateIssue).not.toBeCalled()
  expect(issue.closeIssue).not.toHaveBeenCalled()
})

test('Throw if date is invalid', async () => {
  release.getLatestRelease.mockResolvedValue(allReleases[0])
  commit.getUnreleasedCommits.mockResolvedValue(unreleasedCommitsData1)
  issue.getLastOpenPendingIssue.mockResolvedValue(null)
  issue.isSnoozed.mockResolvedValue(true)

  await expect(
    async () => await runAction(token, 'invalid date', 1)
  ).rejects.toThrow()
})
