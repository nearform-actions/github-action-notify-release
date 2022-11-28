'use strict'

const {
  notifyAfterToMs,
  isSomeCommitStale,
  isStale,
  parseNotificationSettings,
  staleDaysToStr,
} = require('../src/time-utils.js')

const {
  allCommitsData: allCommits,
  closedNotifyIssuesNeverStale,
  closedNotifyIssues,
} = require('./testData')

test('convert stale days correctly', () => {
  const now = Date.now()
  const spy = jest.spyOn(Date, 'now').mockImplementation(() => now)

  const defaultStaleDate = () => notifyAfterToMs()
  expect(defaultStaleDate).toThrow()

  const oneHourAgo = notifyAfterToMs('1 hour')
  expect(oneHourAgo).toEqual(now - 60 * 60 * 1000)
  spy.mockRestore()
})

test('there are commits before stale date', () => {
  const noStaleCommit = isSomeCommitStale(
    allCommits.data,
    new Date('2000').getTime()
  )
  expect(noStaleCommit).toBe(false)

  expect(isSomeCommitStale([], Date.now())).toBe(false)

  const stale = isSomeCommitStale(allCommits.data, Date.now())

  expect(stale).toBe(true)
})

test('there are closed notify before stale date', () => {
  const noStaleIssues = isStale(
    closedNotifyIssuesNeverStale,
    new Date('2000').getTime()
  )

  expect(noStaleIssues).toBe(false)

  const stale = isStale(closedNotifyIssues[0].closed_at, Date.now())

  expect(stale).toBe(true)
})

test('convert notify after to date', () => {
  const now = Date.now()
  const spy = jest.spyOn(Date, 'now').mockImplementation(() => now)

  const defaultStaleDate = () => notifyAfterToMs()
  expect(defaultStaleDate).toThrow()

  const oneHourAgo = notifyAfterToMs('1 hour')
  expect(oneHourAgo).toEqual(now - 60 * 60 * 1000)

  spy.mockRestore()
})

test('parseNotificationSettings parse time correctly when notify after is passed', () => {
  const now = Date.now()
  const spy = jest.spyOn(Date, 'now').mockImplementation(() => now)

  const core = {
    'notify-after': '1 hour',
    'stale-days': 7,
    getInput: function (input) {
      return this[input]
    },
  }

  const notifyAfter = parseNotificationSettings(core)
  expect(notifyAfter).toEqual('1 hour')

  spy.mockRestore()
})

test('parseNotificationSettings parse time correctly when notify is undefined', () => {
  const now = Date.now()
  const spy = jest.spyOn(Date, 'now').mockImplementation(() => now)

  const coreStaleDaysStr = {
    'notify-after': undefined,
    'stale-days': '1 hour',
    getInput: function (input) {
      return this[input]
    },
  }

  const notifyAfterFirst = parseNotificationSettings(coreStaleDaysStr)

  expect(notifyAfterFirst).toEqual('1 hour')

  const coreStaleDaysNumber = {
    'notify-after': undefined,
    'stale-days': 7,
    getInput: function (input) {
      return this[input]
    },
  }

  const notifyAfterSecond = parseNotificationSettings(coreStaleDaysNumber)
  expect(notifyAfterSecond).toEqual('7 days')
  spy.mockRestore()
})

test('staleDaysToStr converts correctly', () => {
  expect(staleDaysToStr(7)).toEqual('7 days')
  expect(staleDaysToStr(1)).toEqual('1 day')
})

test('parseNotificationSettings default value', () => {
  const now = Date.now()
  const spy = jest.spyOn(Date, 'now').mockImplementation(() => now)

  const coreStaleDaysStr = {
    'notify-after': undefined,
    'stale-days': undefined,
    getInput: function (input) {
      return this[input]
    },
  }

  const notifyAfter = parseNotificationSettings(coreStaleDaysStr)

  expect(notifyAfter).toEqual('7 days')

  spy.mockRestore()
})
