'use strict'
const github = require('@actions/github')
const { logInfo } = require('./log')
const { isStale, getNotifyDate } = require('./time-utils.js')
const fs = require('fs')
const path = require('path')
const util = require('util')
const { promisify } = require('util')
const readFile = promisify(fs.readFile)
const handlebars = require('handlebars')
const {
  STATE_OPEN,
  ISSUE_TITLE,
  STATE_CLOSED,
  ISSUE_LABEL,
  ISSUES_EVENT_NAME,
  STATE_CLOSED_NOT_PLANNED,
} = require('./constants.js')

const { execWithOutput } = require('./utils/execWithOutput')

const conventionalCommitsConfig = require('conventional-changelog-monorepo/conventional-changelog-conventionalcommits')
const conventionalRecommendedBump = require('conventional-changelog-monorepo/conventional-recommended-bump')

const conventionalRecommendedBumpAsync = util.promisify(
  conventionalRecommendedBump
)
function registerHandlebarHelpers(config) {
  const { commitMessageLines } = config
  handlebars.registerHelper('commitMessage', function (content) {
    if (!commitMessageLines || commitMessageLines < 0) {
      return content
    }
    return content.split('\n').slice(0, commitMessageLines).join('\n').trim()
  })
  handlebars.registerHelper('substring', function (content, characters) {
    return (content || '').substring(0, characters)
  })
}

async function renderIssueBody(data) {
  const templateFilePath = path.resolve(__dirname, 'issue.template.hbs')
  const templateStringBuffer = await readFile(templateFilePath)
  const template = handlebars.compile(templateStringBuffer.toString())
  return template(data)
}

async function createIssue(token, issueBody) {
  const octokit = github.getOctokit(token)

  return octokit.rest.issues.create({
    ...github.context.repo,
    title: ISSUE_TITLE,
    body: issueBody,
    labels: [ISSUE_LABEL],
  })
}

async function getLastOpenPendingIssue(token) {
  const octokit = github.getOctokit(token)
  const { owner, repo } = github.context.repo

  const pendingIssues = await octokit.request(
    `GET /repos/{owner}/{repo}/issues`,
    {
      owner,
      repo,
      creator: 'app/github-actions',
      state: STATE_OPEN,
      sort: 'created',
      direction: 'desc',
      labels: ISSUE_LABEL,
    }
  )

  return pendingIssues.data.length ? pendingIssues.data[0] : null
}

async function updateLastOpenPendingIssue(token, issueBody, issueNo) {
  const octokit = github.getOctokit(token)
  const { owner, repo } = github.context.repo

  const updatedIssue = await octokit.request(
    `PATCH /repos/{owner}/{repo}/issues/${issueNo}`,
    {
      owner,
      repo,
      title: ISSUE_TITLE,
      body: issueBody,
    }
  )

  return updatedIssue.data.length ? updatedIssue.data[0] : null
}

async function getAutoBumpedVersion(baseTag) {
  await execWithOutput('git', ['fetch', '--unshallow']) // by default optic does a shallow clone so we need to do this to get full commit history
  await execWithOutput('git', ['fetch', '--tags'])

  const tag =
    baseTag ||
    (await execWithOutput('git', ['tag', '--sort=-creatordate'])).split('\n')[0]

  logInfo(`Using ${tag} as base release tag for version bump`)

  const { releaseType = 'patch' } = await conventionalRecommendedBumpAsync({
    baseTag: tag,
    config: conventionalCommitsConfig,
  })
  logInfo(`Auto generated release type is ${JSON.stringify(releaseType)}`)
  return releaseType
}

async function createOrUpdateIssue(
  token,
  unreleasedCommits,
  pendingIssue,
  latestRelease,
  commitMessageLines,
  notifyAfter
) {
  registerHandlebarHelpers({
    commitMessageLines,
  })

  const newVersion = await getAutoBumpedVersion()

  const issueBody = await renderIssueBody({
    commits: unreleasedCommits,
    latestRelease,
    notifyAfter,
    newVersion,
  })

  if (pendingIssue) {
    await updateLastOpenPendingIssue(token, issueBody, pendingIssue.number)
    logInfo(`Issue ${pendingIssue.number} has been updated`)
  } else {
    const { data } = await createIssue(token, issueBody)
    const { number: issueNo } = data
    logInfo(`New issue has been created. Issue No. - ${issueNo}`)
  }
}

async function closeIssue(token, issueNo) {
  const octokit = github.getOctokit(token)
  const { owner, repo } = github.context.repo

  await octokit.request(`PATCH /repos/{owner}/{repo}/issues/${issueNo}`, {
    owner,
    repo,
    state: STATE_CLOSED,
  })
  logInfo(`Closed issue no. - ${issueNo}`)
}

async function isSnoozed(token, latestReleaseDate, notifyDate) {
  const octokit = github.getOctokit(token)
  const { owner, repo } = github.context.repo
  const { data: closedNotifyIssues } = await octokit.request(
    `GET /repos/{owner}/{repo}/issues`,
    {
      owner,
      repo,
      creator: 'app/github-actions',
      state: STATE_CLOSED,
      sort: 'created',
      state_reason: 'not_planned',
      direction: 'desc',
      labels: ISSUE_LABEL,
      since: latestReleaseDate,
    }
  )

  if (!closedNotifyIssues?.length) {
    return false
  }

  return !isStale(closedNotifyIssues[0].closed_at, notifyDate)
}

function getIsSnoozingIssue(context) {
  const { eventName, payload } = context
  const { issue } = payload

  if (!issue) {
    return false
  }

  const { state, state_reason: stateReason, labels } = issue

  const isClosing = eventName === ISSUES_EVENT_NAME && state === STATE_CLOSED
  const stateClosedNotPlanned = stateReason === STATE_CLOSED_NOT_PLANNED
  const isNotifyReleaseIssue = labels.some(
    (label) => label.name === ISSUE_LABEL
  )

  const isSnoozingIssue =
    isClosing && stateClosedNotPlanned && isNotifyReleaseIssue
  return isSnoozingIssue
}

function getIsClosingIssue(context) {
  const { eventName, payload } = context
  const { issue } = payload

  if (!issue) {
    return false
  }

  const { state } = issue

  const isClosing = eventName === ISSUES_EVENT_NAME && state === STATE_CLOSED

  return isClosing
}

async function addSnoozingComment(token, notifyAfter, issueNumber) {
  logInfo('Adding a snoozing comment to the issue.')

  const notifyDate = getNotifyDate(notifyAfter)

  const octokit = github.getOctokit(token)
  const { owner, repo } = github.context.repo

  await octokit.request(
    `POST /repos/{owner}/{repo}/issues/{issue_number}/comments`,
    {
      owner,
      repo,
      issue_number: issueNumber,
      body: `This issue has been snoozed. A new issue will be opened for you on ${notifyDate}.`,
    }
  )

  logInfo('Snoozing comment added to the issue.')
}

module.exports = {
  createIssue,
  getLastOpenPendingIssue,
  updateLastOpenPendingIssue,
  createOrUpdateIssue,
  closeIssue,
  isSnoozed,
  getIsSnoozingIssue,
  getIsClosingIssue,
  addSnoozingComment,
}
