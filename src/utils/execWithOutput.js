// Borrowed from https://github.com/nearform-actions/optic-release-automation-action/blob/main/src/utils/execWithOutput.js

import { StringDecoder } from 'node:string_decoder'

import { exec } from '@actions/exec'

export async function execWithOutput(cmd, args, { cwd } = {}) {
  let output = ''
  let errorOutput = ''

  const stdoutDecoder = new StringDecoder('utf8')
  const stderrDecoder = new StringDecoder('utf8')

  const options = {
    silent: false,
  }

  /* istanbul ignore else */
  if (cwd !== '') {
    options.cwd = cwd
  }

  options.listeners = {
    stdout: (data) => {
      output += stdoutDecoder.write(data)
    },
    stderr: (data) => {
      errorOutput += stderrDecoder.write(data)
    },
  }

  let code = 0
  try {
    code = await exec(cmd, args, options)
  } catch {
    code = 1
  }

  output += stdoutDecoder.end()
  errorOutput += stderrDecoder.end()

  if (code === 0) {
    return output.trim()
  }

  throw new Error(
    `${cmd} ${args.join(
      ' '
    )} returned code ${code} \nSTDOUT: ${output}\nSTDERR: ${errorOutput}`
  )
}
