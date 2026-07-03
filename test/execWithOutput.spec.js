'use strict'

const { test, mock } = require('node:test')
const assert = require('node:assert/strict')

const exec = mock.fn()

mock.module('@actions/exec', {
  namedExports: {
    exec,
  },
})

const execWithOutputModule = require('../src/utils/execWithOutput')

test('resolves with output of the exec command if exit code is 0', async () => {
  const output = 'output'

  exec.mock.mockImplementation((_, __, options) => {
    options.listeners.stdout(Buffer.from('output', 'utf8'))

    return Promise.resolve(0)
  })

  assert.strictEqual(
    await execWithOutputModule.execWithOutput('ls', ['-al']),
    output
  )

  assert.ok(exec.mock.callCount() > 0)
})

test('Throws with output of the exec command if exit code is not 0', async () => {
  const output = 'output'

  exec.mock.mockImplementation((_, __, options) => {
    options.listeners.stderr(Buffer.from(output, 'utf8'))
    return Promise.reject(new Error())
  })

  await assert.rejects(execWithOutputModule.execWithOutput('ls', ['-al']), {
    message: `ls -al returned code 1 \nSTDOUT: \nSTDERR: ${output}`,
  })

  assert.ok(exec.mock.callCount() > 0)
})

test('provides cwd to exec function', async () => {
  const cwd = './'

  exec.mock.mockImplementation(() => {
    return Promise.resolve(0)
  })
  execWithOutputModule.execWithOutput('command', [], { cwd })

  const lastCall = exec.mock.calls.at(-1)
  assert.strictEqual(lastCall.arguments[0], 'command')
  assert.deepEqual(lastCall.arguments[1], [])
  assert.strictEqual(lastCall.arguments[2].cwd, cwd)
})

test('rejects if exit code is not 0', async () => {
  const errorOutput = 'error output'
  exec.mock.mockImplementation((_, __, options) => {
    options.listeners.stderr(Buffer.from(errorOutput, 'utf8'))

    return Promise.resolve(1)
  })

  await assert.rejects(execWithOutputModule.execWithOutput('command'))
})
