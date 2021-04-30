const { getOctokit } = require('@actions/github');
const { getLatestRelease, getUnreleasedCommits } = require('../src/release');
const { createIssue, updateLastOpenPendingIssue, getLastOpenPendingIssue } = require('../src/utils');
const {
  allCommitsData: allCommits,
  allReleasesData: allReleases,
  unreleasedCommitsData0,
  unreleasedCommitsData1,
  allReleasesNoData,
} = require('./testData');

const token = 'dummytoken';

jest.mock('@actions/github', () => ({
  getOctokit: jest.fn(),
  context: { repo: { owner: 'sameer', repo: 'testrepo' } },
}));

test('Gets the latest release of the repository', async () => {
  getOctokit.mockReturnValue({ request: async () => allReleases });
  const latestReleaseResponse = await getLatestRelease(token);
  expect(latestReleaseResponse).toStrictEqual(allReleases.data[0]);
});

test('Retuns null if no releases found', async () => {
  getOctokit.mockReturnValue({ request: async () => allReleasesNoData });
  await expect(getLatestRelease(token)).resolves.toBe(null);
});

test('Gets the unreleased commits with days-to-ignore as 0', async () => {
  getOctokit.mockReturnValue({ request: async () => allCommits });
  const daysToIgnore = 0;
  const latestReleaseDate = allReleases.data[0].created_at;
  const allCommitsResponse = await getUnreleasedCommits(token, latestReleaseDate, daysToIgnore);
  expect(allCommitsResponse).toStrictEqual(unreleasedCommitsData1);
});

test('Gets the unreleased commits with days-to-ignore as non zero', async () => {
  getOctokit.mockReturnValue({ request: async () => allCommits });
  const daysToIgnore = 3;
  const latestReleaseDate = allReleases.data[0].created_at;
  const allCommitsResponse = await getUnreleasedCommits(token, latestReleaseDate, daysToIgnore);
  expect(allCommitsResponse).toStrictEqual(unreleasedCommitsData1);
});

test('Gets the unreleased commits and uses default value of days-to-ignore', async () => {
  getOctokit.mockReturnValue({ request: async () => allCommits });
  const daysToIgnore = undefined;
  const latestReleaseDate = allReleases.data[0].created_at;
  const allCommitsResponse = await getUnreleasedCommits(token, latestReleaseDate, daysToIgnore);
  expect(allCommitsResponse).toStrictEqual(unreleasedCommitsData0);
});

test('Creates an issue', async () => {
  getOctokit.mockReturnValue(
    { issues: { create: async () => ({ data: { number: 9 } }) } });
  const issueTitle = 'Release pending!';
  const issueBody = 'issue has been created with pending commits';
  const issueResponse = await createIssue(token, issueTitle, issueBody);
  expect(issueResponse.data.number).toStrictEqual(9);
});

test('Throws if something went wrong in creating an issue', async () => {
  getOctokit.mockImplementation(() => null);
  const issueTitle = 'Release pending!';
  const issueBody = 'issue has been created with pending commits';
  await expect(createIssue(token, issueTitle, issueBody)).rejects.toThrow()
});

test('Updates an issue', async () => {
  getOctokit.mockReturnValue({ request: async () => ({ data: [{ number: 9 }] }) });
  const issueTitle = 'Release pending!';
  const issueNo = 9;
  const issueBody = 'issue has been updated with pending commits';
  const updatedIssue = await updateLastOpenPendingIssue(token, issueTitle, issueBody, issueNo);
  expect(updatedIssue.number).toStrictEqual(9);
});

test('Updates an issue', async () => {
  getOctokit.mockReturnValue({ request: async () => ({ data: [] }) });
  const issueTitle = 'Release pending!';
  const issueNo = 9;
  const issueBody = 'issue has been updated with pending commits';
  const updatedIssue = await updateLastOpenPendingIssue(token, issueTitle, issueBody, issueNo);
  expect(updatedIssue).toStrictEqual(null);
});


test('Gets last open pending issue', async () => {
  const latestReleaseDate = 'test date';
  getOctokit.mockReturnValue({ request: async () => ({ data: [{ number: 9 }] }) });
  const pendingIssue = await getLastOpenPendingIssue(token, latestReleaseDate);
  expect(pendingIssue.number).toStrictEqual(9);
});

test('Get last open pending issue returns invalid result', async () => {
  const latestReleaseDate = 'test date';
  getOctokit.mockReturnValue({ request: async () => ({ data: [] }) });
  const pendingIssue = await getLastOpenPendingIssue(token, latestReleaseDate);
  expect(pendingIssue).toStrictEqual(null);
});