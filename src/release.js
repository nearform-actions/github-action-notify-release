'use strict'
const github = require('@actions/github');

async function getLatestRelease(token) {
  const octokit = github.getOctokit(token);
  const { owner, repo } = github.context.repo;

  const latestReleaseResponse = await octokit.request(`GET /repos/{owner}/{repo}/releases/latest`, {
    owner,
    repo,
  });

  return latestReleaseResponse.data;
}

async function getUnreleasedCommits(token, latestReleaseDate, staleDays) {
  const octokit = github.getOctokit(token);
  const { owner, repo } = github.context.repo;

  const allCommitsResp = await octokit.request(`GET /repos/{owner}/{repo}/commits`, {
    owner,
    repo,
    since: latestReleaseDate,
  });

  const staleDate = new Date().getTime() - (staleDays * 24 * 60 * 60 * 1000);

  for (const commit of allCommitsResp.data) {
    const commitDate = new Date(commit.commit.committer.date).getTime();
    if (commitDate < staleDate) {
      return allCommitsResp.data;
    }
  }

  return [];
}

module.exports = {
  getLatestRelease,
  getUnreleasedCommits,
};
