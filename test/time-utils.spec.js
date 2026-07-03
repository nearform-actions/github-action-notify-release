'use strict'

const { test } = require('node:test')
const assert = require('node:assert/strict')

const {
  notifyAfterToMs,
  isSomeCommitStale,
  isStale,
  parseNotifyAfter,
  staleDaysToStr,
  getNotifyDate,
} = require('../src/time-utils.js')

const {
  allCommitsData: allCommits,
  closedNotifyIssuesNeverStale,
  closedNotifyIssues,
} = require('./testData')

test('convert stale days correctly', (t) => {
  const now = Date.now()
  t.mock.method(Date, 'now', () => now)

  const defaultStaleDate = () => notifyAfterToMs()
  assert.throws(defaultStaleDate)

  const zeroAsNow = notifyAfterToMs('0')
  assert.deepEqual(zeroAsNow, now)

  const oneHourAgo = notifyAfterToMs('1 hour')
  assert.deepEqual(oneHourAgo, now - 60 * 60 * 1000)
})

test('there are commits before stale date', () => {
  const noStaleCommit = isSomeCommitStale(
    allCommits.data,
    new Date('2000').getTime()
  )
  assert.strictEqual(noStaleCommit, false)

  assert.strictEqual(isSomeCommitStale([], Date.now()), false)

  const stale = isSomeCommitStale(allCommits.data, Date.now())

  assert.strictEqual(stale, true)
})

test('there are closed notify before stale date', () => {
  const noStaleIssues = isStale(
    closedNotifyIssuesNeverStale,
    new Date('2000').getTime()
  )

  assert.strictEqual(noStaleIssues, false)

  const stale = isStale(closedNotifyIssues[0].closed_at, Date.now())

  assert.strictEqual(stale, true)
})

test('convert notify after to date', (t) => {
  const now = Date.now()
  t.mock.method(Date, 'now', () => now)

  assert.throws(() => notifyAfterToMs())

  assert.throws(() => notifyAfterToMs('invalid string'))

  assert.throws(() => notifyAfterToMs('invalid ms'))

  assert.deepEqual(notifyAfterToMs('0 days'), now)

  assert.deepEqual(notifyAfterToMs('0 ms'), now)

  assert.deepEqual(notifyAfterToMs('0'), now)

  assert.deepEqual(notifyAfterToMs('1 hour'), now - 60 * 60 * 1000)
})

test('parseNotifyAfter parse time correctly when notify after is passed', (t) => {
  const now = Date.now()
  t.mock.method(Date, 'now', () => now)

  const notifyAfter = parseNotifyAfter('1 hour', '7')
  assert.deepEqual(notifyAfter, '1 hour')
})

test('parseNotifyAfter parse time correctly when notify is undefined', (t) => {
  const now = Date.now()
  t.mock.method(Date, 'now', () => now)

  const notifyAfter = parseNotifyAfter(undefined, '1 hour')

  assert.deepEqual(notifyAfter, '1 hour')

  const notifyAfterSecond = parseNotifyAfter(undefined, '7')
  assert.deepEqual(notifyAfterSecond, '7 days')
})

test('parseNotifyAfter parse time stale days is number', (t) => {
  const now = Date.now()
  t.mock.method(Date, 'now', () => now)

  const notifyAfter = parseNotifyAfter(undefined, 7)

  assert.deepEqual(notifyAfter, '7 days')
})

test('staleDaysToStr converts correctly', () => {
  assert.deepEqual(staleDaysToStr(7), '7 days')
  assert.deepEqual(staleDaysToStr(1), '1 day')
})

test('parseNotifyAfter default value', (t) => {
  const now = Date.now()
  t.mock.method(Date, 'now', () => now)

  const notifyAfter = parseNotifyAfter(undefined, undefined)

  assert.deepEqual(notifyAfter, '7 days')
})

test('parseNotifyAfter numeric notify-after', (t) => {
  const now = Date.now()
  t.mock.method(Date, 'now', () => now)

  assert.deepEqual(parseNotifyAfter('7', undefined), '7 ms')

  assert.deepEqual(parseNotifyAfter('0', undefined), '0 ms')

  assert.deepEqual(parseNotifyAfter('-1', undefined), '-1 ms')
})

test('getNotifyDate should return a valid date object', () => {
  const input = '1 day'
  const result = getNotifyDate(input)
  assert.ok(result instanceof Date)
})

test('getNotifyDate should throw an error when input is a string in an invalid format', () => {
  const input = 'invalid input'
  assert.throws(() => getNotifyDate(input), { message: 'Invalid time value' })
})
