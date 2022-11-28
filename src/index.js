'use strict'
const core = require('@actions/core')
const toolkit = require('actions-toolkit')
const { parseNotificationSettings } = require('./time-utils.js')
const { runAction } = require('./release-notify-action')

async function run() {
  toolkit.logActionRefWarning()

  const token = core.getInput('github-token', { required: true })
  const notifyAfter = parseNotificationSettings(core)
  const commitMessageLines = Number(core.getInput('commit-messages-lines'))

  await runAction(token, notifyAfter, commitMessageLines)
}

run().catch((err) => core.setFailed(err))
