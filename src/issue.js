'use strict'
const github = require('@actions/github');
const { logInfo } = require('./log');

const ISSUE_LABEL = 'notify-release';
const ISSUE_TITLE = 'Release pending!';
const STATE_OPEN = 'open';
const STATE_CLOSED = 'closed';

async function createIssue(token, issueBody) {
  const octokit = github.getOctokit(token);

  return octokit.issues.create({
    ...github.context.repo,
    title: ISSUE_TITLE,
    body: issueBody,
    labels: [ISSUE_LABEL],
  });
}

async function getLastOpenPendingIssue(token) {
  const octokit = github.getOctokit(token);
  const { owner, repo } = github.context.repo;

  const pendingIssues = await octokit.request(`GET /repos/{owner}/{repo}/issues`, {
    owner,
    repo,
    creator: 'app/github-actions',
    state: STATE_OPEN,
    sort: 'created',
    direction: 'desc',
    labels: ISSUE_LABEL
  });

  return pendingIssues.data.length ? pendingIssues.data[0] : null;
}

async function updateLastOpenPendingIssue(token, issueBody, issueNo) {
  const octokit = github.getOctokit(token);
  const { owner, repo } = github.context.repo;

  const updatedIssue = await octokit.request(`PATCH /repos/{owner}/{repo}/issues/${issueNo}`, {
    owner,
    repo,
    title: ISSUE_TITLE,
    body: issueBody
  });

  return updatedIssue.data.length ? updatedIssue.data[0] : null;
}

async function createOrUpdateIssue(token, unreleasedCommits, pendingIssue, latestRelease, commitMessageLines) {
  const commitStr = unreleasedCommits.map((commit) => `Commit: ${formatCommitMessage(commit.commit.message, commitMessageLines)}  
Author: ${commit.commit.author.name}  

`).join('');
  const issueBody = `Unreleased commits have been found which are pending release, please publish the changes.
  
  ### Commits since the last release
  ${commitStr}`;

  if (pendingIssue) {
    await updateLastOpenPendingIssue(token, issueBody, pendingIssue.number);
    logInfo(`Issue ${pendingIssue.number} has been updated`);
  } else {
    const issueNo = await createIssue(token, issueBody);
    logInfo(`New issue has been created. Issue No. - ${issueNo}`);
  }
}

function formatCommitMessage(fullCommitMessage, numberOfLines) {
  if (!numberOfLines || numberOfLines < 0) {
    return fullCommitMessage;
  }
  return fullCommitMessage
    .split('\n')
    .slice(0, numberOfLines)
    .join('\n')
    .trim();
}

async function closeIssue(token, issueNo) {
  const octokit = github.getOctokit(token);
  const { owner, repo } = github.context.repo;

  await octokit.request(`PATCH /repos/{owner}/{repo}/issues/${issueNo}`, {
    owner,
    repo,
    state: STATE_CLOSED
  });
  logInfo(`Closed issue no. - ${issueNo}`);
}

module.exports = {
  createIssue,
  getLastOpenPendingIssue,
  updateLastOpenPendingIssue,
  formatCommitMessage,
  createOrUpdateIssue,
  closeIssue
};
