const github = require('@actions/github');

async function createIssue(token, issueTitle, issueBody) {
  const octokit = github.getOctokit(token);

  return octokit.issues.create({
    ...github.context.repo,
    title: issueTitle,
    body: issueBody,
  });
}

module.exports = {
  createIssue,
};
