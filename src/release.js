'use strict'
const github = require('@actions/github')
const { isSomeCommitStale } = require('./time-utils.js')

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

async function getUnreleasedCommits(token, latestReleaseDate, notifyDate) {
  const octokit = github.getOctokit(token)
  const { owner, repo } = github.context.repo

  const { data } = await octokit.request(`GET /repos/{owner}/{repo}/commits`, {
    owner,
    repo,
    since: latestReleaseDate,
  })

  const unreleasedCommits = isSomeCommitStale(data, notifyDate) ? data : []

  const commits = sanitizeCommitMessage(unreleasedCommits)

  return commits
}

function sanitizeCommitMessage(commits) {
  return commits.map((commit) => {
    commit.commit.message = commit.commit.message
      .replace(/\n/g, '') // removes new line characters
      .replace(/\s+/g, ' ') // removes additional space characters
    return commit
  })
}

module.exports = {
  getLatestRelease,
  getUnreleasedCommits,
}
