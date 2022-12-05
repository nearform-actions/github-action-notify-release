'use strict'

const {
  notifyAfterToMs,
  isSomeCommitStale,
  isStale,
  parseNotifyAfter,
  staleDaysToStr,
} = require('../src/time-utils.js')

const {
  allCommitsData: allCommits,
  closedNotifyIssuesNeverStale,
  closedNotifyIssues,
} = require('./testData')

test('convert stale days correctly', () => {
  const now = Date.now()
  jest.spyOn(Date, 'now').mockImplementation(() => now)

  const defaultStaleDate = () => notifyAfterToMs()
  expect(defaultStaleDate).toThrow()

  const zeroAsNow = notifyAfterToMs('0')
  expect(zeroAsNow).toEqual(now)

  const oneHourAgo = notifyAfterToMs('1 hour')
  expect(oneHourAgo).toEqual(now - 60 * 60 * 1000)
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
  jest.spyOn(Date, 'now').mockImplementation(() => now)

  expect(() => notifyAfterToMs()).toThrow()

  expect(() => notifyAfterToMs('invalid string')).toThrow()

  expect(() => notifyAfterToMs('invalid ms')).toThrow()

  expect(notifyAfterToMs('0 days')).toEqual(now)

  expect(notifyAfterToMs('0 ms')).toEqual(now)

  expect(notifyAfterToMs('0')).toEqual(now)

  expect(notifyAfterToMs('1 hour')).toEqual(now - 60 * 60 * 1000)
})

test('parseNotifyAfter parse time correctly when notify after is passed', () => {
  const now = Date.now()
  jest.spyOn(Date, 'now').mockImplementation(() => now)

  const notifyAfter = parseNotifyAfter('1 hour', '7')
  expect(notifyAfter).toEqual('1 hour')
})

test('parseNotifyAfter parse time correctly when notify is undefined', () => {
  const now = Date.now()
  jest.spyOn(Date, 'now').mockImplementation(() => now)

  const notifyAfter = parseNotifyAfter(undefined, '1 hour')

  expect(notifyAfter).toEqual('1 hour')

  const notifyAfterSecond = parseNotifyAfter(undefined, '7')
  expect(notifyAfterSecond).toEqual('7 days')
})

test('parseNotifyAfter parse time stale days is number', () => {
  const now = Date.now()
  jest.spyOn(Date, 'now').mockImplementation(() => now)

  const notifyAfter = parseNotifyAfter(undefined, 7)

  expect(notifyAfter).toEqual('7 days')
})

test('staleDaysToStr converts correctly', () => {
  expect(staleDaysToStr(7)).toEqual('7 days')
  expect(staleDaysToStr(1)).toEqual('1 day')
})

test('parseNotifyAfter default value', () => {
  const now = Date.now()
  jest.spyOn(Date, 'now').mockImplementation(() => now)

  const notifyAfter = parseNotifyAfter(undefined, undefined)

  expect(notifyAfter).toEqual('7 days')
})

test('parseNotifyAfter numeric notify-after', () => {
  const now = Date.now()
  jest.spyOn(Date, 'now').mockImplementation(() => now)

  expect(parseNotifyAfter('7', undefined)).toEqual('7 ms')

  expect(parseNotifyAfter('0', undefined)).toEqual('0 ms')

  expect(parseNotifyAfter('-1', undefined)).toEqual('-1 ms')
})
