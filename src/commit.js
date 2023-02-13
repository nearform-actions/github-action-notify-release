'use strict'

const github = require('@actions/github')
const { isSomeCommitStale } = require('./utils/time.js')
const { isEmptyObject } = require('./utils/isEmptyObject.js')

const COMMITS_WITHOUT_PRS_KEY = -1

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

  const filteredCommits = commits.filter(
    (commit) => !commit.commit.message.startsWith('Merge pull request #')
  )

  const commitMap = await getCommitMapForPRs(token, filteredCommits)
  const groupedCommits = groupCommitsByPRType(commitMap)

  return groupedCommits
}

async function getCommitMapForPRs(token, commits) {
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
    map.set(number, [
      ...(map.get(number) || []),
      { ...commit, pr_number: number },
    ])
  }

  return map
}

function groupCommitsByPRType(map) {
  const multiCommitPRs = Array.from(map.entries())
    .filter(
      ([key, values]) => key !== COMMITS_WITHOUT_PRS_KEY && values.length > 1
    )
    .map(([, values]) => values)
    .flat()
  const multipleCommitPRs = groupByPRNumber(multiCommitPRs)

  const groupedCommits = {
    commitsWithoutPRs: map.get(COMMITS_WITHOUT_PRS_KEY) || [],
    singleCommitPRs: Array.from(map.entries())
      .filter(
        ([key, values]) =>
          key !== COMMITS_WITHOUT_PRS_KEY && values.length === 1
      )
      .map(([, values]) => values)
      .flat(),
    multipleCommitPRs: isEmptyObject(multipleCommitPRs)
      ? null
      : multipleCommitPRs,
  }
  return groupedCommits
}

function groupByPRNumber(commits) {
  return commits.reduce((groupedCommits, commit) => {
    const prNumber = commit.pr_number
    groupedCommits[prNumber] = groupedCommits[prNumber] || []
    groupedCommits[prNumber].push(commit)
    return groupedCommits
  }, {})
}

module.exports = {
  getUnreleasedCommits,
  groupCommits,
}
