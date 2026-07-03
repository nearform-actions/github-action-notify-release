import * as core from '@actions/core'
import toolkit from 'actions-toolkit'
import { context } from '@actions/github'
import { parseNotifyAfter } from './time-utils.js'
import { runAction } from './release-notify-action.js'
import {
  getIsSnoozingIssue,
  getIsClosingIssue,
  addSnoozingComment,
} from './issue.js'
import { logInfo } from './log.js'

export async function run({ inputs }) {
  try {
    toolkit.logActionRefWarning()
    toolkit.logRepoWarning()

    const token = inputs['github-token']

    const notifyAfter = parseNotifyAfter(
      inputs['notify-after'],
      inputs['stale-days']
    )

    const isSnoozing = getIsSnoozingIssue(context)

    if (isSnoozing) {
      logInfo('Snoozing issue ...')
      const { number } = context.issue
      return addSnoozingComment(token, notifyAfter, number)
    }

    const isClosing = getIsClosingIssue(context)
    if (isClosing) {
      logInfo('Closing issue. Nothing to do ...')
      return
    }

    logInfo('Workflow dispatched or release published ...')

    const commitMessageLines = Number(inputs['commit-messages-lines'])
    await runAction({
      token,
      ignoreSnoozed: context.eventName === 'workflow_dispatch',
      notifyAfter,
      commitMessageLines,
    })
  } catch (err) {
    core.setFailed(err)
  }
}
