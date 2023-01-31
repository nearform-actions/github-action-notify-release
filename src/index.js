'use strict'
const core = require('@actions/core')
const toolkit = require('actions-toolkit')
const { context } = require('@actions/github')
const { parseNotifyAfter } = require('./time-utils.js')
const { runAction } = require('./release-notify-action')
const { getIsSnoozingIssue, addSnoozingComment } = require('./issue.js')
const { logInfo } = require('./log.js')

async function run() {
  toolkit.logActionRefWarning()
  toolkit.logRepoWarning()

  const token = core.getInput('github-token', { required: true })

  const notifyAfter = parseNotifyAfter(
    core.getInput('notify-after'),
    core.getInput('stale-days')
  )

  const isSnoozing = getIsSnoozingIssue(context)

  if (isSnoozing) {
    logInfo('Snoozing issue ...')
    const { number } = context.issue
    return addSnoozingComment(token, notifyAfter, number)
  }

  logInfo('Workflow dispatched or release published ...')
  const commitMessageLines = Number(core.getInput('commit-messages-lines'))
  await runAction(token, notifyAfter, commitMessageLines)
}

run().catch((err) => core.setFailed(err))
