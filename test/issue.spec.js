'use strict'

const { getOctokit } = require('@actions/github')
const issue = require('../src/issue')
const { getNotifyDate } = require('../src/time-utils')

const { unreleasedCommitsData1, closedNotifyIssues } = require('./testData')

const token = 'dummytoken'
const owner = 'sameer'
const repo = 'testrepo'

jest.mock('../src/log', () => ({
  logInfo: jest.fn(),
}))

jest.mock('@actions/github', () => ({
  getOctokit: jest.fn(),
  context: { repo: { owner, repo } },
}))

test('Creates an issue', async () => {
  getOctokit.mockReturnValue({
    rest: { issues: { create: async () => ({ data: { number: 9 } }) } },
  })
  const issueBody = 'issue has been created with pending commits'

  const issueResponse = await issue.createIssue(token, issueBody)
  expect(issueResponse.data.number).toStrictEqual(9)
})

test('Throws if something went wrong in creating an issue', async () => {
  getOctokit.mockImplementation(() => null)
  const issueBody = 'issue has been created with pending commits'

  await expect(issue.createIssue(token, issueBody)).rejects.toThrow()
})

test('Updates an issue', async () => {
  getOctokit.mockReturnValue({
    request: async () => ({ data: [{ number: 9 }] }),
  })
  const issueTitle = 'Release pending!'
  const issueNo = 9
  const issueBody = 'issue has been updated with pending commits'

  const updatedIssue = await issue.updateLastOpenPendingIssue(
    token,
    issueTitle,
    issueBody,
    issueNo
  )
  expect(updatedIssue.number).toStrictEqual(9)
})

test('Updates an issue', async () => {
  getOctokit.mockReturnValue({ request: async () => ({ data: [] }) })
  const issueTitle = 'Release pending!'
  const issueNo = 9
  const issueBody = 'issue has been updated with pending commits'

  const updatedIssue = await issue.updateLastOpenPendingIssue(
    token,
    issueTitle,
    issueBody,
    issueNo
  )
  expect(updatedIssue).toStrictEqual(null)
})

test('Gets last open pending issue', async () => {
  const latestReleaseDate = 'test date'
  getOctokit.mockReturnValue({
    request: async () => ({ data: [{ number: 9 }] }),
  })

  const pendingIssue = await issue.getLastOpenPendingIssue(
    token,
    latestReleaseDate
  )
  expect(pendingIssue.number).toStrictEqual(9)
})

test('Get last open pending issue returns invalid result', async () => {
  const latestReleaseDate = 'test date'
  getOctokit.mockReturnValue({ request: async () => ({ data: [] }) })

  const pendingIssue = await issue.getLastOpenPendingIssue(
    token,
    latestReleaseDate
  )
  expect(pendingIssue).toStrictEqual(null)
})

test('Close an issue', async () => {
  const request = jest.fn()
  getOctokit.mockReturnValue({ request })

  await issue.closeIssue(token, '1')
  expect(request).toHaveBeenCalledWith('PATCH /repos/{owner}/{repo}/issues/1', {
    owner,
    repo,
    state: 'closed',
  })
})

test('Create an issue when no existing issue exists', async () => {
  const create = jest.fn()
  getOctokit.mockReturnValue({ rest: { issues: { create } } })
  create.mockResolvedValue({
    data: {
      number: 1,
    },
  })

  await issue.createOrUpdateIssue(
    token,
    unreleasedCommitsData1,
    null,
    'test-date'
  )
  expect(create).toHaveBeenCalled()
})

test('Update an issue when exists', async () => {
  const request = jest.fn()
  getOctokit.mockReturnValue({ request })
  request.mockResolvedValue({
    data: {},
  })

  await issue.createOrUpdateIssue(
    token,
    unreleasedCommitsData1,
    { number: '1' },
    'test-date'
  )
  expect(request).toHaveBeenCalledWith('PATCH /repos/{owner}/{repo}/issues/1', {
    owner,
    repo,
    title: expect.any(String),
    body: expect.any(String),
  })
})

