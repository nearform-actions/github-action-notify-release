'use strict'

const { logInfo, logWarning } = require('./log')
const { tryGetLatestRelease, tryGetUnreleasedCommits } = require('./release')
const {
  createOrUpdateIssue,
  getLastOpenPendingIssue,
  closeIssue,
  tryGetClosedNotifyIssues,
} = require('./issue')
const { isClosedNotifyIssueStale } = require('./time-utils.js')

async function runAction(token, staleDate, commitMessageLines) {
  const latestRelease = await tryGetLatestRelease(token)

  if (!latestRelease) return logWarning('No latest release found')

  logInfo(`Latest release:
  - name:${latestRelease.name}
  - published:${latestRelease.published_at}
  - tag:${latestRelease.tag_name}
  - author:${latestRelease.author.login}
`)

  const closedNotifyIssues = await tryGetClosedNotifyIssues(
    token,
    latestRelease.published_at
  )

  // exit if there is a closed notify issue but stale days have not passed
  if (
    closedNotifyIssues?.length &&
    !isClosedNotifyIssueStale(closedNotifyIssues, staleDate)
  ) {
    return logInfo('Non stale closed notify issue found')
  }

  const pendingIssue = await getLastOpenPendingIssue(token)

  const unreleasedCommits = await tryGetUnreleasedCommits(
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
