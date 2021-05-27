'use strict'
const core = require('@actions/core')
const { logInfo } = require('./log')

const { runAction } = require('./release-notify-action')

async function run() {
  try {
    const token = core.getInput('github-token', { required: true })
    const staleDays = Number(core.getInput('stale-days'))
    const commitMessageLines = Number(core.getInput('commit-messages-lines'))

    return await runAction(token, staleDays, commitMessageLines)
  } catch (error) {
    logInfo(error.message)
    core.setFailed(error.message)
  }
}

run()
