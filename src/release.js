'use strict'
const github = require('@actions/github')
const { COMMITS_WITHOUT_PRS_KEY } = require('./constants.js')
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

  // I need to fetch the PRs including those commits SHA
  const octokit = github.getOctokit(token)
  const { owner, repo } = github.context.repo

  const map = new Map()
  for (const commit of commits) {
    const { sha } = commit
    const query = `is:pr+repo:${owner}/${repo}+SHA:${sha}`
    const { data } = await octokit.rest.search.issuesAndPullRequests({
      q: query,
    })
    const { total_count: totalCount, items } = data
    if (totalCount === 0) {
      map.set(COMMITS_WITHOUT_PRS_KEY, [
        ...(map.get(COMMITS_WITHOUT_PRS_KEY) || []),
        commit,
      ])
      continue
    }

    const { number } = items[0]
    map.set(number, [...(map.get(number) || []), commit])
  }

  const retVal = {
    commitsWithoutPrs: map.get(COMMITS_WITHOUT_PRS_KEY),
    singleCommitPrs: Array.from(map.entries())
      .filter(
        ([key, values]) =>
          key !== COMMITS_WITHOUT_PRS_KEY && values.length === 1
      )
      .map(([, values]) => values)
      .flat(),
    multipleCommitsPrs: Array.from(map.entries())
      .filter(
        ([key, values]) => key !== COMMITS_WITHOUT_PRS_KEY && values.length > 1
      )
      .map(([, values]) => values)
      .flat(),
  }

  return retVal
}

module.exports = {
  getLatestRelease,
  getUnreleasedCommits,
  groupCommits,
}
