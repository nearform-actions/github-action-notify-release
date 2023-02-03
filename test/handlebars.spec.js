'use strict'

const handlebars = require('handlebars')
const { registerHandlebarHelpers } = require('../src/handlebars')

test('registers the "commitMessage" helper', () => {
  const config = { commitMessageLines: 2 }
  registerHandlebarHelpers(config)
  const template = handlebars.compile('{{commitMessage message}}')
  const result = template({ message: 'line 1\nline 2\nline 3' })
  expect(result).toBe('line 1\nline 2')
})

test('limits the "commitMessage" output based on "commitMessageLines"', () => {
  const config = { commitMessageLines: 1 }
  registerHandlebarHelpers(config)
  const template = handlebars.compile('{{commitMessage message}}')
  const result = template({ message: 'line 1\nline 2\nline 3' })
  expect(result).toBe('line 1')
})

test('does not limit the "commitMessage" output if "commitMessageLines" is negative', () => {
  const config = { commitMessageLines: -1 }
  registerHandlebarHelpers(config)
  const template = handlebars.compile('{{commitMessage message}}')
  const result = template({ message: 'line 1\nline 2\nline 3' })
  expect(result).toBe('line 1\nline 2\nline 3')
})

test('registers the "substring" helper', () => {
  registerHandlebarHelpers({})
  const template = handlebars.compile('{{substring message 4}}')
  const result = template({ message: 'hello' })
  expect(result).toBe('hell')
})

test('returns an empty string if "content" is falsy', () => {
  registerHandlebarHelpers({})
  const template = handlebars.compile('{{substring message 4}}')
  const result = template({ message: '' })
  expect(result).toBe('')
})
