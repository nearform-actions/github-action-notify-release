'use strict'

const { test, mock } = require('node:test')
const assert = require('node:assert/strict')
const { pathToFileURL } = require('node:url')

const getOctokit = mock.fn()
const exec = mock.fn()

mock.module(pathToFileURL(require.resolve('../src/log')).href, {
  namedExports: {
    logInfo: mock.fn(),
  },
})

const owner = 'sameer'
const repo = 'testrepo'

mock.module('@actions/github', {
  namedExports: {
    getOctokit,
    context: { repo: { owner, repo } },
  },
})

mock.module('@actions/exec', {
  namedExports: {
    exec,
  },
})

mock.module('conventional-changelog-monorepo/conventional-recommended-bump', {
  defaultExport: mock.fn((_, cb) => cb(null, { releaseType: 'minor' })),
})

const issue = require('../src/issue')
const { getNotifyDate } = require('../src/time-utils')

const { unreleasedCommitsData1, closedNotifyIssues } = require('./testData')

const token = 'dummytoken'

test('Creates an issue', async () => {
  getOctokit.mock.mockImplementation(() => ({
    rest: { issues: { create: async () => ({ data: { number: 9 } }) } },
  }))
  const issueBody = 'issue has been created with pending commits'

  const issueResponse = await issue.createIssue(token, issueBody)
  assert.strictEqual(issueResponse.data.number, 9)
})

test('Throws if something went wrong in creating an issue', async () => {
  getOctokit.mock.mockImplementation(() => null)
  const issueBody = 'issue has been created with pending commits'

  await assert.rejects(issue.createIssue(token, issueBody))
})

test('Updates an issue', async () => {
  getOctokit.mock.mockImplementation(() => ({
    request: async () => ({ data: [{ number: 9 }] }),
  }))
  const issueTitle = 'Release pending!'
  const issueNo = 9
  const issueBody = 'issue has been updated with pending commits'

  const updatedIssue = await issue.updateLastOpenPendingIssue(
    token,
    issueTitle,
    issueBody,
    issueNo
  )
  assert.strictEqual(updatedIssue.number, 9)
})

test('Updates an issue', async () => {
  getOctokit.mock.mockImplementation(() => ({
    request: async () => ({ data: [] }),
  }))
  const issueTitle = 'Release pending!'
  const issueNo = 9
  const issueBody = 'issue has been updated with pending commits'

  const updatedIssue = await issue.updateLastOpenPendingIssue(
    token,
    issueTitle,
    issueBody,
    issueNo
  )
  assert.strictEqual(updatedIssue, null)
})

test('Gets last open pending issue', async () => {
  const latestReleaseDate = 'test date'
  getOctokit.mock.mockImplementation(() => ({
    request: async () => ({ data: [{ number: 9 }] }),
  }))

  const pendingIssue = await issue.getLastOpenPendingIssue(
    token,
    latestReleaseDate
  )
  assert.strictEqual(pendingIssue.number, 9)
})

test('Get last open pending issue returns invalid result', async () => {
  const latestReleaseDate = 'test date'
  getOctokit.mock.mockImplementation(() => ({
    request: async () => ({ data: [] }),
  }))

  const pendingIssue = await issue.getLastOpenPendingIssue(
    token,
    latestReleaseDate
  )
  assert.strictEqual(pendingIssue, null)
})

test('Close an issue', async () => {
  const request = mock.fn()
  getOctokit.mock.mockImplementation(() => ({ request }))

  await issue.closeIssue(token, '1')
  assert.deepEqual(request.mock.calls.at(-1).arguments, [
    'PATCH /repos/{owner}/{repo}/issues/1',
    {
      owner,
      repo,
      state: 'closed',
    },
  ])
})

