const core = require('@actions/core');
const github = require('@actions/github');
const { logInfo } = require('./log');

async function createIssue(token, issueTitle, issueBody) {
  try {
    const octokit = github.getOctokit(token);

    logInfo(issueBody);

    return await octokit.issues.create({
      ...github.context.repo,
      title: issueTitle,
      body: issueBody,
    });
  } catch (error) {
    core.setFailed(error.message);
  }
  return null;
}

module.exports = {
  createIssue,
};
