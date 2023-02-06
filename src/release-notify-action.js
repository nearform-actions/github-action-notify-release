'use strict'

const { logInfo, logWarning } = require('./log')
const { groupCommits, getUnreleasedCommits } = require('./commit')
const { getLatestRelease } = require('./release')
const {
  createOrUpdateIssue,
  getLastOpenPendingIssue,
  closeIssue,
  isSnoozed,
} = require('./issue')
const { notifyAfterToMs } = require('./utils/time')

async function runAction(token, notifyAfter, commitMessageLines) {
  const latestRelease = await getLatestRelease(token)

  if (!latestRelease) {
    return logWarning('No latest release found')
  }

  logInfo(`Latest release:
  - name:${latestRelease.name}
  - published:${latestRelease.published_at}
  - tag:${latestRelease.tag_name}
  - author:${latestRelease.author.login}
`)

  const notifyDate = notifyAfterToMs(notifyAfter)

  const snoozed = await isSnoozed(token, latestRelease.published_at, notifyDate)

  if (snoozed) {
    return logInfo('Release notify has been snoozed')
  }

  const pendingIssue = await getLastOpenPendingIssue(token)

  const unreleasedCommits = await getUnreleasedCommits(
    token,
    latestRelease.published_at,
    notifyDate
  )

  if (unreleasedCommits.length) {
    const groupedUnreleasedCommits = await groupCommits(
      token,
      unreleasedCommits
    )

    return createOrUpdateIssue(
      token,
      groupedUnreleasedCommits,
      pendingIssue,
      latestRelease,
      commitMessageLines,
      notifyAfter
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
