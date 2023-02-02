'use strict'

const github = require('@actions/github')

const COMMITS_WITHOUT_PRS_KEY = -1

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

  const groupedCommits = {
    commitsWithoutPrs: map.get(COMMITS_WITHOUT_PRS_KEY),
    // single commit prs includes the merge commit and the single commit -> length 2
    singleCommitPrs: Array.from(map.entries())
      .filter(
        ([key, values]) =>
          key !== COMMITS_WITHOUT_PRS_KEY && values.length === 2
      )
      .map(([, values]) => values)
      .flat(),
    // multiple commit prs includes the merge commit and the other commits -> length > 2
    multipleCommitsPrs: Array.from(map.entries())
      .filter(
        ([key, values]) => key !== COMMITS_WITHOUT_PRS_KEY && values.length > 2
      )
      .map(([, values]) => values)
      .flat(),
  }

  return groupedCommits
}

module.exports = {
  groupCommits,
}
