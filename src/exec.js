'use strict'

const { exec: execAction } = require('@actions/exec')
const { logWarning } = require('./log')

async function exec({ cmd, args, parseType }) {
  let output = ''
  let error = ''

  const execOptions = {
    silent: true,
    listeners: {
      stdout: (data) => {
        output += data
      },
      stderr: (data) => {
        error += data
      }
    },
  }

  try {
    await execAction(cmd, args, execOptions)
  } catch (err) {
    logWarning(err.message)
  }

  if (error) return { error }

  if (parseType === 'json') return { output: JSON.parse(output) }

  return { output }
}

exports.exec = exec
