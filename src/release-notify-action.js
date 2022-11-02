'use strict'

const { logInfo, logWarning } = require('./log')
const { getLatestRelease, getUnreleasedCommits } = require('./release')
const {
  createOrUpdateIssue,
  getLastOpenPendingIssue,
  closeIssue,
  getClosedNotifyIssues,
} = require('./issue')
const { isCommitStale, isClosedNotifyIssueStale } = require('./time-utils.js')

async function runAction(token, staleDate, commitMessageLines) {
  let latestRelease

  try {
    latestRelease = await getLatestRelease(token)
  } catch (err) {
    return logWarning('Could not find latest release')
  }

  logInfo(`Latest release:
  - name:${latestRelease.name}
  - published:${latestRelease.published_at}
  - tag:${latestRelease.tag_name}
  - author:${latestRelease.author.login}
`)

  const pendingIssue = await getLastOpenPendingIssue(token)

  const unreleasedCommits = await getUnreleasedCommits(
    token,
    latestRelease.published_at
  )

  const closedNotifyIssues = await getClosedNotifyIssues(
    token,
    latestRelease.published_at
  )

  if (isClosedNotifyIssueStale(closedNotifyIssues, staleDate)) {
    return createOrUpdateIssue(
      token,
      unreleasedCommits,
      pendingIssue,
      latestRelease,
      commitMessageLines,
      true
    )
  }

  if (
    !closedNotifyIssues?.length &&
    isCommitStale(unreleasedCommits, staleDate)
  ) {
    return createOrUpdateIssue(
      token,
      unreleasedCommits,
      pendingIssue,
      latestRelease,
      commitMessageLines
    )
  }

  logInfo('No stale commits or stale notify issue found')

  if (
    pendingIssue &&
    Date.parse(latestRelease.published_at) > Date.parse(pendingIssue.updated_at)
  ) {
    return closeIssue(token, pendingIssue.number)
  }
}

module.exports = {
  runAction,
}