test('Create an issue when no existing issue exists', async () => {
  const create = mock.fn()
  exec.mock.mockImplementation(() => {
    return 0
  })
  getOctokit.mock.mockImplementation(() => ({ rest: { issues: { create } } }))
  create.mock.mockImplementation(() =>
    Promise.resolve({
      data: {
        number: 1,
      },
    })
  )

  await issue.createOrUpdateIssue(
    token,
    unreleasedCommitsData1,
    null,
    'test-date'
  )
  assert.ok(create.mock.callCount() > 0)
})

test('Update an issue when exists', async () => {
  const request = mock.fn()
  exec.mock.mockImplementation(() => {
    return 0
  })
  getOctokit.mock.mockImplementation(() => ({ request }))
  request.mock.mockImplementation(() =>
    Promise.resolve({
      data: {},
    })
  )

  await issue.createOrUpdateIssue(
    token,
    unreleasedCommitsData1,
    { number: '1' },
    'test-date'
  )
  const args = request.mock.calls.at(-1).arguments
  assert.strictEqual(args[0], 'PATCH /repos/{owner}/{repo}/issues/1')
  assert.strictEqual(args[1].owner, owner)
  assert.strictEqual(args[1].repo, repo)
  assert.strictEqual(typeof args[1].title, 'string')
  assert.strictEqual(typeof args[1].body, 'string')
})

test('Create issue body that contains commits shortened SHA identifiers', async () => {
  const create = mock.fn()
  exec.mock.mockImplementation(() => {
    return 0
  })
  getOctokit.mock.mockImplementation(() => ({ rest: { issues: { create } } }))
  create.mock.mockImplementation(() =>
    Promise.resolve({
      data: {
        number: 1,
      },
    })
  )

  await issue.createOrUpdateIssue(
    token,
    unreleasedCommitsData1,
    null,
    'test-date'
  )
  const args = create.mock.calls.at(-1).arguments
  assert.ok(
    args[0].body.includes(unreleasedCommitsData1[0].sha.substring(0, 7))
  )
})

test('Creates issue body that contains suggested semver release type', async () => {
  const create = mock.fn()
  exec.mock.mockImplementation(() => {
    return 0
  })
  getOctokit.mock.mockImplementation(() => ({ rest: { issues: { create } } }))
  create.mock.mockImplementation(() =>
    Promise.resolve({
      data: {
        number: 1,
      },
    })
  )
  await issue.createOrUpdateIssue(token, unreleasedCommitsData1)
  const args = create.mock.calls.at(-1).arguments
  assert.ok(
    args[0].body.includes(
      '<release-meta>{"semVerReleaseType":"minor"}</release-meta>'
    )
  )
})

test('Get closed notify', async () => {
  const request = mock.fn()

  request.mock.mockImplementation(() =>
    Promise.resolve({
      data: closedNotifyIssues,
    })
  )

  getOctokit.mock.mockImplementation(() => ({
    request,
  }))

  const latestRelease = new Date()
  const staleIssue = await issue.isSnoozed(token, latestRelease, Date.now())

  assert.deepEqual(request.mock.calls.at(-1).arguments, [
    `GET /repos/{owner}/{repo}/issues`,
    {
      owner,
      repo,
      creator: 'app/github-actions',
      state: 'closed',
      sort: 'created',
      state_reason: 'not_planned',
      direction: 'desc',
      labels: 'notify-release',
      since: latestRelease,
    },
  ])

  assert.strictEqual(staleIssue, false)

  const passedStaleDate = new Date('2000').getTime()
  const nonStaleIssue = await issue.isSnoozed(
    token,
    latestRelease,
    passedStaleDate
  )
  assert.strictEqual(nonStaleIssue, true)
})

test('', async () => {
  const request = mock.fn()

  request.mock.mockImplementation(() =>
    Promise.resolve({
      data: [],
    })
  )

  getOctokit.mock.mockImplementation(() => ({
    request,
  }))
  const latestRelease = new Date()
  const res = await issue.isSnoozed(token, latestRelease, Date.now())
  assert.strictEqual(res, false)
})

