'use strict'
const core = require('@actions/core')
const toolkit = require('actions-toolkit')
const { staleDaysToMs } = require('./time-utils.js')
const { runAction } = require('./release-notify-action')

async function run() {
  toolkit.logActionRefWarning()

  const token = core.getInput('github-token', { required: true })
  const staleDate = staleDaysToMs(core.getInput('stale-days'))
  const commitMessageLines = Number(core.getInput('commit-messages-lines'))

  await runAction(token, staleDate, commitMessageLines)
}

run().catch((err) => core.setFailed(err))
