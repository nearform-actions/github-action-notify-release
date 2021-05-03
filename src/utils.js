'use strict'
const github = require('@actions/github');

async function createIssue(token, issueTitle, issueBody) {
  const octokit = github.getOctokit(token);

  return octokit.issues.create({
    ...github.context.repo,
    title: issueTitle,
    body: issueBody,
  });
}

async function getLastOpenPendingIssue(token, latestReleaseDate) {
  const octokit = github.getOctokit(token);
  const { owner, repo } = github.context.repo;

  const pendingIssues = await octokit.request(`GET /repos/{owner}/{repo}/issues`, {
    owner,
    repo,
    since: latestReleaseDate,
    creator: 'app/github-actions',
    state: 'open',
    sort: 'created',
    direction: 'desc'
  });

  return pendingIssues.data.length ? pendingIssues.data[0] : null;
}

async function updateLastOpenPendingIssue(token, issueTitle, issueBody, issueNo) {
  const octokit = github.getOctokit(token);
  const { owner, repo } = github.context.repo;

  const updatedIssue = await octokit.request(`PATCH /repos/{owner}/{repo}/issues/${issueNo}`, {
    owner,
    repo,
    title: issueTitle,
    body: issueBody
  });

  return updatedIssue.data.length ? updatedIssue.data[0] : null;
}

module.exports = {
  createIssue,
  getLastOpenPendingIssue,
  updateLastOpenPendingIssue,
};
