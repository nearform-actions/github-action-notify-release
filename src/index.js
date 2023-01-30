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

  const { isClosing, issueId } = getClosingIssueDetails(context)
  console.log('isClosing: ', isClosing)
  console.log('issueId: ', issueId)
  if (isClosing) {
    await addComment(token, notifyAfter, issueId)
    return
  }

  const commitMessageLines = Number(core.getInput('commit-messages-lines'))

  await runAction(token, notifyAfter, commitMessageLines)
}

run().catch((err) => core.setFailed(err))
