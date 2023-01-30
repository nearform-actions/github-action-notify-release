'use strict'
const core = require('@actions/core')
const toolkit = require('actions-toolkit')
const { context } = require('@actions/github')
const { parseNotifyAfter } = require('./time-utils.js')
const { runAction } = require('./release-notify-action')
const { getClosingIssueDetails, addComment } = require('./issue.js')

async function run() {
  toolkit.logActionRefWarning()

  const token = core.getInput('github-token', { required: true })

  const notifyAfter = parseNotifyAfter(
    core.getInput('notify-after'),
    core.getInput('stale-days')
  )

  const {
    isClosing,
    isNotifyReleaseIssue,
    stateClosedNotPlanned,
    issueNumber,
  } = getClosingIssueDetails(context)
  if (isClosing && isNotifyReleaseIssue && stateClosedNotPlanned) {
    await addComment(token, notifyAfter, issueNumber)
    return
  } else if (isClosing) {
    return
  }

  const commitMessageLines = Number(core.getInput('commit-messages-lines'))

  await runAction(token, notifyAfter, commitMessageLines)
}

run().catch((err) => core.setFailed(err))
