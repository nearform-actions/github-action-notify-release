const core = require('@actions/core');
const { logInfo } = require('./log');
const { getLatestRelease, getUnreleasedCommits } = require('./release');
const { createIssue } = require('./utils');

async function run() {
  try {
    logInfo('========Starting to run the stale release github action ============');

    const token = core.getInput('github-token', { required: true });

    const daysToIgnore = core.getInput('days-to-ignore');

    logInfo(`Days since last release: ${daysToIgnore}`);
    logInfo('Fetching latest release......');

    const latestRelease = await getLatestRelease(token);

    logInfo(`Latest release - name:${latestRelease.name}, created:${latestRelease.created_at},
Tag:${latestRelease.tag_name}, author:${latestRelease.author.login}`);

    const unreleasedCommits = await getUnreleasedCommits(token, latestRelease, daysToIgnore);

    logInfo(JSON.stringify(unreleasedCommits));

    if (unreleasedCommits.length) {
      let commitStr = '';
      for (const commit of unreleasedCommits) {
        commitStr = commitStr
          + `Issue: ${commit.message}\n`
          + `Author: ${commit.author}\n\n`;
      }
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
