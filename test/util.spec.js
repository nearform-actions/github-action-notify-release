'use strict';

const utils = require('../src/utils');

const {
  unreleasedCommitsData1,
} = require('./testData');

test('Should limit commit message to only first line', async () => {
  const formattedCommitMessage = utils.formatCommitMessage(unreleasedCommitsData1[0].commit.message, 1);
  expect(formattedCommitMessage).toStrictEqual('variable changed');
});

test('Should return full commit message', async () => {
  const formattedCommitMessage = utils.formatCommitMessage(unreleasedCommitsData1[0].commit.message, 0);
  expect(formattedCommitMessage).toStrictEqual(`variable changed
    
    
this message has multiple lines

`);
});

test('Should trim start and end of commit message while limiting the lines', async () => {
  const formattedCommitMessage = utils.formatCommitMessage(unreleasedCommitsData1[0].commit.message, 5);
  expect(formattedCommitMessage).toStrictEqual(`variable changed
    
    
this message has multiple lines`);
});