import * as github from '@actions/github'
import { isSomeCommitStale } from './time-utils.js'

export async function getLatestRelease(token) {
  try {
    const octokit = github.getOctokit(token)
    const { owner, repo } = github.context.repo

    const { data } = await octokit.rest.repos.getLatestRelease({
      owner,
      repo,
    })
    return data
  } catch {
    // no release found
  }
}

export async function getUnreleasedCommits(
  token,
  latestReleaseDate,
  notifyDate
) {
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
