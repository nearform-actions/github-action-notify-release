'use strict'

const {
  staleDaysToMs,
  isSomeCommitStale,
  isStale,
  daysToMs,
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
