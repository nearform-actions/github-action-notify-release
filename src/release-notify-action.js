'use strict'

const { logInfo } = require('./log')
const { getLatestRelease, getUnreleasedCommits } = require('./release')
const {
  createOrUpdateIssue,
  getLastOpenPendingIssue,
  closeIssue,
  isSnoozed,
} = require('./issue')

async function runAction(token, staleDate, commitMessageLines) {
  const latestRelease = await getLatestRelease(token)

  if (!latestRelease) {
    return
  }

  logInfo(`Latest release:
  - name:${latestRelease.name}
  - published:${latestRelease.published_at}
  - tag:${latestRelease.tag_name}
  - author:${latestRelease.author.login}
`)

  const snoozed = await isSnoozed(token, latestRelease.published_at, staleDate)

  if (snoozed) {
    return logInfo('Release notify has been snoozed')
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
