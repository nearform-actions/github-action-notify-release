/* eslint-env jest */
'use strict'
const { getOctokit } = require('@actions/github');
const { getLatestRelease, getUnreleasedCommits } = require('../src/release');
const { createIssue } = require('../src/utils');
const { allCommitsData: mock_allCommits,
  allReleasesData: mock_allReleases,
  unreleasedCommitsData_0: mock_unreleasedCommitsData_0,
  unreleasedCommitsData_1: mock_unreleasedCommitsData_1,
  allReleasesData_NoData: mock_allReleasesData_NoData,
} = require('./testData')

const token = 'dummytoken'

jest.mock('@actions/github', () => ({
  getOctokit: jest.fn(),
  context: { repo: { owner: "sameer", repo: "testrepo" } }
}))

test("Gets the latest release of the repository", async () => {
  getOctokit.mockImplementation(() => {
    return { request: async () => mock_allReleases }
  });
  const response = await getLatestRelease(token);
  expect(response).toStrictEqual(mock_allReleases.data[0]);
});

test("Throws if no releases found", async () => {
  getOctokit.mockImplementation(() => {
    return { request: async () => mock_allReleasesData_NoData }
  });

  try {
    await getLatestRelease(token);
  } catch (error) {
    expect(error.message).toBe('Cannot find the latest release');
  }
});

test("Gets the unreleased commits with days-to-ignore as 0", async () => {
  getOctokit.mockImplementation(() => {
    return { request: async () => mock_allCommits }
  });
  const daysToIgnore = 0;
  const latestRelease = mock_allReleases.data[0];
  const response = await getUnreleasedCommits(token, latestRelease, daysToIgnore);
  expect(response).toStrictEqual(mock_unreleasedCommitsData_0);
});

test("Gets the unreleased commits with days-to-ignore as non zero", async () => {
  getOctokit.mockImplementation(() => {
    return { request: async () => mock_allCommits }
  });
  const daysToIgnore = 1;
  const latestRelease = mock_allReleases.data[0];
  const response = await getUnreleasedCommits(token, latestRelease, daysToIgnore);
  expect(response).toStrictEqual(mock_unreleasedCommitsData_1);
});

test("Throws if latestRelease is invalid", async () => {
  getOctokit.mockImplementation(() => {
    return { request: async () => mock_allCommits }
  });
  const daysToIgnore = 0;
  const latestRelease = null;
  const unreleasedFn = getUnreleasedCommits(token, latestRelease, daysToIgnore);
  try {
    await unreleasedFn;
  } catch (error) {
    expect(error.message).toBe('Latest release doesnt have a created_at date');
  }
});

test("Throws if error fetching all commits", async () => {
  getOctokit.mockImplementation(() => {
    return { request: async () => [] }
  });
  const daysToIgnore = 0;
  const latestRelease = null;
  const unreleasedFn = getUnreleasedCommits(token, latestRelease, daysToIgnore);
  try {
    await unreleasedFn;
  } catch (error) {
    expect(error.message).toBe('Error fetching commits');
  }
});

test("Creates an issue", async () => {
  getOctokit.mockImplementation(() => {
    return { issues: { create: async () => { return { data: { number: 9 } } } } }
  });
  const issueTitle = 'Release pending!';
  const issueBody = 'issue has been created with pending commits';
  const response = await createIssue(token, issueTitle, issueBody);
  expect(response.data.number).toStrictEqual(9)
});


test("Throws if something went wrong in creating an issue", async () => {
  getOctokit.mockImplementation(() => {
    return null
  });
  const issueTitle = 'Release pending!';
  const issueBody = 'issue has been created with pending commits';
  try {
    await createIssue(token, issueTitle, issueBody);
  } catch (error) {
    expect(error.message).toThrow()
  }
});