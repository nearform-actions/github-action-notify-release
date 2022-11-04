'use strict'

const { getOctokit } = require('@actions/github')

const issue = require('../src/issue')

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
    'test-date',
    1
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

  await issue.createOrUpdateIssue(
    token,
    unreleasedCommitsData1,
    null,
    'test-date',
    1
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
  const staleDate = Date.now()
  const latestRelease = new Date()
  const res = await issue.closedSnoozeIssue(token, latestRelease, staleDate)

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

  expect(res).toBe(true)
})

test('Not closed notify issue return true', async () => {
  const request = jest.fn()

  request.mockResolvedValue({
    data: [],
  })

  getOctokit.mockReturnValue({
    request,
  })
  const staleDate = Date.now()
  const latestRelease = new Date()
  const res = await issue.closedSnoozeIssue(token, latestRelease, staleDate)
  expect(res).toBe(true)
})

test('Creates a snooze issue when no pending', async () => {
  const create = jest.fn()
  getOctokit.mockReturnValue({ rest: { issues: { create } } })

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
