'use strict';

const { getOctokit } = require('@actions/github');

const issue = require('../src/issue');

const {
  unreleasedCommitsData1,
} = require('./testData');

const token = 'dummytoken';
const owner = 'sameer';
const repo = 'testrepo';

jest.mock('../src/log', () => ({
  logInfo: jest.fn(),
}));

jest.mock('@actions/github', () => ({
  getOctokit: jest.fn(),
  context: { repo: { owner, repo} },
}));

test('Should limit commit message to only first line', async () => {
  const formattedCommitMessage = issue.formatCommitMessage(unreleasedCommitsData1[0].commit.message, 1);
  expect(formattedCommitMessage).toStrictEqual('variable changed');
});

test('Should return original commit message without changes', async () => {
  const formattedCommitMessage = issue.formatCommitMessage(unreleasedCommitsData1[0].commit.message, 0);
  expect(formattedCommitMessage).toStrictEqual(unreleasedCommitsData1[0].commit.message);
});

test('Should trim start and end of commit message while limiting the lines', async () => {
  const formattedCommitMessage = issue.formatCommitMessage(unreleasedCommitsData1[0].commit.message, 5);
  expect(formattedCommitMessage).toStrictEqual(`variable changed
    
    
this message has multiple lines`);
});

test('Creates an issue', async () => {
  getOctokit.mockReturnValue(
    { issues: { create: async () => ({ data: { number: 9 } }) } });
  const issueTitle = 'Release pending!';
  const issueBody = 'issue has been created with pending commits';

  const issueResponse = await issue.createIssue(token, issueTitle, issueBody);
  expect(issueResponse.data.number).toStrictEqual(9);
});

test('Throws if something went wrong in creating an issue', async () => {
  getOctokit.mockImplementation(() => null);
  const issueTitle = 'Release pending!';
  const issueBody = 'issue has been created with pending commits';

  await expect(issue.createIssue(token, issueTitle, issueBody)).rejects.toThrow();
});

test('Updates an issue', async () => {
  getOctokit.mockReturnValue({ request: async () => ({ data: [{ number: 9 }] }) });
  const issueTitle = 'Release pending!';
  const issueNo = 9;
  const issueBody = 'issue has been updated with pending commits';

  const updatedIssue = await issue.updateLastOpenPendingIssue(token, issueTitle, issueBody, issueNo);
  expect(updatedIssue.number).toStrictEqual(9);
});

test('Updates an issue', async () => {
  getOctokit.mockReturnValue({ request: async () => ({ data: [] }) });
  const issueTitle = 'Release pending!';
  const issueNo = 9;
  const issueBody = 'issue has been updated with pending commits';

  const updatedIssue = await issue.updateLastOpenPendingIssue(token, issueTitle, issueBody, issueNo);
  expect(updatedIssue).toStrictEqual(null);
});


test('Gets last open pending issue', async () => {
  const latestReleaseDate = 'test date';
  getOctokit.mockReturnValue({ request: async () => ({ data: [{ number: 9 }] }) });

  const pendingIssue = await issue.getLastOpenPendingIssue(token, latestReleaseDate);
  expect(pendingIssue.number).toStrictEqual(9);
});

test('Get last open pending issue returns invalid result', async () => {
  const latestReleaseDate = 'test date';
  getOctokit.mockReturnValue({ request: async () => ({ data: [] }) });

  const pendingIssue = await issue.getLastOpenPendingIssue(token, latestReleaseDate);
  expect(pendingIssue).toStrictEqual(null);
});

test('Close an issue', async () => {
  const request = jest.fn()
  getOctokit.mockReturnValue({request});

  await issue.closeIssue(token, '1');
  expect(request).toHaveBeenCalledWith('PATCH /repos/{owner}/{repo}/issues/1', {
    owner,
    repo,
    state: 'closed',
  });
});

test('Create an issue when no existing issue exists', async () => {
  const create = jest.fn()
  getOctokit.mockReturnValue({issues: {create}});

  await issue.createOrUpdateIssue(token, unreleasedCommitsData1, null, 'test-date', 1);
  expect(create).toHaveBeenCalled();
});

test('Update an issue when exists', async () => {
  const request = jest.fn()
  getOctokit.mockReturnValue({request});
  request.mockResolvedValue({
    data: {}
  })

  await issue.createOrUpdateIssue(token, unreleasedCommitsData1, {number: '1'}, 'test-date', 1);
  expect(request).toHaveBeenCalledWith('PATCH /repos/{owner}/{repo}/issues/1', {
    owner,
    repo,
    title: expect.any(String),
    body: expect.any(String),
  });
});