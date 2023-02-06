'use strict'

const { isEmptyObject } = require('../src/utils/helper')

test('isEmptyObject: returns true for an empty object', () => {
  const obj = {}
  expect(isEmptyObject(obj)).toBe(true)
})

test('isEmptyObject: returns false for a non-empty object', () => {
  const obj = { name: 'John' }
  expect(isEmptyObject(obj)).toBe(false)
})
