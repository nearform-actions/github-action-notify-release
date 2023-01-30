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

// tap.test('provides cwd to exec function', async () => {
//   const cwd = './'

//   execStub.resolves(0)
//   execWithOutputModule.execWithOutput('command', [], cwd)
//   execStub.calledWith('command', [], { cwd })
// })

// tap.test('rejects if exit code is not 0', async (t) => {
//   const errorOutput = 'error output'

//   execStub.callsFake((_, __, options) => {
//     options.listeners.stderr(Buffer.from(errorOutput, 'utf8'))

//     return Promise.resolve(1)
//   })

//   t.rejects(execWithOutputModule.execWithOutput('command'))
//   execStub.calledWith('command')
// })
