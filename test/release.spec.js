/* eslint-env jest */
const { getOctokit } = require('@actions/github');
const { getLatestRelease, getUnreleasedCommits } = require('../src/release');
const { createIssue } = require('../src/utils');
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
  getOctokit.mockImplementation(() => ({ request: async () => allReleases }));
  const latestReleaseResponse = await getLatestRelease(token);
  expect(latestReleaseResponse).toStrictEqual(allReleases.data[0]);
});

test('Throws if no releases found', async () => {
  getOctokit.mockImplementation(() => ({ request: async () => allReleasesNoData }));
  try {
    await getLatestRelease(token);
  } catch (error) {
    expect(error.message).toBe('Cannot find the latest release');
  }
});

test('Gets the unreleased commits with days-to-ignore as 0', async () => {
  getOctokit.mockImplementation(() => ({ request: async () => allCommits }));
  const daysToIgnore = 0;
  const latestReleaseDate = allReleases.data[0].created_at;
  const allCommitsResponse = await getUnreleasedCommits(token, latestReleaseDate, daysToIgnore);
  expect(allCommitsResponse).toStrictEqual(unreleasedCommitsData0);
});

test('Gets the unreleased commits with days-to-ignore as non zero', async () => {
  getOctokit.mockImplementation(() => ({ request: async () => allCommits }));
  const daysToIgnore = 3;
  const latestReleaseDate = allReleases.data[0].created_at;
  const allCommitsResponse = await getUnreleasedCommits(token, latestReleaseDate, daysToIgnore);
  expect(allCommitsResponse).toStrictEqual(unreleasedCommitsData1);
});

test('Gets the unreleased commits and uses default value of days-to-ignore', async () => {
  getOctokit.mockImplementation(() => ({ request: async () => allCommits }));
  const daysToIgnore = undefined;
  const latestReleaseDate = allReleases.data[0].created_at;
  const allCommitsResponse = await getUnreleasedCommits(token, latestReleaseDate, daysToIgnore);
  expect(allCommitsResponse).toStrictEqual(unreleasedCommitsData0);
});

test('Throws if latestRelease is invalid', async () => {
  getOctokit.mockImplementation(() => ({ request: async () => allCommits }));
  const daysToIgnore = 0;
  const latestReleaseDate = null;
  const unreleasedFn = getUnreleasedCommits(token, latestReleaseDate, daysToIgnore);
  try {
    await unreleasedFn;
  } catch (error) {
    expect(error.message).toBe('Latest release doesnt have a created_at date');
  }
});

test('Throws if error fetching all commits', async () => {
  getOctokit.mockImplementation(() => ({ request: async () => ({ data: [] }) }));
  const daysToIgnore = 0;
  const latestReleaseDate = null;
  const unreleasedFn = getUnreleasedCommits(token, latestReleaseDate, daysToIgnore);
  try {
    await unreleasedFn;
  } catch (error) {
    expect(error.message).toBe('Error fetching commits');
  }
});

test('Creates an issue', async () => {
  getOctokit.mockImplementation(() => (
    { issues: { create: async () => ({ data: { number: 9 } }) } }));
  const issueTitle = 'Release pending!';
  const issueBody = 'issue has been created with pending commits';
  const issueResponse = await createIssue(token, issueTitle, issueBody);
  expect(issueResponse.data.number).toStrictEqual(9);
});

test('Throws if something went wrong in creating an issue', async () => {
  getOctokit.mockImplementation(() => null);
  const issueTitle = 'Release pending!';
  const issueBody = 'issue has been created with pending commits';
  try {
    await createIssue(token, issueTitle, issueBody);
  } catch (error) {
    expect(error.message).toBe('Cannot read property \'issues\' of null');
  }
});
