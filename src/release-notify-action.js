'use strict'

const { logInfo, logWarning } = require('./log')
const { getLatestRelease, getUnreleasedCommits } = require('./release')
const {
  createOrUpdateIssue,
  getLastOpenPendingIssue,
  closeIssue,
  getLastClosedNotifyIssue,
  createSnoozeIssue,
} = require('./issue')

async function runAction(token, staleDays, commitMessageLines) {
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

  const closedNotifyIssue = await getLastClosedNotifyIssue(
    token,
    latestRelease.published_at,
    staleDays
  )

  if (closedNotifyIssue) {
    const issueNo = await createSnoozeIssue(
      token,
      unreleasedCommits,
      latestRelease
    )
    logInfo(`Snooze issue has been created. Issue No. - ${issueNo}`)
  }

  const pendingIssue = await getLastOpenPendingIssue(token)

  const unreleasedCommits = await getUnreleasedCommits(
    token,
    latestRelease.published_at,
    staleDays
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

  logInfo('No pending commits found')

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
