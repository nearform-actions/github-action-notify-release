'use strict'

const core = require('@actions/core')
const github = require('@actions/github')
const { logInfo } = require('./log')

async function createIssue(daysSinceRelease) {
  try {
    const token = core.getInput('github-token', { required: true })
    const octokit = github.getOctokit(token)

    await octokit.issues.create({
      ...github.context.repo,
      title: 'Pending release!',
      body: `It has been ${daysSinceRelease} days since the last release, please publish latest changes to npm`,
    })

    logInfo('New issue has been created')
  } catch (error) {
    core.setFailed(error.message)
  }
}

exports.createIssue = createIssue