test('Creates a snooze issue when no pending', async () => {
  const create = mock.fn()
  getOctokit.mock.mockImplementation(() => ({ rest: { issues: { create } } }))
  create.mock.mockImplementation(() =>
    Promise.resolve({
      data: {
        number: 1,
      },
    })
  )

  exec.mock.mockImplementation(() => {
    return 0
  })

  await issue.createOrUpdateIssue(
    token,
    unreleasedCommitsData1,
    null,
    'test-date',
    'snooze'
  )
  assert.ok(create.mock.callCount() > 0)
})

test('Update a snooze issue when pending', async () => {
  const request = mock.fn()
  getOctokit.mock.mockImplementation(() => ({ request }))
  request.mock.mockImplementation(() =>
    Promise.resolve({
      data: {},
    })
  )

  await issue.createOrUpdateIssue(
    token,
    unreleasedCommitsData1,
    { number: '1' },
    'test-date',
    'snooze'
  )
  assert.ok(request.mock.callCount() > 0)
})

test('getIsSnoozingIssue returns true if the issue is closing as not_planned', () => {
  const mockedContext = {
    eventName: 'issues',
    payload: {
      issue: {
        number: 1,
        state: 'closed',
        state_reason: 'not_planned',
        labels: [{ name: 'notify-release' }],
      },
    },
  }

  const isSnoozingIssue = issue.getIsSnoozingIssue(mockedContext)

  assert.strictEqual(isSnoozingIssue, true)
})

test('getIsSnoozingIssue returns false if the issue is closing as complete', () => {
  const mockedContext = {
    eventName: 'issues',
    payload: {
      issue: {
        number: 1,
        state: 'closed',
        state_reason: 'complete',
        labels: [{ name: 'notify-release' }],
      },
    },
  }

  const isSnoozingIssue = issue.getIsSnoozingIssue(mockedContext)

  assert.strictEqual(isSnoozingIssue, false)
})

test('getIsSnoozingIssue returns false if the issue is closing without a notify-release label', () => {
  const mockedContext = {
    eventName: 'issues',
    payload: {
      issue: {
        number: 1,
        state: 'closed',
        state_reason: 'not_planned',
        labels: [],
      },
    },
  }

  const isSnoozingIssue = issue.getIsSnoozingIssue(mockedContext)

  assert.strictEqual(isSnoozingIssue, false)
})

test('getIsSnoozingIssue returns false if the issue is not closing', () => {
  const mockedContext = {
    eventName: 'workflow_dispatch',
    payload: {},
  }

  const isSnoozingIssue = issue.getIsSnoozingIssue(mockedContext)

  assert.strictEqual(isSnoozingIssue, false)
})

test('getIsClosingIssue returns true if the issue is closing', () => {
  const mockedContext = {
    eventName: 'issues',
    payload: {
      issue: {
        number: 1,
        state: 'closed',
        state_reason: 'complete',
        labels: [],
      },
    },
  }

  const isClosingIssue = issue.getIsClosingIssue(mockedContext)

  assert.strictEqual(isClosingIssue, true)
})

test('getIsClosingIssue returns false if the issue is not closing', () => {
  const mockedContext = {
    eventName: 'workflow_dispatch',
    payload: {},
  }

  const isClosingIssue = issue.getIsClosingIssue(mockedContext)

  assert.strictEqual(isClosingIssue, false)
})

test('Add a snoozing comment to a closing issue', async () => {
  const request = mock.fn()
  getOctokit.mock.mockImplementation(() => ({ request }))
  request.mock.mockImplementation(() =>
    Promise.resolve({
      data: {},
    })
  )

  const notifyAfter = '7 days'
  const notifyDate = getNotifyDate(notifyAfter)
  const issueNumber = 1

  await issue.addSnoozingComment(token, notifyAfter, issueNumber)

  assert.deepEqual(request.mock.calls.at(-1).arguments, [
    `POST /repos/{owner}/{repo}/issues/{issue_number}/comments`,
    {
      owner,
      repo,
      issue_number: 1,
      body: `This issue has been snoozed. A new issue will be opened for you on ${notifyDate}.`,
    },
  ])
})
