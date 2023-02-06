'use strict'
const core = require('@actions/core')
const toolkit = require('actions-toolkit')
const { context } = require('@actions/github')
const { parseNotifyAfter } = require('./utils/time-utils.js')
const { runAction } = require('./release-notify-action')
const {
  getIsSnoozingIssue,
  getIsClosingIssue,
  addSnoozingComment,
} = require('./issue.js')
const { logInfo } = require('./log.js')

async function run({ inputs }) {
  try {
    toolkit.logActionRefWarning()
    toolkit.logRepoWarning()

    const token = inputs['github-token']

    const notifyAfter = parseNotifyAfter(
      inputs['notify-after'],
      inputs['stale-days']
    )

    const isSnoozing = getIsSnoozingIssue(context)

    if (isSnoozing) {
      logInfo('Snoozing issue ...')
      const { number } = context.issue
      return addSnoozingComment(token, notifyAfter, number)
    }

    const isClosing = getIsClosingIssue(context)
    if (isClosing) {
      logInfo('Closing issue. Nothing to do ...')
      return
    }

    logInfo('Workflow dispatched or release published ...')
    const commitMessageLines = Number(inputs['commit-messages-lines'])
    await runAction(token, notifyAfter, commitMessageLines)
  } catch (err) {
    core.setFailed(err)
  }
}

module.exports = {
  run,
}
