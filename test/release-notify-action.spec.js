import { test, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'

import {
  allReleasesData as allReleases,
  unreleasedCommitsData1,
  pendingIssues,
} from './testData.js'

mock.module(import.meta.resolve('../src/log.js'), {
  namedExports: {
    logDebug: mock.fn(),
    logError: mock.fn(),
    logInfo: mock.fn(),
    logWarning: mock.fn(),
  },
})

mock.module(import.meta.resolve('../src/release.js'), {
  namedExports: {
    getLatestRelease: mock.fn(),
    getUnreleasedCommits: mock.fn(),
  },
})

mock.module(import.meta.resolve('../src/issue.js'), {
  namedExports: {
    createOrUpdateIssue: mock.fn(),
    getLastOpenPendingIssue: mock.fn(),
    closeIssue: mock.fn(),
    createIssue: mock.fn(),
    isSnoozed: mock.fn(),
  },
})

const { runAction } = await import('../src/release-notify-action.js')
const release = await import('../src/release.js')
const issue = await import('../src/issue.js')

const resolved = (value) => (fn) =>
  fn.mock.mockImplementation(() => Promise.resolve(value))

beforeEach(() => {
  for (const fn of [
    release.getLatestRelease,
    release.getUnreleasedCommits,
    issue.createOrUpdateIssue,
    issue.getLastOpenPendingIssue,
    issue.closeIssue,
    issue.isSnoozed,
    issue.createIssue,
  ]) {
    fn.mock.restore()
    fn.mock.resetCalls()
  }
})

const token = 'dummyToken'

test('Create issue for unreleased commits (no existing issues)', async () => {
  resolved(allReleases[0])(release.getLatestRelease)
  resolved(null)(issue.getLastOpenPendingIssue)
  resolved(unreleasedCommitsData1)(release.getUnreleasedCommits)

  await runAction({ token, notifyAfter: '1 day', commitMessageLines: 1 })

  assert.deepEqual(release.getLatestRelease.mock.calls.at(-1).arguments, [
    token,
  ])
  assert.deepEqual(issue.getLastOpenPendingIssue.mock.calls.at(-1).arguments, [
    token,
  ])
  assert.deepEqual(issue.createOrUpdateIssue.mock.calls.at(-1).arguments, [
    token,
    unreleasedCommitsData1,
    null,
    allReleases[0],
    1,
    '1 day',
  ])
  assert.strictEqual(issue.closeIssue.mock.callCount(), 0)
})

test('Update issue for unreleased commits (issue already exists)', async () => {
  resolved(allReleases[0])(release.getLatestRelease)
  resolved(pendingIssues[0])(issue.getLastOpenPendingIssue)
  resolved(unreleasedCommitsData1)(release.getUnreleasedCommits)
  resolved(true)(issue.isSnoozed)

  await runAction({ token, notifyAfter: '1 day', commitMessageLines: 1 })

  assert.deepEqual(release.getLatestRelease.mock.calls.at(-1).arguments, [
    token,
  ])
  assert.deepEqual(issue.getLastOpenPendingIssue.mock.calls.at(-1).arguments, [
    token,
  ])
  assert.deepEqual(issue.createOrUpdateIssue.mock.calls.at(-1).arguments, [
    token,
    unreleasedCommitsData1,
    pendingIssues[0],
    allReleases[0],
    1,
    '1 day',
  ])
  assert.strictEqual(issue.isSnoozed.mock.callCount(), 0)
  assert.strictEqual(issue.closeIssue.mock.callCount(), 0)
})

test('Close issue when there is one pending and no unreleased commits', async () => {
  resolved(allReleases[0])(release.getLatestRelease)
  resolved(pendingIssues[0])(issue.getLastOpenPendingIssue)
  resolved([])(release.getUnreleasedCommits)

  await runAction({ token, notifyAfter: '1 second', commitMessageLines: 1 })

  assert.deepEqual(release.getLatestRelease.mock.calls.at(-1).arguments, [
    token,
  ])
  assert.deepEqual(issue.getLastOpenPendingIssue.mock.calls.at(-1).arguments, [
    token,
  ])
  assert.strictEqual(issue.createOrUpdateIssue.mock.callCount(), 0)
  assert.deepEqual(issue.closeIssue.mock.calls.at(-1).arguments, [
    token,
    pendingIssues[0].number,
  ])
})

test('Do nothing when there is one issue pending and no new releases', async () => {
  resolved(allReleases[1])(release.getLatestRelease)
  resolved(pendingIssues[0])(issue.getLastOpenPendingIssue)
  resolved([])(release.getUnreleasedCommits)

  await runAction({ token, notifyAfter: '1 second', commitMessageLines: 1 })

  assert.deepEqual(release.getLatestRelease.mock.calls.at(-1).arguments, [
    token,
  ])
  assert.deepEqual(issue.getLastOpenPendingIssue.mock.calls.at(-1).arguments, [
    token,
  ])
  assert.strictEqual(issue.createOrUpdateIssue.mock.callCount(), 0)
  assert.strictEqual(issue.closeIssue.mock.callCount(), 0)
})

test('Do nothing when no releases found', async () => {
  resolved(undefined)(release.getLatestRelease)

  await runAction({ token, notifyAfter: '1 second', commitMessageLines: 1 })

  assert.deepEqual(release.getLatestRelease.mock.calls.at(-1).arguments, [
    token,
  ])
  assert.strictEqual(issue.getLastOpenPendingIssue.mock.callCount(), 0)
  assert.strictEqual(issue.createOrUpdateIssue.mock.callCount(), 0)
  assert.strictEqual(issue.closeIssue.mock.callCount(), 0)
})

test('Create snooze issue if notify was closed', async () => {
  resolved(allReleases[0])(release.getLatestRelease)
  resolved(unreleasedCommitsData1)(release.getUnreleasedCommits)
  resolved(null)(issue.getLastOpenPendingIssue)

  await runAction({ token, notifyAfter: '20 years', commitMessageLines: 1 })

  assert.deepEqual(issue.createOrUpdateIssue.mock.calls.at(-1).arguments, [
    token,
    unreleasedCommitsData1,
    null,
    allReleases[0],
    1,
    '20 years',
  ])
  assert.strictEqual(issue.closeIssue.mock.callCount(), 0)
})

test('Create a new issue if ignore snoozed specified, no open issue, and snoozed issue', async () => {
  resolved(allReleases[0])(release.getLatestRelease)
  resolved(unreleasedCommitsData1)(release.getUnreleasedCommits)
  resolved(null)(issue.getLastOpenPendingIssue)
  resolved(true)(issue.isSnoozed)

  await runAction({
    token,
    ignoreSnoozed: true,
    notifyAfter: '1 second',
    commitMessageLines: 1,
  })

  assert.strictEqual(issue.isSnoozed.mock.callCount(), 0)
  assert.deepEqual(issue.createOrUpdateIssue.mock.calls.at(-1).arguments, [
    token,
    unreleasedCommitsData1,
    null,
    allReleases[0],
    1,
    '1 second',
  ])
})

test('Update existing open issue if ignore snoozed specified and snoozed issue', async () => {
  resolved(allReleases[0])(release.getLatestRelease)
  resolved(unreleasedCommitsData1)(release.getUnreleasedCommits)
  resolved(pendingIssues[0])(issue.getLastOpenPendingIssue)
  resolved(true)(issue.isSnoozed)

  await runAction({
    token,
    ignoreSnoozed: true,
    notifyAfter: '1 second',
    commitMessageLines: 1,
  })

  assert.strictEqual(issue.isSnoozed.mock.callCount(), 0)
  assert.deepEqual(issue.createOrUpdateIssue.mock.calls.at(-1).arguments, [
    token,
    unreleasedCommitsData1,
    pendingIssues[0],
    allReleases[0],
    1,
    '1 second',
  ])
})

test('Do not create or update issue if snoozed', async () => {
  resolved(allReleases[0])(release.getLatestRelease)
  resolved(unreleasedCommitsData1)(release.getUnreleasedCommits)
  resolved(null)(issue.getLastOpenPendingIssue)
  resolved(true)(issue.isSnoozed)

  await runAction({ token, notifyAfter: '1 second', commitMessageLines: 1 })

  assert.ok(issue.isSnoozed.mock.callCount() > 0)
  assert.strictEqual(issue.createOrUpdateIssue.mock.callCount(), 0)
  assert.strictEqual(issue.closeIssue.mock.callCount(), 0)
})

test('Throw if date is invalid', async () => {
  resolved(allReleases[0])(release.getLatestRelease)
  resolved(unreleasedCommitsData1)(release.getUnreleasedCommits)
  resolved(null)(issue.getLastOpenPendingIssue)
  resolved(true)(issue.isSnoozed)

  await assert.rejects(
    async () =>
      await runAction({
        token,
        notifyAfter: 'invalid date',
        commitMessageLines: 1,
      })
  )
})
