const core = require('@actions/core');
const { logInfo } = require('./log');
const { getLatestRelease, getUnreleasedCommits } = require('./release');
const { createIssue, getLastOpenPendingIssue, updateLastOpenPendingIssue } = require('./utils');

async function run() {
  try {
    const token = core.getInput('github-token', { required: true });
    const daysInput = core.getInput('days-to-ignore');
    const daysToIgnore = Number(daysInput);
    const latestRelease = await getLatestRelease(token);

    if (!latestRelease) {
      logInfo('Could not find latest release');
      return;
    }

    logInfo(`Latest release - name:${latestRelease.name}, created:${latestRelease.created_at},
Tag:${latestRelease.tag_name}, author:${latestRelease.author.login}`);

    const unreleasedCommits = await getUnreleasedCommits(
      token,
      latestRelease.created_at,
      daysToIgnore,
    );

    if (unreleasedCommits.length) {
      const commitStr = unreleasedCommits.map((commit) => `Issue: ${commit.commit.message}  
Author: ${commit.commit.author.name}  

`).join('');
      const issueBody = `Unreleased commits have been found which are pending release, please publish the changes.
  
  **Following are the commits:**
  ${commitStr}`;
      const issueTitle = 'Release pending!';

      const lastPendingIssue = await getLastOpenPendingIssue(token, lastReleaseDate);

      if (lastPendingIssue) {
        await updateLastOpenPendingIssue(token, issueTitle, issueBody, lastPendingIssue.number);
        logInfo(`Issue ${lastPendingIssue.number} has been updated`);
      } else {
        const issueNo = await createIssue(token, issueTitle, issueBody);
        logInfo(`New issue has been created. Issue No. - ${JSON.stringify(issueNo.data.number)}`);
      }

    } else {
      logInfo('No pending commits found');
    }
  } catch (error) {
    logInfo(error.message);
    core.setFailed(error.message);
  }
}

run();
