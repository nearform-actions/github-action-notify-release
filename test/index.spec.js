import { test, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'

const parseNotifyAfter = mock.fn()
const runAction = mock.fn()
const logInfo = mock.fn()
const getIsClosingIssue = mock.fn()
const getIsSnoozingIssue = mock.fn()
const addSnoozingComment = mock.fn()
const logActionRefWarning = mock.fn()
const logRepoWarning = mock.fn()
const setFailed = mock.fn()

mock.module('actions-toolkit', {
  defaultExport: { logActionRefWarning, logRepoWarning },
})

mock.module('@actions/core', {
  namedExports: { setFailed },
})

mock.module(import.meta.resolve('../src/time-utils.js'), {
  namedExports: { parseNotifyAfter },
})

mock.module(import.meta.resolve('../src/release-notify-action.js'), {
  namedExports: { runAction },
})

mock.module(import.meta.resolve('../src/log.js'), {
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

mock.module(import.meta.resolve('../src/issue.js'), {
  namedExports: {
    getIsClosingIssue,
    getIsSnoozingIssue,
    addSnoozingComment,
  },
})

const { run } = await import('../src/index.js')

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
    setFailed,
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

test('it should throw if there is an error', async () => {
  const error = new Error('error')
  parseNotifyAfter.mock.mockImplementation(() => {
    throw error
  })

  await run({ inputs })
  assert.deepEqual(setFailed.mock.calls.at(-1).arguments, [error])
})
