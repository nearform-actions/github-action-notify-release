'use strict'
const github = require('@actions/github')

async function getLatestRelease(token) {
  try {
    const octokit = github.getOctokit(token)
    const { owner, repo } = github.context.repo

    const { data } = await octokit.rest.repos.getLatestRelease({
      owner,
      repo,
    })
    return data
  } catch (error) {
    // no release found
  }
}

module.exports = {
  getLatestRelease,
}
