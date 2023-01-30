'use strict'
const core = require('@actions/core')
const toolkit = require('actions-toolkit')
const { context } = require('@actions/github')
const { parseNotifyAfter } = require('./time-utils.js')
const { runAction } = require('./release-notify-action')

async function run() {
  toolkit.logActionRefWarning()

  const token = core.getInput('github-token', { required: true })

  const notifyAfter = parseNotifyAfter(
    core.getInput('notify-after'),
    core.getInput('stale-days')
  )

  const isClosingIssue = context.eventName === 'closed'
  if (isClosingIssue) {
    console.log('eventName: ', context.eventName)
    console.log('context: ', context)
    return
  }

  const commitMessageLines = Number(core.getInput('commit-messages-lines'))

  await runAction(token, notifyAfter, commitMessageLines)
}

run().catch((err) => core.setFailed(err))
