'use strict'

function isEmptyObject(obj) {
  return JSON.stringify(obj) === JSON.stringify({})
}

module.exports = {
  isEmptyObject,
}
