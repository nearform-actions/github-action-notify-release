'use strict'

const ISSUE_LABEL = 'notify-release'
const ISSUE_TITLE = 'Release pending!'
const STATE_OPEN = 'open'
const STATE_CLOSED = 'closed'
const STATE_CLOSED_NOT_PLANNED = 'not_planned'
const ISSUES_EVENT_NAME = 'issues'

module.exports = {
  ISSUE_LABEL,
  ISSUE_TITLE,
  STATE_OPEN,
  STATE_CLOSED,
  STATE_CLOSED_NOT_PLANNED,
  ISSUES_EVENT_NAME,
}