test('Create issue body that contains commits shortened SHA identifiers', async () => {
  const create = jest.fn()
  getOctokit.mockReturnValue({ rest: { issues: { create } } })
  create.mockResolvedValue({
    data: {
      number: 1,
    },
  })

  await issue.createOrUpdateIssue(
    token,
    unreleasedCommitsData1,
    null,
    'test-date'
  )
  expect(create).toHaveBeenCalledWith(
    expect.objectContaining({
      body: expect.stringContaining(
        unreleasedCommitsData1[0].sha.substring(0, 7)
      ),
    })
  )
})

test('Get closed notify', async () => {
  const request = jest.fn()

  request.mockResolvedValue({
    data: closedNotifyIssues,
  })

  getOctokit.mockReturnValue({
    request,
  })

  const latestRelease = new Date()
  const staleIssue = await issue.isSnoozed(token, latestRelease, Date.now())

  expect(request).toHaveBeenCalledWith(`GET /repos/{owner}/{repo}/issues`, {
    owner,
    repo,
    creator: 'app/github-actions',
    state: 'closed',
    sort: 'created',
    state_reason: 'not_planned',
    direction: 'desc',
    labels: 'notify-release',
    since: latestRelease,
  })

  expect(staleIssue).toBe(false)

  const passedStaleDate = new Date('2000').getTime()
  const nonStaleIssue = await issue.isSnoozed(
    token,
    latestRelease,
    passedStaleDate
  )
  expect(nonStaleIssue).toBe(true)
})

test('', async () => {
  const request = jest.fn()

  request.mockResolvedValue({
    data: [],
  })

  getOctokit.mockReturnValue({
    request,
  })
  const latestRelease = new Date()
  const res = await issue.isSnoozed(token, latestRelease, Date.now())
  expect(res).toBe(false)
})

test('Creates a snooze issue when no pending', async () => {
  const create = jest.fn()
  getOctokit.mockReturnValue({ rest: { issues: { create } } })
  create.mockResolvedValue({
    data: {
      number: 1,
    },
  })

  await issue.createOrUpdateIssue(
    token,
    unreleasedCommitsData1,
    null,
    'test-date',
    'snooze'
  )
  expect(create).toHaveBeenCalled()
})

test('Update a snooze issue when pending', async () => {
  const request = jest.fn()
  getOctokit.mockReturnValue({ request })
  request.mockResolvedValue({
    data: {},
  })

  await issue.createOrUpdateIssue(
    token,
    unreleasedCommitsData1,
    { number: '1' },
    'test-date',
    'snooze'
  )
  expect(request).toHaveBeenCalled()
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

  expect(isSnoozingIssue).toEqual(true)
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

  expect(isSnoozingIssue).toEqual(false)
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

  expect(isSnoozingIssue).toEqual(false)
})

test('getIsSnoozingIssue returns false if the issue is not closing', () => {
  const mockedContext = {
    eventName: 'workflow_dispatch',
    payload: {},
  }

  const isSnoozingIssue = issue.getIsSnoozingIssue(mockedContext)

  expect(isSnoozingIssue).toEqual(false)
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

  expect(isClosingIssue).toEqual(true)
})

test('getIsClosingIssue returns false if the issue is not closing', () => {
  const mockedContext = {
    eventName: 'workflow_dispatch',
    payload: {},
  }

  const isClosingIssue = issue.getIsClosingIssue(mockedContext)

  expect(isClosingIssue).toEqual(false)
})

test('Add a snoozing comment to a closing issue', async () => {
  const request = jest.fn()
  getOctokit.mockReturnValue({ request })
  request.mockResolvedValue({
    data: {},
  })

  const notifyAfter = '7 days'
  const notifyDate = getNotifyDate(notifyAfter)
  const issueNumber = 1

  await issue.addSnoozingComment(token, notifyAfter, issueNumber)

  expect(request).toHaveBeenCalledWith(
    `POST /repos/{owner}/{repo}/issues/{issue_number}/comments`,
    {
      owner,
      repo,
      issue_number: 1,
      body: `This issue has been snoozed. A new issue will be opened for you on ${notifyDate}.`,
    }
  )
})
