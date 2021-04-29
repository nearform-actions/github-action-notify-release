const github = require('@actions/github');

async function getLatestRelease(token) {
  const octokit = github.getOctokit(token);
  const { owner, repo } = github.context.repo;

  const allReleasesResp = await octokit.request('GET /repos/{owner}/{repo}/releases', {
    owner,
    repo,
  });

  const latestRelease = allReleasesResp.data.length ? allReleasesResp.data[0] : null;
  if (!latestRelease) {
    throw new Error('Cannot find the latest release');
  }
  return latestRelease;
}

async function getUnreleasedCommits(token, latestReleaseDate, daysToIgnore = 0) {
  const octokit = github.getOctokit(token);
  const { owner, repo } = github.context.repo;

  const allCommitsResp = await octokit.request('GET /repos/{owner}/{repo}/commits', {
    owner,
    repo,
    since: latestReleaseDate,
  });

  if (!allCommitsResp.data.length) {
    throw new Error('Error fetching commits');
  }

  const unreleasedCommits = [];
  const lastReleaseDate = new Date(latestReleaseDate).getTime();
  const staleDate = new Date().getTime() - (daysToIgnore * 24 * 60 * 60 * 1000);

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
