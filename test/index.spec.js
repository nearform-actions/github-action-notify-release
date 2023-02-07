'use strict'

const { run } = require('../src')
const { parseNotifyAfter } = require('../src/time-utils.js')
const { runAction } = require('../src/release-notify-action')

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

test('confirm it uses the inputs passed as props', async () => {
  const inputs = {
    'github-token': 'token',
    'notify-after': 'notify-after',
    'stale-days': 'stale-days',
    'commit-messages-lines': '10',
  }

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
