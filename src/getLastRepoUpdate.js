'use strict'

const core = require('@actions/core')
const github = require('@actions/github')
const { logInfo } = require('./log')

async function getLastRepoUpdate() {
  try {
    const token = core.getInput('github-token', { required: true })
    const octokit = github.getOctokit(token)

    const { data: { updated_at } } = await octokit.rest.repos.get({
      owner: 'estherixz',
      repo: 'github-action-notify-release',
    });

    const lastUpdate = new Date(updated_at)

    logInfo(`Last repo update ${lastUpdate}`)

    return lastUpdate
  } catch (error) {
    core.setFailed(error.message)
  }
}

exports.getLastRepoUpdate = getLastRepoUpdate
