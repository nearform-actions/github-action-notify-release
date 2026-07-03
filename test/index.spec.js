'use strict'

const { test, beforeEach, mock } = require('node:test')
const assert = require('node:assert/strict')
const { pathToFileURL } = require('node:url')

const parseNotifyAfter = mock.fn()
const runAction = mock.fn()
const logInfo = mock.fn()
const getIsClosingIssue = mock.fn()
const getIsSnoozingIssue = mock.fn()
const addSnoozingComment = mock.fn()
const logActionRefWarning = mock.fn()
const logRepoWarning = mock.fn()

mock.module('actions-toolkit', {
  defaultExport: { logActionRefWarning, logRepoWarning },
})

mock.module(pathToFileURL(require.resolve('../src/time-utils.js')).href, {
  namedExports: { parseNotifyAfter },
})

mock.module(
  pathToFileURL(require.resolve('../src/release-notify-action')).href,
  {
    namedExports: { runAction },
  }
)

mock.module(pathToFileURL(require.resolve('../src/log')).href, {
  namedExports: { logInfo },
})

mock.module('@actions/github', {
  namedExports: {
    context: {
      payload: {
        issue: {},
      },
      issue: {
        number: 1,
      },
    },
  },
})

mock.module(pathToFileURL(require.resolve('../src/issue.js')).href, {
  namedExports: {
    getIsClosingIssue,
    getIsSnoozingIssue,
    addSnoozingComment,
  },
})

const { run } = require('../src')
const core = require('@actions/core')

const inputs = {
  'github-token': 'token',
  'notify-after': 'notify-after',
  'stale-days': 'stale-days',
  'commit-messages-lines': '10',
}

beforeEach(() => {
  for (const fn of [
    parseNotifyAfter,
    runAction,
    logInfo,
    getIsClosingIssue,
    getIsSnoozingIssue,
    addSnoozingComment,
    logActionRefWarning,
    logRepoWarning,
  ]) {
    fn.mock.restore()
    fn.mock.resetCalls()
  }
})

test('confirm it uses the inputs passed as props', async () => {
  const parseNotifyAfterRes = '0 days'

  parseNotifyAfter.mock.mockImplementation(() => parseNotifyAfterRes)

  await run({ inputs })

  assert.deepEqual(parseNotifyAfter.mock.calls.at(-1).arguments, [
    inputs['notify-after'],
    inputs['stale-days'],
  ])

  assert.deepEqual(runAction.mock.calls.at(-1).arguments, [
    {
      token: inputs['github-token'],
      ignoreSnoozed: false,
      notifyAfter: parseNotifyAfterRes,
      commitMessageLines: Number(inputs['commit-messages-lines']),
    },
  ])
})

test('it should run addSnoozingComment if isSnoozing is true', async () => {
  getIsSnoozingIssue.mock.mockImplementation(() => true)
  await run({ inputs })
  assert.ok(addSnoozingComment.mock.callCount() > 0)
})

test('it should not call runAction if isClosing is true', async () => {
  getIsClosingIssue.mock.mockImplementation(() => true)
  await run({ inputs })
  assert.strictEqual(runAction.mock.callCount(), 0)
})

test('it should throw if there is an error', async (t) => {
  const error = new Error('error')
  parseNotifyAfter.mock.mockImplementation(() => {
    throw error
  })

  t.mock.method(core, 'setFailed', () => {})

  await run({ inputs })
  assert.deepEqual(core.setFailed.mock.calls.at(-1).arguments, [error])
})
