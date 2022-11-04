'use strict'
const ms = require('ms')

function staleDaysToMs(input) {
  const staleDays = Number(input)
  const now = Date.now()
  if (isNaN(staleDays)) {
    const stringToMs = ms(input)
    return now - stringToMs
  }
  return now - daysToMs(staleDays)
}

function isSomeCommitStale(commits, staleDate) {
  return commits.some((commit) => {
    return isStale(commit.commit.committer.date, staleDate)
  })
}

function isStale(date, staleDate) {
  return new Date(date).getTime() < staleDate
}

function daysToMs(days) {
  return days * 24 * 60 * 60 * 1000
}

module.exports = {
  staleDaysToMs,
  isSomeCommitStale,
  daysToMs,
  isStale,
}
