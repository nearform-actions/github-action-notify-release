const github = require('@actions/github');

async function getLatestRelease(token) {
  const octokit = github.getOctokit(token);
  const { owner, repo } = github.context.repo;

  const allReleasesResp = await octokit.request('GET /repos/{owner}/{repo}/releases', {
    owner,
    repo,
  });

  const latestRelease = (allReleasesResp && allReleasesResp.data && allReleasesResp.data.length)
    ? allReleasesResp.data[0] : null;
  if (!latestRelease) throw new Error('Cannot find the latest release');

  return latestRelease;
}

async function getUnreleasedCommits(token, latestRelease, daysToIgnore) {
  const octokit = github.getOctokit(token);
  const { owner, repo } = github.context.repo;

  // TODO: extract this
  const allCommitsResp = await octokit.request('GET /repos/{owner}/{repo}/commits', {
    owner,
    repo,
  });

  if (!allCommitsResp || !allCommitsResp.data || !allCommitsResp.data.length) throw new Error('Error fetching commits');
  if (!latestRelease || !latestRelease.created_at) throw new Error('Latest release doesnt have a created_at date');
  // eslint-disable-next-line no-param-reassign
  if (!daysToIgnore) daysToIgnore = 0;

  const unreleasedCommits = [];
  const lastReleaseDate = new Date(latestRelease.created_at).getTime();
  let staleDate = new Date().getTime();
  if (daysToIgnore > 0) {
    staleDate = new Date().getTime() - (daysToIgnore * 24 * 60 * 60 * 1000);
  }

  for (const commit of allCommitsResp.data) {
    const commitDate = new Date(commit.commit.author.date).getTime();
    if (lastReleaseDate < commitDate && commitDate < staleDate) {
      unreleasedCommits.push({
        message: commit.commit.message,
        author: commit.commit.author.name,
        date: commitDate,
        url: commit.url,
      });
    }
  }

  return unreleasedCommits;
}

module.exports = {
  getLatestRelease,
  getUnreleasedCommits,
};
