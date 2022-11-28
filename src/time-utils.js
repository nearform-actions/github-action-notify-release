'use strict'
const ms = require('ms')
const { logWarning } = require('./log')

function notifyAfterToMs(input) {
  const stringToMs = ms(input)
  return Date.now() - stringToMs
}

/** @deprecated */
function staleDaysToStr(days) {
  return `${days} day${days > 1 ? 's' : ''}`
}

function isSomeCommitStale(commits, notifyDate) {
  return commits.some((commit) => {
    return isStale(commit.commit.committer.date, notifyDate)
  })
}

function isStale(date, notifyDate) {
  return new Date(date).getTime() < notifyDate
}

function parseNotificationSettings(core) {
  const staleDays = core.getInput('stale-days')
  const notifyAfter = core.getInput('notify-after')
  if (!notifyAfter && !staleDays) {
    return '7 days'
  }

  if (!notifyAfter) {
    logWarning(
      'stale-days option is deprecated and will be removed in the next major release'
    )
    return typeof staleDays === 'number' ? staleDaysToStr(staleDays) : staleDays
  }

  return notifyAfter
}

module.exports = {
  isSomeCommitStale,
  isStale,
  parseNotificationSettings,
  notifyAfterToMs,
  staleDaysToStr,
}
