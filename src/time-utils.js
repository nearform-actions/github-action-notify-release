'use strict'
const ms = require('ms')
const { logWarning } = require('./log')

/** @deprecated */
function staleDaysToMs(input) {
  const staleDays = Number(input)
  const now = Date.now()
  if (isNaN(staleDays)) {
    const stringToMs = ms(input)
    return now - stringToMs
  }
  return now - daysToMs(staleDays)
}

/** @deprecated */
function staleDaysToStr(days) {
  return `${days} day${days > 1 ? 's' : ''}`
}

function notifyAfterToMs(timeStr) {
  const stringToMs = ms(timeStr)
  const now = Date.now()
  return now - stringToMs
}

function isSomeCommitStale(commits, staleDate) {
  return commits.some((commit) => {
    return isStale(commit.commit.committer.date, staleDate)
  })
}

function isStale(date, staleDate) {
  return new Date(date).getTime() < staleDate
}

/** @deprecated */
function daysToMs(days) {
  return days * 24 * 60 * 60 * 1000
}

function parseNotificationSettings(core) {
  let staleDate, notifyAfter

  if (!core.getInput('notify-after') && !core.getInput('stale-days')) {
    return { staleDate: notifyAfterToMs('7 days'), notifyAfter: '7 days' }
  }

  if (core.getInput('notify-after')) {
    notifyAfter = core.getInput('notify-after')
    staleDate = notifyAfterToMs(notifyAfter)
  } else {
    const staleDays = core.getInput('stale-days')
    staleDate = staleDaysToMs(staleDays)

    notifyAfter =
      typeof staleDays === 'number' ? staleDaysToStr(staleDays) : staleDays

    logWarning(
      'stale-days option is deprecated and will be removed in the next major release'
    )
  }

  return { staleDate, notifyAfter }
}

module.exports = {
  isSomeCommitStale,
  daysToMs,
  isStale,
  parseNotificationSettings,
  staleDaysToMs,
  notifyAfterToMs,
  staleDaysToStr,
}
