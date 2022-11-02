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
  if (!unreleasedCommits || !unreleasedCommits.length) return false
  return unreleasedCommits.some((commit) => {
    const commitDate = new Date(commit.commit.committer.date).getTime()
    return commitDate < staleDate
  })
}

function isClosedNotifyIssueStale(closedNotifyIssues, staleDate) {
  if (!closedNotifyIssues || !closedNotifyIssues.length) return false
  return closedNotifyIssues.some((issue) => {
    const issueClosedDate = new Date(issue.closed_at).getTime()
    return issueClosedDate < staleDate
  })
}

function daysToMs(days) {
  return days * 24 * 60 * 60 * 1000
}

module.exports = {
  staleDaysToDate,
  isCommitStale,
  daysToMs,
  isClosedNotifyIssueStale,
}
