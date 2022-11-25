'use strict'

const {
  staleDaysToMs,
  isSomeCommitStale,
  isStale,
  daysToMs,
  notifyAfterToMs,
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

  const sevenDaysAgo = staleDaysToMs(7)
  expect(sevenDaysAgo).toEqual(now - daysToMs(7))

  const defaultStaleDate = () => staleDaysToMs()
  expect(defaultStaleDate).toThrow()

  const oneHourAgo = staleDaysToMs('1 hour')
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

  const { notifyDate, notifyAfter } = parseNotificationSettings(core)
  expect(notifyDate).toEqual(now - 60 * 60 * 1000)
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

  const { notifyDate: staleDateFirst, notifyAfter: notifyAfterFirst } =
    parseNotificationSettings(coreStaleDaysStr)

  expect(staleDateFirst).toEqual(now - 60 * 60 * 1000)
  expect(notifyAfterFirst).toEqual('1 hour')

  const coreStaleDaysNumber = {
    'notify-after': undefined,
    'stale-days': 7,
    getInput: function (input) {
      return this[input]
    },
  }

  const { notifyDate: staleDateSecond, notifyAfter: notifyAfterSecond } =
    parseNotificationSettings(coreStaleDaysNumber)
  expect(staleDateSecond).toEqual(now - daysToMs(7))
  expect(notifyAfterSecond).toEqual('7 days')
  spy.mockRestore()
})

test('staleDaysToStr converts correctly', () => {
  expect(staleDaysToStr(7)).toEqual('7 days')
  expect(staleDaysToStr(1)).toEqual('1 day')
})

test('parseNotificationSettings deafult value', () => {
  const now = Date.now()
  const spy = jest.spyOn(Date, 'now').mockImplementation(() => now)

  const coreStaleDaysStr = {
    'notify-after': undefined,
    'stale-days': undefined,
    getInput: function (input) {
      return this[input]
    },
  }

  const { notifyDate, notifyAfter } =
    parseNotificationSettings(coreStaleDaysStr)

  expect(notifyDate).toEqual(now - daysToMs(7))
  expect(notifyAfter).toEqual('7 days')

  spy.mockRestore()
})
