const core = require('@actions/core');
const { logInfo } = require('./log');
const { getLatestRelease, getUnreleasedCommits } = require('./release');
const { createIssue } = require('./utils');

async function run() {
  try {
    const token = core.getInput('github-token', { required: true });

    const daysToIgnore = core.getInput('days-to-ignore');
    const latestRelease = await getLatestRelease(token);

    logInfo(`Latest release - name:${latestRelease.name}, created:${latestRelease.created_at},
Tag:${latestRelease.tag_name}, author:${latestRelease.author.login}`);

    if (!latestRelease.created_at) {
      throw new Error('Invalid latest release');
    }
    const unreleasedCommits = await getUnreleasedCommits(
      token,
      latestRelease.created_at,
      daysToIgnore,
    );

    if (unreleasedCommits.length) {
      const commitStr = unreleasedCommits.map((commit) => `Issue: ${commit.message},\\ Author: ${commit.author}`).join('\\\\');
      const issueBody = `Unreleased commits have been found which are pending release, please publish the changes.
  
  **Following are the commits:**
  ${commitStr}`;
      const issueTitle = 'Release pending!';
      const issueNo = await createIssue(token, issueTitle, issueBody);
      logInfo(`New issue has been created. Issue No. - ${JSON.stringify(issueNo.data.number)}`);
    } else {
      logInfo('No pending commits found');
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
