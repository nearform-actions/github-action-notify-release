'use strict'
const core = require('@actions/core')

const { runAction } = require('./release-notify-action')

const actionRef = process.env.GITHUB_ACTION_REF

async function run() {
  if (actionRef === 'main' || actionRef === 'master') {
    core.warning(
      `nearform/github-action-notify-release is pinned at HEAD. We strongly ` +
        `advise against pinning to "@master" as it may be unstable. Please ` +
        `update your GitHub Action YAML from:\n\n` +
        `    uses: 'nearform/github-action-notify-release@master'\n\n` +
        `to:\n\n` +
        `    uses: 'nearform/github-action-notify-release@<release/tag version>'\n\n` +
        `Alternatively, you can pin to any git tag or git SHA in the ` +
        `repository.`
    )
  }
  const token = core.getInput('github-token', { required: true })
  const staleDays = Number(core.getInput('stale-days'))
  const commitMessageLines = Number(core.getInput('commit-messages-lines'))

  await runAction(token, staleDays, commitMessageLines)
}

run().catch((err) => core.setFailed(err))
