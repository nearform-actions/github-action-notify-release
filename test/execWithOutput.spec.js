'use strict'

const { exec } = require('@actions/exec')

const execWithOutputModule = require('../src/utils/execWithOutput')

jest.mock('@actions/exec', () => ({
  exec: jest.fn(),
}))

test('resolves with output of the exec command if exit code is 0', async () => {
  const output = 'output'

  exec.mockImplementation((_, __, options) => {
    options.listeners.stdout(Buffer.from('output', 'utf8'))

    return Promise.resolve(0)
  })

  await expect(
    execWithOutputModule.execWithOutput('ls', ['-al'])
  ).resolves.toBe(output)

  expect(exec).toHaveBeenCalled()
})

test('Throws with output of the exec command if exit code is not 0', async () => {
  const output = 'output'

  exec.mockImplementation((_, __, options) => {
    options.listeners.stderr(Buffer.from(output, 'utf8'))
    return Promise.reject(new Error())
  })

  await expect(
    execWithOutputModule.execWithOutput('ls', ['-al'])
  ).rejects.toThrow(`ls -al returned code 1 \nSTDOUT: \nSTDERR: ${output}`)

  expect(exec).toHaveBeenCalled()
})

test('provides cwd to exec function', async () => {
  const cwd = './'

  exec.mockImplementation(() => {
    return Promise.resolve(0)
  })
  execWithOutputModule.execWithOutput('command', [], { cwd })

  expect(exec).toHaveBeenCalledWith(
    'command',
    [],
    expect.objectContaining({ cwd })
  )
})

test('rejects if exit code is not 0', async () => {
  const errorOutput = 'error output'
  exec.mockImplementation((_, __, options) => {
    options.listeners.stderr(Buffer.from(errorOutput, 'utf8'))

    return Promise.resolve(1)
  })

  await expect(execWithOutputModule.execWithOutput('command')).rejects.toThrow()
})
