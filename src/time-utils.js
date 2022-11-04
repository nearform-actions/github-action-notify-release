'use strict'
const ms = require('ms')

function staleDaysToDate(input) {
  try {
    const staleDays = Number(input)
    if (isNaN(staleDays)) {
      const stringToMs = ms(input)
      return new Date().getTime() - stringToMs
    }
    return new Date().getTime() - daysToMs(staleDays)
  } catch (error) {
    return new Date().getTime()
  }
}

function isCommitStale(unreleasedCommits, staleDate) {
  return unreleasedCommits.some((commit) => {
    return isStale(commit.commit.committer.date, staleDate)
  })
}

function isStale(date, staleDate) {
  const issueClosedDate = new Date(date).getTime()
  return issueClosedDate < staleDate
}

function daysToMs(days) {
  return days * 24 * 60 * 60 * 1000
}

module.exports = {
  staleDaysToDate,
  isCommitStale,
  daysToMs,
  isStale,
}
