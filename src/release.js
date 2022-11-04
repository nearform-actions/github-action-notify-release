'use strict'
const github = require('@actions/github')
const { isSomeCommitStale } = require('./time-utils.js')

async function getLatestRelease(token) {
  const octokit = github.getOctokit(token)
  const { owner, repo } = github.context.repo

  const { data } = await octokit.rest.repos.getLatestRelease({
    owner,
    repo,
  })

  return data
}

async function getUnreleasedCommits(token, latestReleaseDate, staleDate) {
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
  return isSomeCommitStale(unreleasedCommits, staleDate)
    ? unreleasedCommits
    : []
}

module.exports = {
  getLatestRelease,
  getUnreleasedCommits,
}
