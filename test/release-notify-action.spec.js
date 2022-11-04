'use strict'

const { runAction } = require('../src/release-notify-action')
const release = require('../src/release')
const issue = require('../src/issue')

const {
  allReleasesData: allReleases,
  unreleasedCommitsData1,
  pendingIssues,
} = require('./testData')

jest.mock('../src/log')

jest.mock('../src/release', () => ({
  getLatestRelease: jest.fn(),
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
  release.getUnreleasedCommits.mockReset()
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
  release.getUnreleasedCommits.mockResolvedValue(unreleasedCommitsData1)
  await runAction(token, Date.now(), 1)
  expect(release.getLatestRelease).toBeCalledWith(token)
  expect(issue.getLastOpenPendingIssue).toBeCalledWith(token)
  expect(issue.createOrUpdateIssue).toBeCalledWith(
    token,
    unreleasedCommitsData1,
    null,
    allReleases[0],
    1
  )
  expect(issue.closeIssue).not.toHaveBeenCalled()
})

test('Update issue for unreleased commits (issue already exists)', async () => {
  release.getLatestRelease.mockResolvedValue(allReleases[0])
  issue.getLastOpenPendingIssue.mockResolvedValue(pendingIssues[0])
  release.getUnreleasedCommits.mockResolvedValue(unreleasedCommitsData1)
  await runAction(token, Date.now(), 1)

  expect(release.getLatestRelease).toBeCalledWith(token)
  expect(issue.getLastOpenPendingIssue).toBeCalledWith(token)
  expect(issue.createOrUpdateIssue).toBeCalledWith(
    token,
    unreleasedCommitsData1,
    pendingIssues[0],
    allReleases[0],
    1
  )
  expect(issue.closeIssue).not.toHaveBeenCalled()
})

test('Close issue when there is one pending and no unreleased commits', async () => {
  release.getLatestRelease.mockResolvedValue(allReleases[0])
  issue.getLastOpenPendingIssue.mockResolvedValue(pendingIssues[0])
  release.getUnreleasedCommits.mockResolvedValue([])
  await runAction(token, Date.now(), 1)

  expect(release.getLatestRelease).toBeCalledWith(token)
  expect(issue.getLastOpenPendingIssue).toBeCalledWith(token)
  expect(issue.createOrUpdateIssue).not.toHaveBeenCalled()
  expect(issue.closeIssue).toHaveBeenCalledWith(token, pendingIssues[0].number)
})

test('Do nothing when there is one issue pending and no new releases', async () => {
  release.getLatestRelease.mockResolvedValue(allReleases[1])
  issue.getLastOpenPendingIssue.mockResolvedValue(pendingIssues[0])
  release.getUnreleasedCommits.mockResolvedValue([])
  await runAction(token, Date.now(), 1)

  expect(release.getLatestRelease).toBeCalledWith(token)
  expect(issue.getLastOpenPendingIssue).toBeCalledWith(token)
  expect(issue.createOrUpdateIssue).not.toHaveBeenCalled()
  expect(issue.closeIssue).not.toHaveBeenCalled()
})

test('Do nothing when no releases found', async () => {
  release.getLatestRelease.mockResolvedValue()
  await runAction(token, new Date().getTime(), 1)

  expect(release.getLatestRelease).toBeCalledWith(token)
  expect(issue.getLastOpenPendingIssue).not.toHaveBeenCalled()
  expect(issue.createOrUpdateIssue).not.toHaveBeenCalled()
  expect(issue.closeIssue).not.toHaveBeenCalled()
})

test('Create snooze issue if notify was closed', async () => {
  release.getLatestRelease.mockResolvedValue(allReleases[0])
  release.getUnreleasedCommits.mockResolvedValue(unreleasedCommitsData1)
  issue.getLastOpenPendingIssue.mockResolvedValue(null)

  const staleDate = new Date('2000').getTime()
  await runAction(token, staleDate, 1)

  expect(issue.createOrUpdateIssue).toBeCalledWith(
    token,
    unreleasedCommitsData1,
    null,
    allReleases[0],
    1
  )
  expect(issue.closeIssue).not.toHaveBeenCalled()
})

test('Do not create or update snooze issue if closed issue is after stale date', async () => {
  release.getLatestRelease.mockResolvedValue(allReleases[0])
  release.getUnreleasedCommits.mockResolvedValue(unreleasedCommitsData1)
  issue.getLastOpenPendingIssue.mockResolvedValue(null)
  issue.isSnoozed.mockResolvedValue(true)
  const staleDate = new Date('2000-04-21').getTime()
  await runAction(token, staleDate, 1)
  expect(issue.createOrUpdateIssue).not.toBeCalled()
  expect(issue.closeIssue).not.toHaveBeenCalled()
})
