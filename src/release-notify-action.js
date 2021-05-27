'use strict'

const { logInfo } = require('./log')
const { getLatestRelease, getUnreleasedCommits } = require('./release')
const {
  createOrUpdateIssue,
  getLastOpenPendingIssue,
  closeIssue,
} = require('./issue')

async function runAction(token, staleDays, commitMessageLines) {
  const latestRelease = await getLatestRelease(token)

  if (!latestRelease) {
    return logInfo('Could not find latest release')
  }

  logInfo(`Latest release - name:${latestRelease.name}, published:${latestRelease.published_at},
Tag:${latestRelease.tag_name}, author:${latestRelease.author.login}`)

  let pendingIssue = await getLastOpenPendingIssue(token)
  const unreleasedCommits = await getUnreleasedCommits(
    token,
    latestRelease.published_at,
    staleDays
  )

  if (unreleasedCommits.length) {
    await createOrUpdateIssue(
      token,
      unreleasedCommits,
      pendingIssue,
      latestRelease,
      commitMessageLines
    )
  } else {
    logInfo('No pending commits found')
    if (
      pendingIssue &&
      Date.parse(latestRelease.published_at) >
        Date.parse(pendingIssue.updated_at)
    ) {
      await closeIssue(token, pendingIssue.number)
    }
  }
}

module.exports = {
  runAction,
}
