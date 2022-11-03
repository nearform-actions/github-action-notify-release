'use strict'
const github = require('@actions/github')
const { isCommitStale } = require('./time-utils.js')

async function tryGetLatestRelease(token) {
  try {
    const octokit = github.getOctokit(token)
    const { owner, repo } = github.context.repo

    const { data } = await octokit.rest.repos.getLatestRelease({
      owner,
      repo,
    })

    return data
  } catch (error) {
    return
  }
}

async function tryGetUnreleasedCommits(token, latestReleaseDate, staleDate) {
  const octokit = github.getOctokit(token)
  const { owner, repo } = github.context.repo

  const { data: unreleasedCommits } = await octokit.request(
    `GET /repos/{owner}/{repo}/commits`,
    {
      owner,
      repo,
      since: latestReleaseDate,
    }
  )
  return isCommitStale(unreleasedCommits, staleDate) ? unreleasedCommits : []
}

module.exports = {
  tryGetLatestRelease,
  tryGetUnreleasedCommits,
}
