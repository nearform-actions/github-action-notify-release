const github = require('@actions/github');

async function getLatestRelease(token) {
  const octokit = github.getOctokit(token);
  const { owner, repo } = github.context.repo;

  const allReleasesResp = await octokit.request('GET /repos/{owner}/{repo}/releases', {
    owner,
    repo,
  });

  const latestRelease = allReleasesResp.data.length ? allReleasesResp.data[0] : null;
  return latestRelease;
}

async function getUnreleasedCommits(token, latestReleaseDate, daysToIgnore = 7) {
  const octokit = github.getOctokit(token);
  const { owner, repo } = github.context.repo;

  const allCommitsResp = await octokit.request('GET /repos/{owner}/{repo}/commits', {
    owner,
    repo,
    since: latestReleaseDate,
  });

  if (!allCommitsResp.data.length) {
    return allCommitsResp.data;
  }

  const unreleasedCommits = [];
  const staleDate = new Date().getTime() - (daysToIgnore * 24 * 60 * 60 * 1000);

  for (const commit of allCommitsResp.data) {
    const commitDate = new Date(commit.commit.author.date).getTime();
    if (commitDate < staleDate) {
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
