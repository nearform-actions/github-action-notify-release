'use strict'
const github = require('@actions/github')

async function getLatestRelease(token) {
  const octokit = github.getOctokit(token)
  const { owner, repo } = github.context.repo

  const { data } = await octokit.rest.repos.getLatestRelease({
    owner,
    repo,
  })

  return data
}

async function getUnreleasedCommits(token, latestReleaseDate) {
  const octokit = github.getOctokit(token)
  const { owner, repo } = github.context.repo

  const { data } = await octokit.request(`GET /repos/{owner}/{repo}/commits`, {
    owner,
    repo,
    since: latestReleaseDate,
  })

  return data
}

module.exports = {
  getLatestRelease,
  getUnreleasedCommits,
}
