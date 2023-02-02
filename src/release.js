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

  const { data: unreleasedCommits } = await octokit.request(
    `GET /repos/{owner}/{repo}/commits`,
    {
      owner,
      repo,
      since: latestReleaseDate,
    }
  )

  return isSomeCommitStale(unreleasedCommits, notifyDate)
    ? unreleasedCommits
    : []
}

async function groupCommits(token, commits) {
  if (commits.length === 0) {
    return []
  }

  const commitsWithoutPrs = []
  const commitsWithPrs = commits.reduce((acc, commit) => {
    if (commit.parents.length < 2) {
      commitsWithoutPrs.push(commit)
    } else {
      acc.push(commit)
    }
  }, [])

  // I need to fetch the PRs including those commits SHA
  const octokit = github.getOctokit(token)
  const { owner, repo } = github.context.repo

  const map = new Map()
  for (const commit of commitsWithPrs) {
    const { sha } = commit
    const query = `is:pr+repo:${owner}/${repo}+SHA:${sha}`
    const { data } = await octokit.rest.search.issuesAndPullRequests({
      q: query,
    })
    const { total_count: totalCount, items } = data
    if (totalCount !== 1) {
      continue
    }

    const { number } = items[0]
    map.set(number, [...(map.get(number) || []), commit])
  }

  const retVal = {
    commitsWithoutPrs,
    singleCommitPrs: Array.from(map.values())
      .filter((values) => values.length === 1)
      .flat(),
    multipleCommitsPrs: Array.from(map.values())
      .filter((values) => values.length > 1)
      .flat(),
  }

  return retVal
}

module.exports = {
  getLatestRelease,
  getUnreleasedCommits,
  groupCommits,
}
