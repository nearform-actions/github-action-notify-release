'use strict'

const { logInfo, logWarning } = require('./log')
const { getLatestRelease, getUnreleasedCommits } = require('./release')
const {
  createOrUpdateIssue,
  getLastOpenPendingIssue,
  closeIssue,
  getClosedNotifyIssues,
} = require('./issue')
const { isClosedNotifyIssueStale } = require('./time-utils.js')

async function runAction(token, staleDate, commitMessageLines) {
  const latestRelease = await getLatestRelease(token)

  if (!latestRelease) return logWarning('Could not find latest release')

  logInfo(`Latest release:
  - name:${latestRelease.name}
  - published:${latestRelease.published_at}
  - tag:${latestRelease.tag_name}
  - author:${latestRelease.author.login}
`)

  const closedNotifyIssues = await getClosedNotifyIssues(
    token,
    latestRelease.published_at
  )

  if (
    closedNotifyIssues?.length &&
    !isClosedNotifyIssueStale(closedNotifyIssues, staleDate)
  ) {
    return
  }

  const pendingIssue = await getLastOpenPendingIssue(token)

  const unreleasedCommits = await getUnreleasedCommits(
    token,
    latestRelease.published_at,
    staleDate
  )

  if (unreleasedCommits.length) {
    return createOrUpdateIssue(
      token,
      unreleasedCommits,
      pendingIssue,
      latestRelease,
      commitMessageLines
    )
  }

  logInfo('No stale commits or stale closed notify issue found')

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
