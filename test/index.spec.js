'use strict'

const { run } = require('../src')
const { parseNotifyAfter } = require('../src/time-utils.js')
const { runAction } = require('../src/release-notify-action')

const {
  getIsSnoozingIssue,
  addSnoozingComment,
  getIsClosingIssue,
} = require('../src/issue.js')

jest.mock('actions-toolkit')

jest.mock('../src/time-utils.js', () => ({
  parseNotifyAfter: jest.fn(),
}))

jest.mock('../src/release-notify-action', () => ({
  runAction: jest.fn(),
}))

jest.mock('../src/log', () => ({
  logInfo: jest.fn(),
}))

jest.mock('@actions/github', () => ({
  context: {
    payload: {
      issue: {},
    },
    issue: {
      number: 1,
    },
  },
}))

jest.mock('../src/issue.js', () => ({
  getIsClosingIssue: jest.fn(),
  getIsSnoozingIssue: jest.fn(),
  addSnoozingComment: jest.fn(),
}))

const inputs = {
  'github-token': 'token',
  'notify-after': 'notify-after',
  'stale-days': 'stale-days',
  'commit-messages-lines': '10',
}

beforeEach(() => {
  jest.resetAllMocks()
})

test('confirm it uses the inputs passed as props', async () => {
  const parseNotifyAfterRes = '0 days'

  parseNotifyAfter.mockImplementation(() => parseNotifyAfterRes)

  await run({ inputs })
  expect(parseNotifyAfter).toHaveBeenCalledWith(
    inputs['notify-after'],
    inputs['stale-days']
  )

  expect(runAction).toHaveBeenCalledWith(
    inputs['github-token'],
    parseNotifyAfterRes,
    Number(inputs['commit-messages-lines'])
  )
})

test('it should run addSnoozingComment if isSnoozing is true', async () => {
  getIsSnoozingIssue.mockImplementation(() => true)
  await run({ inputs })
  expect(addSnoozingComment).toHaveBeenCalled()
})

test('it should not call runAction if isClosing is true', async () => {
  getIsClosingIssue.mockImplementation(() => true)
  await run({ inputs })
  expect(runAction).not.toHaveBeenCalled()
})
